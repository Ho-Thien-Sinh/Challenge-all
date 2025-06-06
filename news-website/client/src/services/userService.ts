import api from './api';
import { userApi } from './api';
import { 
  User, 
  UserListResponse, 
  CreateUserDto, 
  UpdateUserDto 
} from '../types/user';

// Hàm chuyển đổi dữ liệu người dùng nếu cần
const mapUserData = (user: any): User => {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    avatar: user.avatar || '',
    role: user.role || 'user',
    isActive: user.isActive !== undefined ? user.isActive : true,
    createdAt: user.createdAt || new Date().toISOString(),
    updatedAt: user.updatedAt || new Date().toISOString(),
    ...user // Giữ nguyên các trường khác nếu có
  };
};

const userService = {
  /**
   * Lấy danh sách người dùng với phân trang, tìm kiếm, lọc và sắp xếp
   */
  getUsers: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<UserListResponse> => {
    try {
      // Sử dụng api instance để gọi API
      const response = await api.get('/users', {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search,
          role: params.role,
          isActive: params.isActive,
          sortBy: params.sortField,
          sortOrder: params.sortOrder || 'asc'
        }
      });

      // Chuyển đổi dữ liệu
      const users = (response.data?.data?.users || []).map(mapUserData);
      const total = response.data?.data?.total || 0;
      const page = params.page || 1;
      const limit = params.limit || 10;

      return {
        data: users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Lỗi khi lấy danh sách người dùng:', error);
      return {
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0
        }
      };
    }
  },

  /**
   * Lấy thông tin chi tiết người dùng theo ID
   */
  getUserById: async (id: string): Promise<User> => {
    try {
      const response = await api.get(`/users/${id}`);
      return mapUserData(response.data?.data || {});
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
      throw error;
    }
  },

  /**
   * Tạo mới người dùng
   */
  createUser: async (userData: CreateUserDto): Promise<User> => {
    try {
      // Chuyển đổi dữ liệu từ CreateUserDto sang định dạng phù hợp với API
      // Sử dụng email làm username nếu không có username
      const username = userData.email.split('@')[0];
      const userToCreate = {
        name: username,
        email: userData.email,
        password: userData.password,
        role: userData.role || 'user',
        isActive: true
      };
      
      const response = await api.post('/users', userToCreate);
      return mapUserData(response.data?.data || {});
    } catch (error) {
      console.error('Lỗi khi tạo người dùng mới:', error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin người dùng
   */
  updateUser: async (id: string, userData: UpdateUserDto): Promise<User> => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return mapUserData(response.data?.data || {});
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin người dùng:', error);
      throw error;
    }
  },

  /**
   * Xóa người dùng
   */
  deleteUser: async (id: string): Promise<void> => {
    try {
      await api.delete(`/users/${id}`);
    } catch (error) {
      console.error('Lỗi khi xóa người dùng:', error);
      throw error;
    }
  },

  /**
   * Khóa/mở khóa tài khoản người dùng
   */
  toggleUserStatus: async (id: string, isActive: boolean): Promise<User> => {
    try {
      const response = await api.patch(`/users/${id}/status`, { isActive });
      return mapUserData(response.data?.data || {});
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái người dùng:', error);
      throw error;
    }
  },

  /**
   * Đổi mật khẩu người dùng
   */
  changePassword: async (_id: string, currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await userApi.changePassword(currentPassword, newPassword);
    } catch (error) {
      console.error('Lỗi khi đổi mật khẩu:', error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin cá nhân
   */
  updateProfile: async (_id: string, profileData: Partial<{
    fullName: string;
    email: string;
    avatar: string;
  }>): Promise<User> => {
    try {
      const response = await userApi.updateProfile(profileData);
      return mapUserData(response.data?.user || {});
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin cá nhân:', error);
      throw error;
    }
  },
};

export default userService;
