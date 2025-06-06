import axios, { AxiosError } from 'axios';
import { Article } from '../types';

// Định nghĩa kiểu dữ liệu cho bài viết từ Tuổi Trẻ
export type TuoiTreArticle = Omit<Article, 'category'> & {
  url?: string;  // Make url optional to match the original type
  category?: string; // Make category optional in TuoiTreArticle
};

// Cấu hình API
const API_CONFIG = {
  baseURL: 'http://localhost:3001/api/v1', // Đã cập nhật về cổng 3001 để đồng bộ với cấu hình chung
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
};

// Định nghĩa kiểu dữ liệu cho kết quả phân trang
interface PaginationResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

// Danh sách danh mục tin tức
export const NEWS_CATEGORIES = [
  { id: 'thoi-su', name: 'Thời sự' },
  { id: 'the-gioi', name: 'Thế giới' },
  { id: 'kinh-doanh', name: 'Kinh doanh' },
  { id: 'the-thao', name: 'Thể thao' },
  { id: 'giai-tri', name: 'Giải trí' },
  { id: 'phap-luat', name: 'Pháp luật' },
  { id: 'giao-duc', name: 'Giáo dục' },
  { id: 'suc-khoe', name: 'Sức khỏe' },
  { id: 'doi-song', name: 'Đời sống' },
  { id: 'du-lich', name: 'Du lịch' },
  { id: 'khoa-hoc', name: 'Khoa học' },
  { id: 'so-hoa', name: 'Số hóa' },
  { id: 'xe', name: 'Xe' },
  { id: 'y-kien', name: 'Ý kiến' },
  { id: 'tam-su', name: 'Tâm sự' },
  { id: 'cuoi', name: 'Cười' },
];

// Tạo instance axios với cấu hình mặc định
const apiClient = axios.create(API_CONFIG);

// Định nghĩa kiểu dữ liệu cho phản hồi tin tức
export interface NewsResponse {
  // Dữ liệu từ backend
  success?: boolean;
  count?: number;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  data?: TuoiTreArticle[];
  
  // Dữ liệu cũ để tương thích ngược
  articles?: TuoiTreArticle[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  
  // Thông tin lỗi
  error?: string | {
    message: string;
    code?: string;
  };
  message?: string;
  code?: string;
  stack?: string;
  
  // Thống kê (nếu có)
  stats?: {
    totalArticles: number;
    articlesWithoutImage: number;
    articlesWithoutDescription: number;
    articlesWithoutBoth: number;
  };
}

// Request interceptor để thêm token nếu có
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý lỗi chung
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Xử lý lỗi từ server
      const { status, data } = error.response;
      console.error(`Lỗi từ server: ${status}`, data);
      
      // Xử lý lỗi 401 (Unauthorized)
      if (status === 401) {
        console.error('Lỗi xác thực. Vui lòng đăng nhập lại.');
      }
    } else if (error.request) {
      // Không nhận được phản hồi từ server
      console.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
    } else {
      // Lỗi khi thiết lập request
      console.error('Lỗi khi thiết lập yêu cầu:', error.message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Chuẩn hóa dữ liệu bài viết từ API thành định dạng thống nhất
 */
const normalizeArticle = (article: any): TuoiTreArticle => {
  if (!article) {
    return {
      id: '',
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      imageUrl: '',
      category: 'other',
      author: 'Tuổi Trẻ',
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewCount: 0,
      tags: [],
      status: 'published',
      featured: false,
      description: '',
      source: 'Tuổi Trẻ',
      url: '',
      sourceUrl: '',
      readingTime: 0,
      commentsCount: 0,
      likesCount: 0,
      sharesCount: 0,
      metaTitle: '',
      metaDescription: '',
      metaKeywords: [],
      images: [],
      categories: ['other']
    };
  }
  
  // Tạo slug từ tiêu đề nếu không có
  const slug = article.slug || 
    (article.title ? 
      article.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
      : '');
  
  return {
    id: article.id || '',
    title: article.title || '',
    slug: slug,
    excerpt: article.excerpt || article.description || '',
    description: article.description || article.excerpt || '',
    content: article.content || '',
    imageUrl: article.imageUrl || article.image || '',
    category: article.category || 'other',
    author: article.author || 'Tuổi Trẻ',
    publishedAt: article.publishedAt || article.pubDate || new Date().toISOString(),
    updatedAt: article.updatedAt || article.pubDate || new Date().toISOString(),
    viewCount: article.viewCount || 0,
    tags: Array.isArray(article.tags) ? article.tags : (article.tags ? [article.tags] : []),
    status: (['draft', 'published', 'archived'].includes(article.status) ? article.status : 'published') as 'draft' | 'published' | 'archived',
    featured: Boolean(article.featured),
    source: article.source || 'Tuổi Trẻ',
    url: article.url || '',
    sourceUrl: article.sourceUrl || article.url || '',
    readingTime: article.readingTime || Math.ceil((article.content || '').split(/\s+/).length / 200), // Ước tính thời gian đọc
    commentsCount: article.commentsCount || 0,
    likesCount: article.likesCount || 0,
    sharesCount: article.sharesCount || 0,
    metaTitle: article.metaTitle || article.title || '',
    metaDescription: article.metaDescription || article.description || article.excerpt || '',
    metaKeywords: Array.isArray(article.metaKeywords) ? article.metaKeywords : 
                  (article.metaKeywords ? [article.metaKeywords] : []),
    images: Array.isArray(article.images) ? article.images : 
           (article.images ? [article.images] : []),
    videoUrl: article.videoUrl || '',
    categories: Array.isArray(article.categories) ? article.categories :
               (article.category ? [article.category] : ['other']),
  };
};

/**
 * Lấy danh sách tin tức từ API
 * @param params Tham số phân trang và lọc
 * @returns Danh sách tin tức đã được phân trang
 */
const fetchTuoitreNews = async (params: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: string;
  [key: string]: any; // Cho phép các tham số tùy chỉnh khác
} = {}): Promise<NewsResponse> => {
  try {
    const { page = 1, limit = 10, category, search, sortBy, ...rest } = params;

    // Xây dựng query parameters
    const queryParams: Record<string, any> = {
      page,
      limit,
      ...(search && { search }),  // Changed from 'q' to 'search' to match backend
      ...(sortBy && { sortBy }),   // Changed from 'sort' to 'sortBy' to match backend
      ...rest
    };

    let response;
    
    // Nếu có category, gọi endpoint theo category
    if (category) {
      response = await apiClient.get<NewsResponse>(`/articles/category/${category}`, { params: queryParams });
    } else {
      // Nếu không có category, gọi endpoint mặc định
      response = await apiClient.get<NewsResponse>('/articles', { params: queryParams });
    }

    // Xử lý dữ liệu trả về từ backend
    const responseData = response.data || {};
    let articles: TuoiTreArticle[] = [];
    let total = 0;
    
    // Xử lý định dạng phản hồi từ backend
    if (responseData.success && Array.isArray(responseData.data)) {
      articles = responseData.data;
      total = responseData.pagination?.total || 0;
    } else if (Array.isArray(responseData)) {
      // Fallback nếu response là mảng trực tiếp
      articles = responseData;
      total = responseData.length;
    }
    
    // Chuẩn hóa dữ liệu bài viết
    const normalizedArticles = articles.map(article => 
      normalizeArticle(article)
    );
    
    // Trả về kết quả đã được phân trang
    return {
      articles: normalizedArticles,
      total,
      page: responseData.pagination?.page || page,
      limit: responseData.pagination?.limit || limit,
      totalPages: responseData.pagination?.totalPages || Math.ceil(total / limit)
    };
  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách tin tức:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
    });
    
    // Trả về dữ liệu mẫu nếu có lỗi
    const mockData = {
      articles: [],
      total: 0,
      page: params.page || 1,
      limit: params.limit || 10,
      totalPages: 1,
    };
    
    // Nếu lỗi kết nối, thêm thông báo gợi ý
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Không thể kết nối đến server. Vui lòng kiểm tra:');
      console.error('1. Đảm bảo server backend đang chạy');
      console.error('2. Kiểm tra lại địa chỉ API:', API_CONFIG.baseURL);
      console.error('3. Kiểm tra kết nối mạng');
    }
    
    return mockData;
  }
};

/**
 * Lấy bài viết theo ID
 */
const fetchNewsById = async (id: string): Promise<TuoiTreArticle | null> => {
  try {
    const response = await apiClient.get(`/api/news/tuoitre/${id}`);
    
    if (!response.data) {
      throw new Error('Không tìm thấy bài viết');
    }
    
    // Đảm bảo dữ liệu trả về có đủ các trường bắt buộc
    const articleData = {
      ...response.data,
      category: response.data.category || 'other',
      tags: response.data.tags || [],
      status: response.data.status || 'published',
      featured: response.data.featured || false,
      description: response.data.description || '',
    };
    
    return normalizeArticle(articleData);
  } catch (error) {
    console.error(`Lỗi khi lấy bài viết ${id}:`, error);
    return null;
  }
};

/**
 * Tìm kiếm bài viết
 */
export const searchArticles = async (query: string, page: number = 1, limit: number = 10): Promise<PaginationResult<TuoiTreArticle>> => {
  try {
    const response = await apiClient.get(`/articles/tuoitre/search`, {
      params: {
        q: query,
        page,
        limit
      }
    });

    return {
      data: response.data.data || [],
      pagination: {
        total: response.data.count || 0,
        page: parseInt(page.toString(), 10),
        limit: parseInt(limit.toString(), 10),
        totalPages: Math.ceil((response.data.count || 0) / limit)
      }
    };
  } catch (error) {
    console.error('Lỗi khi tìm kiếm bài viết:', error);
    throw error;
  }
};

/**
 * Lấy chi tiết một bài viết
 * @param id ID của bài viết
 * @returns Thông tin chi tiết bài viết hoặc null nếu không tìm thấy
 */
export const getArticleDetail = async (id: string): Promise<TuoiTreArticle | null> => {
  try {
    const response = await apiClient.get(`/news/tuoitre/${id}`);
    
    if (!response.data) {
      throw new Error('Không tìm thấy bài viết');
    }
    
    // Đảm bảo dữ liệu trả về có đủ các trường bắt buộc
    const articleData = {
      ...response.data,
      category: response.data.category || 'other',
      tags: response.data.tags || [],
      status: response.data.status || 'published',
      featured: response.data.featured || false,
      description: response.data.description || '',
    };
    
    return normalizeArticle(articleData);
  } catch (error) {
    console.error(`Lỗi khi lấy chi tiết bài viết ${id}:`, error);
    return null;
  }
};

/**
 * Tìm kiếm tin tức
 * @param query Từ khóa tìm kiếm
 * @returns Kết quả tìm kiếm đã phân trang
 */
export const searchNews = async (query: string): Promise<PaginationResult<TuoiTreArticle>> => {
  try {
    const response = await apiClient.get<NewsResponse>(`/news/tuoitre`, {
      params: {
        search: query,
        limit: 10,
        page: 1,
      },
    });
    
    const data = response.data;
    
    // Đảm bảo mỗi bài viết có đầy đủ các trường bắt buộc
    const processedArticles = (data.articles || []).map(article => {
      // Tạo một đối tượng mới với các giá trị mặc định
      const articleData: Partial<TuoiTreArticle> = {
        ...article, // Giữ nguyên dữ liệu từ API
        // Thêm các trường bắt buộc nếu chưa có
        category: article.category || 'other',
        tags: article.tags || [],
        status: article.status || 'published',
        featured: article.featured || false,
        description: article.description || '',
      };
      
      const normalized = normalizeArticle(articleData);
      
      // Đảm bảo URL luôn có giá trị
      if (!normalized.url) {
        normalized.url = `/tin-tuc/${normalized.id}`;
      }
      return normalized;
    });
    
    return {
      data: processedArticles,
      pagination: {
        total: data.total || 0,
        page: data.page || 1,
        limit: data.limit || 10,
        totalPages: data.totalPages || 1,
      },
    };
  } catch (error) {
    console.error('Lỗi khi tìm kiếm tin tức:', error);
    // Fallback to mock data in case of error
    const mockArticles: TuoiTreArticle[] = [
      {
        id: '1',
        title: 'Bài viết mẫu 1',
        description: 'Đây là mô tả ngắn cho bài viết mẫu 1',
        content: 'Nội dung đầy đủ của bài viết mẫu 1...',
        imageUrl: 'https://via.placeholder.com/300x200',
        publishedAt: new Date().toISOString(),
        source: 'Tự động',
        author: 'Hệ thống',
        slug: 'bai-viet-mau-1',
        excerpt: 'Đây là mô tả ngắn cho bài viết mẫu 1',
        updatedAt: new Date().toISOString(),
        viewCount: 0,
        tags: ['mau'],
        status: 'published',
        featured: false,
        readingTime: 2,
        commentsCount: 0,
        likesCount: 0,
        sharesCount: 0,
        categories: ['Mẫu'],
      },
      {
        id: '2',
        title: 'Bài viết mẫu 2',
        description: 'Đây là mô tả ngắn cho bài viết mẫu 2',
        content: 'Nội dung đầy đủ của bài viết mẫu 2...',
        imageUrl: 'https://via.placeholder.com/300x200',
        publishedAt: new Date().toISOString(),
        source: 'Tự động',
        author: 'Hệ thống',
        slug: 'bai-viet-mau-2',
        excerpt: 'Đây là mô tả ngắn cho bài viết mẫu 2',
        updatedAt: new Date().toISOString(),
        viewCount: 0,
        tags: ['mau'],
        status: 'published',
        featured: false,
        readingTime: 2,
        commentsCount: 0,
        likesCount: 0,
        sharesCount: 0,
      },
    ];
    
    return {
      data: mockArticles,
      pagination: {
        total: mockArticles.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    };
  }
};

/**
 * Tìm kiếm bài viết liên quan
 * @param articleId ID của bài viết hiện tại
 * @param limit Số lượng bài viết liên quan tối đa (mặc định: 4)
 * @returns Danh sách bài viết liên quan
 */
export const getRelatedNews = async (articleId: string, limit: number = 4): Promise<TuoiTreArticle[]> => {
  try {
    // Thử gọi API tìm kiếm
    const response = await apiClient.get<{ articles: TuoiTreArticle[] }>('/api/articles/related', {
      params: {
        articleId,
        limit: Math.max(limit, 4),
      },
    });

    // Xử lý dữ liệu trả về
    return (response.data.articles || []).map(article => {
      // Tạo đối tượng bài viết với các giá trị mặc định
      const articleData = {
        ...article,
        title: article.title || 'Không có tiêu đề',
        excerpt: article.excerpt || 'Không có mô tả',
        imageUrl: article.imageUrl || '/placeholder-image.jpg',
        url: article.url || `/tin-tuc/${article.id}`,
        publishedAt: article.publishedAt || new Date().toISOString(),
        source: (article as any).source || 'Nguồn không xác định',
        author: article.author || 'Không rõ tác giả',
        category: article.category || 'Chưa phân loại',
        tags: article.tags || [],
        status: article.status || 'published',
        featured: article.featured || false,
        description: article.description || '',
      };
      
      // Chuẩn hóa bài viết
      return normalizeArticle(articleData);
    });
  } catch (error) {
    console.error('Lỗi khi lấy bài viết liên quan:', error);
    return [];
  }
};

/**
 * Lấy tin theo danh mục
 * @param categoryId ID của danh mục
 * @param page Trang hiện tại (mặc định: 1)
 * @param limit Số lượng bài viết mỗi trang (mặc định: 10)
 * @returns Kết quả phân trang các bài viết thuộc danh mục
 */
export const fetchNewsByCategory = async (
  categoryId: string, 
  page: number = 1, 
  limit: number = 10
): Promise<PaginationResult<TuoiTreArticle>> => {
  try {
    // Gọi API để lấy danh sách bài viết theo danh mục
    const response = await apiClient.get<any>(
      `/articles`, 
      { 
        params: { 
          category: categoryId,
          page, 
          limit,
          status: 'published', // Chỉ lấy bài viết đã xuất bản
          sortBy: '-publishedAt' // Mới nhất trước
        } 
      }
    );

    // Xử lý dữ liệu trả về
    let articles: TuoiTreArticle[] = [];
    let total = 0;
    
    // Kiểm tra cấu trúc phản hồi
    const responseData = response.data || {};
    
    if (Array.isArray(responseData.data) && responseData.pagination) {
      // Định dạng từ API mới
      articles = responseData.data;
      total = responseData.pagination.total || 0;
    } else if (Array.isArray(responseData.articles)) {
      // Định dạng cũ với trường articles
      articles = responseData.articles;
      total = responseData.total || 0;
    } else if (Array.isArray(responseData)) {
      // Nếu response là mảng trực tiếp
      articles = responseData;
      total = responseData.length;
    }
    
    // Chuẩn hóa dữ liệu bài viết
    const normalizedArticles = articles.map(article => 
      normalizeArticle({
        ...article,
        // Đảm bảo category được thiết lập đúng
        category: article.category || categoryId
      })
    );
    
    // Trả về kết quả đã được phân trang
    return {
      data: normalizedArticles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil((total || 0) / limit),
      },
    };
  } catch (error) {
    console.error(`Lỗi khi lấy tin theo danh mục ${categoryId}:`, error);
    // Trả về đối tượng rỗng nếu có lỗi
    return {
      data: [],
      pagination: {
        total: 0,
        page,
        limit,
        totalPages: 0,
      },
    };
  }
};

/**
 * Fetches news with stats
 */
const fetchNewsWithStats = async (options: {
  retryCount?: number;
  timeout?: number;
  category?: string;
  limit?: number;
} = {}): Promise<NewsResponse> => {
  const response = await fetchTuoitreNews(options);
  
  // Đảm bảo mỗi bài viết có đầy đủ các trường bắt buộc
  if (response.articles) {
    response.articles = response.articles.map(article => {
      const articleData = {
        ...article,
        category: article.category || 'other',
        tags: article.tags || [],
        status: article.status || 'published',
        featured: article.featured || false,
        description: article.description || '',
      };
      return normalizeArticle(articleData);
    });
  }
  
  return response;
};

// Export all functions as named exports
// Đối tượng chứa tất cả các dịch vụ liên quan đến Tuổi Trẻ
export const tuoitreService = {
  fetchTuoitreNews,
  fetchNewsById,
  searchNews,
  searchArticles,
  fetchNewsByCategory,
  fetchNewsWithStats,
  getArticleDetail,
  getRelatedNews,
  NEWS_CATEGORIES,
};

export default tuoitreService;
