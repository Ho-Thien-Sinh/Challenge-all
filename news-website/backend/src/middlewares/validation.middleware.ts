import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { BadRequestException } from '../exceptions/HttpException';
import { ErrorUtils } from '../utils/error.utils';
import { MiddlewareUtils } from '../utils/middleware.utils';

export const validationMiddleware = (type: any, skipMissingProperties = false) => {
  return MiddlewareUtils.createValidationMiddleware(type, skipMissingProperties);
};

export const queryValidationMiddleware = (type: any) => {
  return MiddlewareUtils.createQueryValidationMiddleware(type);
};
