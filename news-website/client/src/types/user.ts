export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'editor' | 'user';
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserListResponse {
  data: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters?: {
    search?: string;
    role?: string;
    isActive?: boolean;
  };
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role: 'admin' | 'editor' | 'user';
  avatar?: string;
}

export interface UpdateUserDto extends Partial<Omit<CreateUserDto, 'password'>> {
  password?: string;
  isActive?: boolean;
}
