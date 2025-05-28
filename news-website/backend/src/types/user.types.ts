import { BaseAttributes, BaseModelInstance, BaseModel, BaseQueryOptions } from './base.types';
import { UserRole, UserStatus } from './index';

// Interface cho attributes của User
export interface UserAttributes extends BaseAttributes {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isVerified: boolean;
  imageUrl?: string;
  lastLogin?: Date;
  status?: UserStatus;
  bio?: string;
  website?: string;
  location?: string;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

// Interface cho instance của User
export interface IUser extends BaseModelInstance<UserAttributes> {
  // Các phương thức instance cụ thể của User
  getFullName(): string;
  comparePassword(password: string): Promise<boolean>;
  generateAuthToken(): Promise<string>;
  generateVerificationToken(): Promise<string>;
  generateResetPasswordToken(): Promise<string>;
}

// Type cho model User
export type UserModel = BaseModel<UserAttributes, IUser>;

// Interface cho options query của User
export interface UserQueryOptions extends BaseQueryOptions {
  where?: {
    role?: UserRole;
    status?: UserStatus;
    isVerified?: boolean;
    [key: string]: any;
  };
  include?: any[];
  order?: any[];
  limit?: number;
  offset?: number;
}
