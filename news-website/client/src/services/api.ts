import axios, { AxiosInstance, AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';
import { Article } from '../types';

// Xử lý lỗi API
const handleApiError = (error: any, defaultMessage: string = 'Đã xảy ra lỗi') => {
  if (axios.isAxiosError(error)) {
    const serverMessage = error.response?.data?.message || error.response?.data?.error;
    const errorMessage = serverMessage || error.message || defaultMessage;
    
    // Hiển thị thông báo lỗi
    message.error(errorMessage);
    
    // Nếu lỗi 401 (Unauthorized), đăng xuất người dùng
    if (error.response?.status === 401) {
      authApi.logout();
      // Chuyển hướng về trang đăng nhập
      window.location.href = '/login';
    }
    
    return errorMessage;
  }
  
  // Xử lý lỗi không phải từ axios
  const errorMessage = error instanceof Error ? error.message : String(error);
  message.error(errorMessage);
  return errorMessage;
};

// Định nghĩa các kiểu dữ liệu
interface ErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
  [key: string]: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  statusCode?: number;
}

// Lấy base URL từ biến môi trường hoặc sử dụng mặc định
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

// Tạo instance axios
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 giây
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Xử lý request trước khi gửi đi
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Thêm token vào header nếu có
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Thêm timestamp để tránh cache
    if (config.method?.toLowerCase() === 'get') {
      config.params = {
        ...config.params,
        _t: new Date().getTime(),
      };
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Xử lý response
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Xử lý response thành công
    if (response.data) {
      // Nếu response.data đã có cấu trúc {success, data, message} thì trả về luôn
      if (typeof response.data === 'object' && 'success' in response.data) {
        return response.data;
      }
      // Ngược lại, đóng gói vào cấu trúc tiêu chuẩn
      return {
        success: true,
        data: response.data,
      };
    }
    return {
      success: true,
      data: response,
    };
  },
  (error: AxiosError<ErrorResponse>) => {
    // Xử lý lỗi
    if (error.response) {
      const { status, data } = error.response;
      const errorMessage = data?.message || data?.error || 'Đã có lỗi xảy ra';
      
      switch (status) {
        case 401:
          // Xử lý khi hết phiên đăng nhập
          message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          localStorage.removeItem('token');
          // Chuyển hướng về trang đăng nhập
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
          
        case 403:
          message.error('Bạn không có quyền truy cập tài nguyên này');
          break;
          
        case 404:
          message.error('Không tìm thấy tài nguyên');
          break;
          
        case 500:
          message.error('Lỗi máy chủ nội bộ');
          break;
          
        default:
          message.error(errorMessage);
      }
      
      return Promise.reject({
        success: false,
        status,
        message: errorMessage,
        data: data,
      });
    } else if (error.request) {
      // Lỗi không nhận được phản hồi từ server
      message.error('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
      return Promise.reject({
        success: false,
        message: 'Không thể kết nối đến máy chủ',
        isNetworkError: true,
      });
    }
    
    return Promise.reject({
      success: false,
      message: error.message || 'Đã xảy ra lỗi không xác định',
    });
  }
);

// Các hàm tiện ích
const buildQueryString = (params: Record<string, any>): string => {
  const query = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => query.append(`${key}[]`, String(item)));
      } else {
        query.append(key, String(value));
      }
    }
  });
  
  return query.toString();
};

// Chuẩn hóa dữ liệu bài viết
const normalizeArticle = (data: any): Article => {
  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    summary: data.summary || '',
    content: data.content,
    imageUrl: data.imageUrl || data.image?.url || '',
    category: data.category || { id: '', name: 'Khác', slug: 'khac' },
    author: data.author || { id: '', name: 'Admin' },
    publishedAt: data.publishedAt || new Date().toISOString(),
    status: data.status || 'published',
    viewCount: data.viewCount || 0,
    isFeatured: data.isFeatured || false,
    tags: data.tags || [],
    ...data,
  };
};

// Hàm lưu token vào localStorage
const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }
};

// Lấy token từ localStorage khi khởi động
const token = localStorage.getItem('token');
if (token) {
  setAuthToken(token);
}

// API Authentication
const authApi = {
  /**
   * Đăng nhập người dùng
   * @param email Email đăng nhập
   * @param password Mật khẩu
   * @returns Thông tin người dùng và token
   */
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data?.token) {
        setAuthToken(response.data.token);
        
        // Lưu refresh token nếu có
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
      }
      return response;
    } catch (error) {
      handleApiError(error, 'Đăng nhập thất bại');
      throw error;
    }
  },
  
  /**
   * Đăng ký tài khoản mới
   * @param userData Thông tin đăng ký
   * @returns Thông tin người dùng đã đăng ký
   */
  register: async (userData: {
    name: string;
    email: string;
    password: string;
  }) => {
    try {
      const response = await api.post('/auth/register', userData);
      message.success('Đăng ký tài khoản thành công!');
      return response;
    } catch (error) {
      handleApiError(error, 'Đăng ký thất bại');
      throw error;
    }
  },

  /**
   * Lấy thông tin người dùng hiện tại
   * @returns Thông tin người dùng
   */
  getMe: async () => {
    try {
      const response = await api.get('/auth/me');
      return response;
    } catch (error) {
      handleApiError(error, 'Không thể lấy thông tin người dùng');
      throw error;
    }
  },

  /**
   * Đăng xuất người dùng
   */
  logout: () => {
    // Xóa token và refresh token
    setAuthToken(null);
    localStorage.removeItem('refreshToken');
    
    // Xóa thông tin người dùng khác nếu có
    localStorage.removeItem('user');
    
    // Chuyển hướng về trang chủ hoặc trang đăng nhập
    window.location.href = '/';
  },

  /**
   * Làm mới token
   * @returns Token mới
   */
  refreshToken: async (): Promise<string | null> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('Không tìm thấy refresh token');
      }
      
      const response = await api.post('/auth/refresh-token', { refreshToken });
      
      if (response.data?.token) {
        setAuthToken(response.data.token);
        
        // Lưu refresh token mới nếu có
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        
        return response.data.token;
      }
      
      return null;
    } catch (error) {
      // Nếu làm mới token thất bại, đăng xuất người dùng
      authApi.logout();
      return null;
    }
  },
  
  /**
   * Đổi mật khẩu
   * @param currentPassword Mật khẩu hiện tại
   * @param newPassword Mật khẩu mới
   */
  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      const response = await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      
      message.success('Đổi mật khẩu thành công!');
      return response;
    } catch (error) {
      handleApiError(error, 'Đổi mật khẩu thất bại');
      throw error;
    }
  },
  
  // Các hàm cũ, giữ lại cho tương thích ngược
  getMeOld: async (): Promise<ApiResponse<{ user: any }>> => {
    try {
      const response = await authApi.getMe();
      return {
        success: true,
        data: response.data,
        statusCode: response.status
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        statusCode: 500
      };
    }
  },
  
  logoutOld: (): void => {
    authApi.logout();
  },
  
  refreshTokenOld: async (): Promise<ApiResponse<{ token: string }>> => {
    const token = await authApi.refreshToken();
    return { success: !!token, data: { token: token || '' } };
  },
};

// Interface cho tham số phân trang
interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Interface cho kết quả phân trang
interface PaginationResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Interface cho tham số lọc bài viết
interface ArticleFilterParams extends PaginationParams {
  category?: string;
  search?: string;
  status?: string;
  isFeatured?: boolean;
}

// API Articles
const articleApi = {
  // Lấy danh sách bài viết
  getArticles: async (params: ArticleFilterParams = {}): Promise<ApiResponse<{ articles: Article[]; total: number }>> => {
    const query = buildQueryString({
      page: params.page || 1,
      limit: params.limit || 10,
      ...(params.category && { category: params.category }),
      ...(params.search && { search: params.search }),
      sortBy: params.sortBy || 'publishedAt',
      sortOrder: params.sortOrder || 'desc',
    });
    
    return api.get(`/articles?${query}`);
  },
  
  // Lấy chi tiết bài viết
  getArticleById: async (id: string | number): Promise<ApiResponse<Article>> => {
    return api.get(`/articles/${id}`);
  },
  
  // Tạo bài viết mới
  createArticle: async (articleData: Partial<Article>): Promise<ApiResponse<Article>> => {
    return api.post('/articles', articleData);
  },
  
  // Cập nhật bài viết
  updateArticle: async (id: string | number, articleData: Partial<Article>): Promise<ApiResponse<Article>> => {
    return api.put(`/articles/${id}`, articleData);
  },
  
  // Xóa bài viết
  deleteArticle: async (id: string | number): Promise<ApiResponse<void>> => {
    return api.delete(`/articles/${id}`);
  },
  
  // Lấy danh sách danh mục
  getCategories: async (): Promise<ApiResponse<Array<{ id: string; name: string; slug: string }>>> => {
    return api.get('/articles/categories');
  },
  
  // Lấy bài viết theo danh mục
  getArticlesByCategory: async (
    category: string,
    params: Omit<ArticleFilterParams, 'category'> = {}
  ): Promise<PaginationResult<Article>> => {
    const query = buildQueryString({
      page: params.page || 1,
      limit: params.limit || 10,
      ...(params.search && { search: params.search }),
      ...(params.status && { status: params.status }),
      ...(params.isFeatured !== undefined && { isFeatured: params.isFeatured }),
      sortBy: params.sortBy || 'publishedAt',
      sortOrder: params.sortOrder || 'desc',
    });
    
    const response = await api.get(`/articles/category/${category}?${query}`);
    return {
      data: response.data.articles.map(normalizeArticle),
      pagination: response.data.pagination,
    };
  },
  
  // Lấy tin tức mới nhất
  getLatestNews: async (
    params: Omit<ArticleFilterParams, 'sortBy' | 'sortOrder'> = {}
  ): Promise<PaginationResult<Article>> => {
    const query = buildQueryString({
      page: params.page || 1,
      limit: params.limit || 10,
      ...(params.category && { category: params.category }),
      ...(params.search && { search: params.search }),
      sortBy: 'publishedAt',
      sortOrder: 'desc',
    });
    
    const response = await api.get(`/articles/latest?${query}`);
    return {
      data: response.data.articles.map(normalizeArticle),
      pagination: response.data.pagination,
    };
  },
  
  // Tìm kiếm bài viết
  searchArticles: async (
    query: string, 
    { page = 1, limit = 10, category, sort = '-publishedAt' }: {
      page?: number;
      limit?: number;
      category?: string;
      sort?: string;
    } = {}
  ): Promise<PaginationResult<Article>> => {
    const params = {
      q: query,
      page,
      limit,
      ...(category && { category }),
      sort,
    };
    
    const response = await api.get('/search', { params });
    return {
      data: response.data.results.map(normalizeArticle),
      pagination: response.data.pagination,
    };
  },
  
  // Lấy URL logo
  getLogoUrl: async (): Promise<string> => {
    const response = await api.get('/settings/logo');
    return response.data.url;
  },
};

// API Users
const userApi = {
  // Lấy thông tin người dùng hiện tại
  getProfile: async (): Promise<ApiResponse<{ user: any }>> => {
    return api.get('/users/me');
  },
  
  // Cập nhật thông tin người dùng
  updateProfile: async (userData: any): Promise<ApiResponse<{ user: any }>> => {
    return api.put('/users/me', userData);
  },
  
  // Đổi mật khẩu
  changePassword: async (
    currentPassword: string, 
    newPassword: string
  ): Promise<ApiResponse<void>> => {
    return api.put('/users/change-password', { currentPassword, newPassword });
  },
};

// Hàm lấy base URL từ biến môi trường
const getApiBaseUrl = (): string => {
  return process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';
};

// Kết hợp tất cả các API
export const apiService = {
  ...authApi,
  ...articleApi,
  ...userApi,
  
  // Các hàm tiện ích
  buildQueryString,
  normalizeArticle,
  getApiBaseUrl
};

// Xuất các hàm cần thiết để tương thích ngược
export { 
  buildQueryString,
  normalizeArticle,
  getApiBaseUrl,
  articleApi as articleApi,
  userApi as userApi,
  authApi as authApi
};

// Xuất các hàm từ articleApi để tương thích ngược
export const { 
  getArticlesByCategory,
  searchArticles 
} = articleApi;

// Xuất instance axios đã được cấu hình
export default api;
