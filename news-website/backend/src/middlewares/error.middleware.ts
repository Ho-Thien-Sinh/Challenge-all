import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../exceptions/HttpException';
import { ErrorUtils } from '../utils/error.utils';
import { MiddlewareUtils } from '../utils/middleware.utils';

export const errorHandler = (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = error.status || 500;
  const message = error.message || 'Something went wrong';
  const errors = error.errors;

  // Log error
  ErrorUtils.logError(error, req);

  // Send response
  res.status(status).json({
    success: false,
    status,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

export const notFoundHandler = MiddlewareUtils.createNotFoundHandler();
