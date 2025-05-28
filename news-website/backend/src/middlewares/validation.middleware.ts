import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { BadRequestException } from '../exceptions/HttpException';
import { ErrorUtils } from '../utils/error.utils';
import { MiddlewareUtils } from '../utils/middleware.utils';

export class ValidationMiddleware {
  private readonly middlewareUtils: MiddlewareUtils;

  constructor() {
    this.middlewareUtils = new MiddlewareUtils();
  }

  public validationMiddleware(type: any, skipMissingProperties = false) {
    return this.middlewareUtils.createValidationMiddleware(type, skipMissingProperties);
  }

  public queryValidationMiddleware(type: any) {
    return this.middlewareUtils.createQueryValidationMiddleware(type);
  }
}

export default new ValidationMiddleware();
export const validationMiddleware = (type: any, skipMissingProperties = false) => 
  new ValidationMiddleware().validationMiddleware(type, skipMissingProperties);
export const queryValidationMiddleware = (type: any) => 
  new ValidationMiddleware().queryValidationMiddleware(type);
