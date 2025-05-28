import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { JWT_CONFIG } from '../config';
import { UnauthorizedException, ForbiddenException } from '../exceptions/HttpException';
import { User } from '../models/User.model';
import { AuthUtils } from '../utils/auth.utils';
import { MiddlewareUtils } from '../utils/middleware.utils';
import { UserRole } from '../models/User.model';

declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
  }
}

export interface RequestWithUser extends Request {
  user?: User;
}

export class AuthMiddleware {
  private readonly middlewareUtils: MiddlewareUtils;

  constructor() {
    this.middlewareUtils = new MiddlewareUtils();
  }

  public auth(req: RequestWithUser, res: Response, next: NextFunction): void {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new UnauthorizedException('No authorization header');
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      const decoded = verify(token, JWT_CONFIG.secret) as any;
      if (decoded.type !== 'access') {
        throw new UnauthorizedException('Invalid token type');
      }

      req.user = decoded;
      next();
    } catch (error) {
      next(new UnauthorizedException('Invalid token'));
    }
  }

  public admin(req: RequestWithUser, res: Response, next: NextFunction): void {
    try {
      if (!req.user) {
        throw new UnauthorizedException('User not authenticated');
      }

      if (req.user.role !== UserRole.ADMIN) {
        throw new ForbiddenException('Admin access required');
      }

      next();
    } catch (error) {
      next(error);
    }
  }

  public async optionalAuth(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return next();
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        return next();
      }

      const decoded = verify(token, JWT_CONFIG.secret) as any;
      if (decoded.type !== 'access') {
        return next();
      }

      const user = await User.findByPk(decoded.id);
      if (user) {
        req.user = user;
      }
      next();
    } catch (error) {
      next();
    }
  }

  public createEditorMiddleware() {
    return this.middlewareUtils.createRoleMiddleware([UserRole.ADMIN, UserRole.EDITOR]);
  }

  public createUserMiddleware() {
    return this.middlewareUtils.createRoleMiddleware([UserRole.ADMIN, UserRole.EDITOR, UserRole.USER]);
  }
}

const authMiddlewareInstance = new AuthMiddleware();
export default authMiddlewareInstance;
export const authMiddleware = (req: RequestWithUser, res: Response, next: NextFunction) => 
  authMiddlewareInstance.auth(req, res, next);
export const adminMiddleware = (req: RequestWithUser, res: Response, next: NextFunction) => 
  authMiddlewareInstance.admin(req, res, next);
export const optionalAuth = (req: RequestWithUser, res: Response, next: NextFunction) => 
  authMiddlewareInstance.optionalAuth(req, res, next);
export const editorMiddleware = authMiddlewareInstance.createEditorMiddleware();
export const userMiddleware = authMiddlewareInstance.createUserMiddleware();
