import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { BadRequestException } from '../exceptions/HttpException';

export const validationMiddleware = (type: any, skipMissingProperties = false) => {
  return (req: Request, res: Response, next: NextFunction) => {
    validate(plainToInstance(type, req.body), { skipMissingProperties })
      .then((errors: ValidationError[]) => {
        if (errors.length > 0) {
          const message = errors
            .map((error: ValidationError) => {
              if (error.constraints) {
                return Object.values(error.constraints);
              }
              return [];
            })
            .join(', ');
          next(new BadRequestException(message));
        } else {
          next();
        }
      });
  };
};

export const queryValidationMiddleware = (type: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    validate(plainToInstance(type, req.query), { whitelist: true, forbidNonWhitelisted: true })
      .then((errors: ValidationError[]) => {
        if (errors.length > 0) {
          const message = errors
            .map((error: ValidationError) => {
              if (error.constraints) {
                return Object.values(error.constraints);
              }
              return [];
            })
            .join(', ');
          next(new BadRequestException(message));
        } else {
          // Replace query with validated and transformed query
          req.query = plainToInstance(type, req.query);
          next();
        }
      });
  };
};
