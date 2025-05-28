import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { BadRequestException, NotFoundException } from '../exceptions/HttpException';
import { ErrorUtils } from './error.utils';

export class MiddlewareUtils {
  /**
   * Create a validation middleware for request body
   * @param type DTO class to validate against
   * @param skipMissingProperties Whether to skip validation of missing properties
   * @returns Express middleware function
   */
  static createValidationMiddleware(type: any, skipMissingProperties = false) {
    return (req: Request, res: Response, next: NextFunction) => {
      validate(plainToInstance(type, req.body), { skipMissingProperties })
        .then((errors: ValidationError[]) => {
          if (errors.length > 0) {
            const message = ErrorUtils.handleValidationErrors(errors);
            next(new BadRequestException(message));
          } else {
            next();
          }
        });
    };
  }

  /**
   * Create a validation middleware for query parameters
   * @param type DTO class to validate against
   * @returns Express middleware function
   */
  static createQueryValidationMiddleware(type: any) {
    return (req: Request, res: Response, next: NextFunction) => {
      validate(plainToInstance(type, req.query), { whitelist: true, forbidNonWhitelisted: true })
        .then((errors: ValidationError[]) => {
          if (errors.length > 0) {
            const message = ErrorUtils.handleValidationErrors(errors);
            next(new BadRequestException(message));
          } else {
            // Replace query with validated and transformed query
            req.query = plainToInstance(type, req.query);
            next();
          }
        });
    };
  }

  /**
   * Create a not found handler middleware
   * @returns Express middleware function
   */
  static createNotFoundHandler() {
    return (req: Request, res: Response, next: NextFunction) => {
      next(new NotFoundException(`Cannot ${req.method} ${req.originalUrl}`));
    };
  }

  /**
   * Create a role-based access control middleware
   * @param allowedRoles Array of allowed roles
   * @returns Express middleware function
   */
  static createRoleMiddleware(allowedRoles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
          throw new ForbiddenException(`Access denied. Required roles: ${allowedRoles.join(', ')}`);
        }
        next();
      } catch (error) {
        next(error);
      }
    };
  }
} 