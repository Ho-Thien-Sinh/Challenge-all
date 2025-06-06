import { Model } from 'sequelize';

export interface IUser {
  id?: number;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'publisher' | 'admin';
  isVerified: boolean;
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string;
  bio?: string;
  lastLogin?: Date;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  verifyEmailToken?: string;
  verifyEmailExpire?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  preferences: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface IUserModel extends Model<IUser>, IUser {}

export interface JWTPayload {
  id: number;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: IUser;
  cookies: {
    token?: string;
  };
}
