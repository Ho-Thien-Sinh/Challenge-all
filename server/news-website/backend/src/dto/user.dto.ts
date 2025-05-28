import { 
  IsEmail, 
  IsEnum, 
  IsOptional, 
  IsString, 
  MinLength, 
  IsBoolean, 
  IsDateString, 
  IsNumber, 
  Min, 
  IsIn 
} from 'class-validator';
import { UserRole } from '../models';
import { Transform } from 'class-transformer';

// Query parameters for user listing
export class UserQueryParams {
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @IsNumber()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 10;

  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}

export class CreateUserDto {
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

export class UpdateUserDto {
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
}

export class LoginUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  token!: string;
}

export class VerifyEmailDto {
  @IsString()
  token!: string;
}

export interface ArticleResponse {
  id: number;
  title: string;
  status: string;
  publishedAt?: Date;
}

export class UserResponseDto {
  id: number;
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
  createdAt: Date;
  updatedAt: Date;

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
    this.id = user.id;
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
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}

// Response DTO for paginated user list
export class PaginatedUserResponseDto {
  success: boolean;
  data: UserResponseDto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  constructor(
    users: UserResponseDto[], 
    pagination: { total: number; page: number; limit: number }
  ) {
    this.success = true;
    this.data = users;
    this.pagination = {
      ...pagination,
      totalPages: Math.ceil(pagination.total / pagination.limit)
    };
  }
}
