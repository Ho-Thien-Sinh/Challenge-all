import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { JWT_CONFIG } from '../config';
import { UnauthorizedException, ForbiddenException } from '../exceptions/HttpException';
import { User } from '../models';

declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
  }
}

export type RequestWithUser = Request;

export const authMiddleware = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    // Verify token
    const decoded = verify(token, JWT_CONFIG.secret) as { id: number; type: string };
    
    if (decoded.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Get user from the token
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password', 'verificationToken', 'resetPasswordToken', 'resetPasswordExpires'] },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const adminMiddleware = [
  authMiddleware,
  (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      if (req.user?.role !== 'admin') {
        throw new ForbiddenException('Admin access required');
      }
      next();
    } catch (error) {
      next(error);
    }
  },
];

export const optionalAuth = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      if (token) {
        try {
          const decoded = verify(token, JWT_CONFIG.secret) as { id: number; type: string };
          
          if (decoded.type === 'access') {
            const user = await User.findByPk(decoded.id, {
              attributes: { exclude: ['password', 'verificationToken', 'resetPasswordToken', 'resetPasswordExpires'] },
            });
            
            if (user) {
              req.user = user;
            }
          }
        } catch (error) {
          // Token is invalid but we don't throw an error
          console.error('Optional auth error:', error);
        }
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
};
