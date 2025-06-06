import { Response, NextFunction, Request } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '@/models';
import ApiError from '@/utils/ApiError';
import { AuthUser, JWTPayload, UserRole } from '@/types/auth';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

// Type guard for user role
const isValidRole = (role: string): role is UserRole => {
  return ['user', 'publisher', 'admin'].includes(role);
};

// Protect routes - require authentication
export const protect = async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    // Make sure token exists
    if (!token) {
      return next(new ApiError('No authentication token provided', 401));
    }

    try {
      // Verify token
      const jwtSecret: string | undefined = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error('JWT_SECRET is not defined');
        return next(new ApiError('Server configuration error', 500));
      }

      // Define a type guard to check if the decoded token has the expected shape
      const isJwtPayload = (decoded: any): decoded is JWTPayload => {
        return decoded && typeof decoded === 'object' && 'id' in decoded;
      };

      let decoded: JWTPayload;
      try {
        // Verify and decode the token
        const result = jwt.verify(token, jwtSecret);
        
        // Handle the case where jwt.verify returns a string (for none algorithm)
        if (typeof result === 'string' || !isJwtPayload(result)) {
          return next(new ApiError('Invalid token format', 401));
        }
        
        decoded = result;
      } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
          return next(new ApiError('Invalid token', 401));
        } else if (error instanceof jwt.TokenExpiredError) {
          return next(new ApiError('Token has expired', 401));
        }
        console.error('Token verification error:', error);
        return next(new ApiError('Failed to verify token', 500));
      }

      // Type guard to ensure decoded is a JwtPayload with required properties
      if (typeof decoded === 'string' || !('id' in decoded)) {
        return next(new ApiError('Invalid token payload', 401));
      }
      
      // At this point, TypeScript knows decoded has an 'id' property
      const payload = decoded as JWTPayload;

      if (!payload.id) {
        return next(new ApiError('Invalid token payload', 401));
      }

      // Get user from the token - handle both string and number IDs
      let userId: number | string = payload.id;
      
      // If ID is a string that can be parsed as a number, convert it to number
      if (typeof userId === 'string' && !isNaN(parseInt(userId, 10))) {
        userId = parseInt(userId, 10);
      }
      
      // Find user by primary key - findByPk can handle both string and number IDs
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return next(new ApiError('User not found', 404));
      }

      // Ensure user has a valid role
      if (!isValidRole(user.role)) {
        return next(new ApiError('User has an invalid role', 403));
      }

      // Check if user changed password after the token was issued
      if (decoded.iat && user.changedPasswordAfter(decoded.iat)) {
        return next(
          new ApiError('Security alert: Please log in again', 401)
        );
      }

      // Create an auth user object with only the necessary properties
      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as UserRole,
        status: user.status,
      };

      // Grant access to protected route
      req.user = authUser;
      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return next(new ApiError('Invalid or expired token', 401));
      } else if (error instanceof jwt.TokenExpiredError) {
        return next(new ApiError('Token has expired', 401));
      }
      console.error('Authentication error:', error);
      return next(new ApiError('Authentication failed', 401));
    }
  } catch (error) {
    console.error('Unexpected error in protect middleware:', error);
    next(new ApiError('An unexpected error occurred', 500));
  }
};

// Grant access to specific roles
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new ApiError('Authentication required', 401));
      }
      
      // Type guard to check if role is valid
      const isValidRole = (role: string): role is UserRole => {
        return ['user', 'publisher', 'admin'].includes(role);
      };
      
      const userRole = req.user.role;
      
      if (!isValidRole(userRole) || !allowedRoles.includes(userRole)) {
        return next(
          new ApiError(
            `User role '${userRole}' is not authorized to access this route`,
            403
          )
        );
      }
      
      next();
    } catch (error) {
      console.error('Role verification error:', error);
      return next(
        new ApiError('An error occurred while verifying user role', 500)
      );
    }
  };
};

// Check if user is admin
export const isAdmin = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new ApiError('Authentication required', 401));
    }

    const userRole = req.user.role;
    
    if (!isValidRole(userRole)) {
      return next(new ApiError('Invalid user role', 403));
    }

    if (userRole !== 'admin') {
      return next(new ApiError('Admin access required', 403));
    }
    
    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    return next(new ApiError('Error verifying admin access', 500));
  }
};

// Check if user is publisher or admin
export const isPublisher = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new ApiError('Authentication required', 401));
    }

    const userRole = req.user.role;
    
    if (!isValidRole(userRole)) {
      return next(new ApiError('Invalid user role', 403));
    }

    if (userRole !== 'publisher' && userRole !== 'admin') {
      return next(new ApiError('Publisher or admin access required', 403));
    }
    
    next();
  } catch (error) {
    console.error('Publisher verification error:', error);
    return next(new ApiError('Error verifying publisher access', 500));
  }
};

// Check if user is the owner or admin
export const isOwnerOrAdmin = (userId: string | number) => {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new ApiError('User not authenticated', 401));
      }
      
      // Get current user's role and ID with proper type checking
      const { role: userRole, id: currentUserId } = req.user;
      
      if (!isValidRole(userRole)) {
        return next(new ApiError('Invalid user role', 403));
      }

      // Convert target user ID to number if it's a string
      let targetUserIdNum: number;
      if (typeof userId === 'string') {
        const parsedId = parseInt(userId, 10);
        if (isNaN(parsedId)) {
          return next(new ApiError('Invalid target user ID format', 400));
        }
        targetUserIdNum = parsedId;
      } else if (typeof userId === 'number') {
        targetUserIdNum = userId;
      } else {
        return next(new ApiError('Invalid target user ID type', 400));
      }
      
      // Allow admin or the owner (strict equality check)
      if (userRole === 'admin' || currentUserId === targetUserIdNum) {
        return next();
      }
      
      return next(
        new ApiError('Not authorized to access this resource', 403)
      );
    } catch (error) {
      console.error('Owner/Admin verification error:', error);
      return next(new ApiError('Error verifying ownership or admin access', 500));
    }
  };
};

// Export all middleware functions
export default {
  protect,
  authorize,
  isAdmin,
  isPublisher,
  isOwnerOrAdmin
};
