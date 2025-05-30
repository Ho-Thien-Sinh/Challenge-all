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
import { BaseController } from './base.controller';
import { ForbiddenException, UnauthorizedException } from '../exceptions/HttpException';

// Extend the Request interface to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// Interface for user query parameters
interface UserQueryOptions {
  page: number;
  limit: number;
  search?: string;
  role?: UserRole | string;
}

// Interface for pagination result
interface PaginationResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

class UserController extends BaseController {
  private readonly userService: UserService;

  constructor() {
    super();
    this.userService = Container.get(UserService);
  }

  public async getUsers(req: Request, res: Response): Promise<void> {
    const query = this.parsePaginationQuery(req);
    const role = req.query.role as UserRole | undefined;
    
    if (role && !Object.values(UserRole).includes(role)) {
      throw new Error('Invalid role');
    }
    
    const result = await this.userService.getAllUsers(
      query.page,
      query.limit,
      query.search,
      role
    );
    
    if (!result) {
      throw new Error('Failed to get users');
    }
    
    this.sendPaginatedResponse(
      res,
      result.data.map(user => new UserResponseDto(user)),
      result.pagination
    );
  }

  public async getUserById(req: Request, res: Response): Promise<void> {
    const userId = parseInt(req.params.id);
    const user = await this.userService.getUserById(userId);
    this.sendSuccess(res, new UserResponseDto(user));
  }

  public async updateUser(req: Request, res: Response): Promise<void> {
    const userId = parseInt(req.params.id);
    const userData: UpdateUserDto = req.body;
    
    this.checkPermission(req.user, userId, [UserRole.ADMIN]);
    
    if (req.user?.role !== UserRole.ADMIN && userData.role) {
      throw new ForbiddenException('You do not have permission to update user role');
    }

    const updatedUser = await this.userService.updateUser(userId, userData);
    this.sendSuccess(res, new UserResponseDto(updatedUser));
  }

  public async deleteUser(req: Request, res: Response): Promise<void> {
    const userId = parseInt(req.params.id);
    this.checkPermission(req.user, userId, [UserRole.ADMIN]);
    
    await this.userService.deleteUser(userId);
    res.status(204).send();
  }

  public async getCurrentUser(req: Request, res: Response): Promise<void> {
    const userId = (req as any).user.id;
    const user = await this.userService.getUserById(userId);
    this.sendSuccess(res, new UserResponseDto(user));
  }

  public async getUserProfile(req: Request, res: Response): Promise<void> {
    const userId = parseInt(req.params.id);
    const user = await this.userService.getUserById(userId);
    this.sendSuccess(res, new UserResponseDto(user));
  }
}

export default new UserController();
