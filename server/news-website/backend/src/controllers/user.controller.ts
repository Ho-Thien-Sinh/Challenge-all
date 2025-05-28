import { Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import { UserService } from '../services/user.service';
import { 
  UpdateUserDto, 
  UserResponseDto, 
  UserQueryParams,
  PaginatedUserResponseDto
} from '../dto/user.dto';
import { User, UserRole } from '../models/User.model';
import { IUser } from '../types/user.types';

// Extend the Request interface to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// Interface cho tham số truy vấn người dùng
interface UserQueryOptions {
  page: number;
  limit: number;
  search?: string;
  role?: UserRole | string;
}

// Interface cho kết quả phân trang
interface PaginationResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

class UserController {
  public userService = Container.get(UserService);

  public getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Parse query parameters
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const search = req.query.search as string | undefined;
      const role = req.query.role as UserRole | undefined;
      
      // Validate role nếu có
      if (role && !Object.values(UserRole).includes(role as UserRole)) {
        throw new Error('Invalid role');
      }
      
      // Gọi service để lấy dữ liệu
      const result = await this.userService.getAllUsers(
        page,
        limit,
        search,
        role
      );
      
      // Create response with paginated data
      const response = new PaginatedUserResponseDto(
        result.data.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          imageUrl: user.imageUrl,
          lastLogin: user.lastLogin,
          status: user.status,
          bio: user.bio,
          website: user.website,
          location: user.location,
          createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
          updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date()
        })),
        {
          total: result.pagination.total,
          page,
          limit
        }
      );
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getUserById = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      const user = await this.userService.getUserById(userId);
      
      res.status(200).json({
        success: true,
        data: new UserResponseDto({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          imageUrl: user.imageUrl,
          lastLogin: user.lastLogin,
          status: user.status,
          bio: user.bio,
          website: user.website,
          location: user.location,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        })
      });
    } catch (error) {
      next(error);
    }
  };

  public updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = parseInt(req.params.id, 10);
      const userData: UpdateUserDto = req.body;
      
      // Check if user has permission to update this user
      if (req.user?.role !== UserRole.ADMIN && req.user?.id !== userId) {
        res.status(403).json({ message: 'You do not have permission to update this user' });
        return;
      }
      
      // If not admin, don't allow updating role
      if (req.user?.role !== UserRole.ADMIN && userData.role) {
        res.status(403).json({ message: 'You do not have permission to update user role' });
        return;
      }

      const updatedUser = await this.userService.updateUser(userId, userData);
      
      res.status(200).json({
        success: true,
        data: new UserResponseDto({
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          isVerified: updatedUser.isVerified,
          imageUrl: updatedUser.imageUrl,
          lastLogin: updatedUser.lastLogin,
          status: updatedUser.status,
          bio: updatedUser.bio,
          website: updatedUser.website,
          location: updatedUser.location,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt
        })
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = parseInt(req.params.id, 10);
      const currentUser = req.user;
      
      if (!currentUser) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }
      
      // Only allow admin or the user themselves to delete
      if (currentUser.role !== UserRole.ADMIN && currentUser.id !== userId) {
        res.status(403).json({ message: 'You do not have permission to delete this user' });
        return;
      }
      
      await this.userService.deleteUser(userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  public getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      
      if (!currentUser) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }
      
      const user = await this.userService.getUserById(currentUser.id);
      
      res.status(200).json({
        success: true,
        data: new UserResponseDto({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          imageUrl: user.imageUrl,
          lastLogin: user.lastLogin,
          status: user.status,
          bio: user.bio,
          website: user.website,
          location: user.location,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        })
      });
    } catch (error) {
      next(error);
    }
  };

  public getUserProfile = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      const user = await this.userService.getUserProfile(userId);
      
      res.status(200).json({
        success: true,
        data: new UserResponseDto({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          imageUrl: user.imageUrl,
          lastLogin: user.lastLogin,
          status: user.status,
          bio: user.bio,
          website: user.website,
          location: user.location,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        })
      });
    } catch (error) {
      next(error);
    }
  };
}

export default UserController;
