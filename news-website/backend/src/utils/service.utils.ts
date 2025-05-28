import { Op, WhereOptions, FindAndCountOptions } from 'sequelize';
import { Model } from 'sequelize';
import { BadRequestException } from '../exceptions/HttpException';
import logger from './logger';

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}

export class ServiceUtils {
  /**
   * Build search conditions for text fields
   * @param search Search term
   * @param fields Fields to search in
   * @returns Where conditions
   */
  static buildSearchConditions(search: string, fields: string[]): WhereOptions {
    if (!search) return {};
    
    return {
      [Op.or]: fields.map(field => ({
        [field]: { [Op.iLike]: `%${search}%` }
      }))
    };
  }

  /**
   * Build pagination query
   * @param params Pagination parameters
   * @returns Pagination options
   */
  static buildPaginationQuery(params: PaginationParams): FindAndCountOptions {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'DESC' } = params;
    const offset = (page - 1) * limit;

    return {
      limit,
      offset,
      order: [[sortBy, order]]
    };
  }

  /**
   * Format pagination result
   * @param count Total count
   * @param rows Data rows
   * @param page Current page
   * @param limit Items per page
   * @returns Formatted pagination result
   */
  static formatPaginationResult<T>(
    count: number,
    rows: T[],
    page: number,
    limit: number
  ): PaginationResult<T> {
    return {
      data: rows,
      pagination: {
        total: count,
        page,
        totalPages: Math.ceil(count / limit),
        limit
      }
    };
  }

  /**
   * Handle database errors
   * @param error Error object
   * @param context Error context
   * @throws BadRequestException
   */
  static handleDatabaseError(error: unknown, context: string): never {
    logger.error(`Error in ${context}:`, error);

    if (error instanceof Error) {
      if ('name' in error) {
        switch (error.name) {
          case 'SequelizeUniqueConstraintError':
            throw new BadRequestException('Data already exists');
          case 'SequelizeValidationError':
            if ('errors' in error) {
              const validationError = error as { errors: Array<{ message: string }> };
              const messages = validationError.errors.map(e => e.message);
              throw new BadRequestException(`Validation error: ${messages.join(', ')}`);
            }
            break;
          case 'SequelizeForeignKeyConstraintError':
            throw new BadRequestException('Cannot perform operation due to related records');
        }
      }
    }

    throw new BadRequestException(`Failed to ${context}`);
  }

  /**
   * Check if user has permission to access/modify resource
   * @param currentUser Current user
   * @param resourceOwnerId Resource owner ID
   * @param allowedRoles Allowed roles
   * @returns boolean
   */
  static hasPermission(
    currentUser: any,
    resourceOwnerId: number,
    allowedRoles: string[] = ['admin']
  ): boolean {
    if (!currentUser) return false;
    return allowedRoles.includes(currentUser.role) || currentUser.id === resourceOwnerId;
  }
} 