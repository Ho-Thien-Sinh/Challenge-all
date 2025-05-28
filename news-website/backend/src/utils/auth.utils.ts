import { sign } from 'jsonwebtoken';
import { JWT_CONFIG } from '../config';
import { User } from '../models';
import { UserRole } from '../types/index';

export class AuthUtils {
  /**
   * Tạo token JWT cho người dùng
   * @param user Người dùng
   * @param type Loại token ('access' hoặc 'refresh')
   * @returns Token JWT
   */
  static generateToken(user: User, type: 'access' | 'refresh'): string {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      type,
    };

    const expiresIn: string | number = type === 'access' 
      ? JWT_CONFIG.expiresIn 
      : JWT_CONFIG.refreshExpiresIn;

    return sign(payload, JWT_CONFIG.secret, { expiresIn } as any);
  }

  /**
   * Kiểm tra quyền admin
   * @param role Vai trò người dùng
   * @returns boolean
   */
  static isAdmin(role: UserRole): boolean {
    return role === UserRole.ADMIN;
  }

  /**
   * Kiểm tra quyền editor
   * @param role Vai trò người dùng
   * @returns boolean
   */
  static isEditor(role: UserRole): boolean {
    return role === UserRole.EDITOR || role === UserRole.ADMIN;
  }
} 