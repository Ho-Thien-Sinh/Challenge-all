import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../exceptions/HttpException';
import { ErrorUtils } from '../utils/error.utils';
import { MiddlewareUtils } from '../utils/middleware.utils';

export class ErrorMiddleware {
  private readonly errorUtils: ErrorUtils;
  private readonly middlewareUtils: MiddlewareUtils;

  constructor() {
    this.errorUtils = new ErrorUtils();
    this.middlewareUtils = new MiddlewareUtils();
  }

  public errorHandler(
    error: HttpException,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const status = error.status || 500;
    const message = error.message || 'Something went wrong';
    const errors = error.errors;

    // Log error
    this.errorUtils.logError(error, req);

    // Send response
    res.status(status).json({
      success: false,
      status,
      message,
      ...(errors && { errors }),
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  }

  public get notFoundHandler() {
    return this.middlewareUtils.createNotFoundHandler();
  }
}

export default new ErrorMiddleware();
export const errorHandler = (error: HttpException, req: Request, res: Response, next: NextFunction) => 
  new ErrorMiddleware().errorHandler(error, req, res, next);
export const notFoundHandler = new ErrorMiddleware().notFoundHandler;
