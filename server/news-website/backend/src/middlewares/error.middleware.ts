import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { HttpException } from '../exceptions/HttpException';

export const errorHandler = (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = error.status || 500;
  const message = error.message || 'Something went wrong';
  const errors = error.errors;

  // Log the error
  logger.error(
    `${status} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip} - ${
      error.stack || 'No stack trace'
    }`
  );

  // Send response
  res.status(status).json({
    success: false,
    status,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};
