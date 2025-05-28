import { Request, Response, NextFunction } from 'express';
import { NotFoundException } from '../exceptions/HttpException';

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundException(`Cannot ${req.method} ${req.originalUrl}`));
};
