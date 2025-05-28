import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { JWT_CONFIG } from '../config';
import { UnauthorizedException, ForbiddenException } from '../exceptions/HttpException';
import { User } from '../models';
import { AuthUtils } from '../utils/auth.utils';
import { MiddlewareUtils } from '../utils/middleware.utils';

declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
  }
}

export interface RequestWithUser extends Request {
  user?: User;
}

export const authMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Authentication token not found');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Invalid token');
    }

    const decoded = verify(token, JWT_CONFIG.secret) as any;
    if (decoded.type !== 'access') {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = async (req: RequestWithUser, res: Response, next: NextFunction) => {
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
};

export const adminMiddleware = [
  authMiddleware,
  MiddlewareUtils.createRoleMiddleware(['admin'])
];

export const editorMiddleware = [
  authMiddleware,
  MiddlewareUtils.createRoleMiddleware(['admin', 'editor'])
];
