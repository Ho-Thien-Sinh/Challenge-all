import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';
import { ForbiddenException, UnauthorizedException } from '../exceptions/HttpException';

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export class BaseController {
  /**
   * Parse pagination query parameters
   * @param req Request object
   * @returns Parsed pagination parameters
   */
  protected parsePaginationQuery(req: Request): PaginationQuery {
    return {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      search: req.query.search as string,
      sortBy: req.query.sortBy as string,
      order: (req.query.order as 'ASC' | 'DESC') || 'DESC'
    };
  }

  /**
   * Check if current user has permission to access/modify resource
   * @param currentUser Current user
   * @param targetId Target resource ID
   * @param allowedRoles Allowed roles
   * @throws UnauthorizedException | ForbiddenException
   */
  protected checkPermission(
    currentUser: any,
    targetId: number,
    allowedRoles: UserRole[] = [UserRole.ADMIN]
  ): void {
    if (!currentUser) {
      throw new UnauthorizedException('User not authenticated');
    }

    const isAllowedRole = allowedRoles.includes(currentUser.role);
    const isOwner = currentUser.id === targetId;

    if (!isAllowedRole && !isOwner) {
      throw new ForbiddenException('You do not have permission to perform this action');
    }
  }

  /**
   * Send success response
   * @param res Response object
   * @param data Response data
   * @param status HTTP status code
   * @param message Success message
   */
  protected sendSuccess(
    res: Response,
    data: any = null,
    status: number = 200,
    message: string = 'Success'
  ): void {
    res.status(status).json({
      success: true,
      message,
      ...(data && { data })
    });
  }

  /**
   * Send paginated response
   * @param res Response object
   * @param data Response data
   * @param pagination Pagination info
   */
  protected sendPaginatedResponse(
    res: Response,
    data: any[],
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages?: number;
    }
  ): void {
    res.status(200).json({
      success: true,
      data,
      pagination: {
        ...pagination,
        totalPages: pagination.totalPages || Math.ceil(pagination.total / pagination.limit)
      }
    });
  }

  /**
   * Handle async controller methods
   * @param fn Async controller method
   * @returns Express middleware function
   */
  protected asyncHandler(fn: Function) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        await fn(req, res, next);
      } catch (error) {
        next(error);
      }
    };
  }
} 