import { 
  IsEmail, 
  IsEnum, 
  IsOptional, 
  IsString, 
  MinLength, 
  IsBoolean, 
  IsDateString
} from 'class-validator';
import { UserRole, UserStatus } from '../types';
import { BaseQueryParams, BaseResponseDto, PaginatedResponse, BaseCreateUpdateDto } from './base.dto';

// Query parameters cho danh sách user
export class UserQueryParams extends BaseQueryParams {
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}

// DTO cho việc tạo user mới
export class CreateUserDto extends BaseCreateUpdateDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsEnum(UserRole)
  @IsOptional()
  role: UserRole = UserRole.USER;
}

// DTO cho việc cập nhật user
export class UpdateUserDto extends BaseCreateUpdateDto {
  @IsString()
  @MinLength(2)
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;
}

// DTO cho việc đăng nhập
export class LoginUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

// DTO cho việc quên mật khẩu
export class ForgotPasswordDto {
  @IsEmail()
  email!: string;
}

// DTO cho việc đặt lại mật khẩu
export class ResetPasswordDto {
  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  token!: string;
}

// DTO cho việc xác thực email
export class VerifyEmailDto {
  @IsString()
  token!: string;
}

// Interface cho thông tin bài viết trong response
export interface ArticleResponse {
  id: number;
  title: string;
  status: string;
  publishedAt?: Date;
}

// DTO cho response thông tin user
export class UserResponseDto extends BaseResponseDto {
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  imageUrl?: string;
  lastLogin?: Date;
  status?: string;
  bio?: string;
  website?: string;
  location?: string;
  articles?: ArticleResponse[];

  constructor(user: {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    isVerified: boolean;
    imageUrl?: string | null;
    lastLogin?: Date | null;
    status?: string | null;
    bio?: string | null;
    website?: string | null;
    location?: string | null;
    articles?: Array<{
      id: number;
      title: string;
      status: string;
      publishedAt?: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
  }) {
    super(user);
    this.name = user.name;
    this.email = user.email;
    this.role = user.role;
    this.isVerified = user.isVerified;
    this.imageUrl = user.imageUrl || undefined;
    this.lastLogin = user.lastLogin || undefined;
    this.status = user.status || undefined;
    this.bio = user.bio || undefined;
    this.website = user.website || undefined;
    this.location = user.location || undefined;
    this.articles = user.articles || [];
  }
}

// DTO cho response danh sách user có phân trang
export class PaginatedUserResponseDto extends PaginatedResponse<UserResponseDto> {
  constructor(
    users: UserResponseDto[], 
    pagination: { total: number; page: number; limit: number }
  ) {
    super(users, pagination);
  }
}
