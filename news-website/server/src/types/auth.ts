import { Request } from 'express';
import { IUser, IUserModel } from './user';

export interface JWTPayload {
  id: number | string;  // Allow both number and string for flexibility
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export type AuthUser = Pick<IUser, 'id' | 'email' | 'name' | 'role' | 'status'> & {
  // Add any additional auth-specific user properties here
};

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  cookies: {
    token?: string;
  };
}

export type UserRole = 'user' | 'publisher' | 'admin';

export interface AuthRequest extends Request {
  user?: IUserModel;
}
