import { ValidationError } from 'class-validator';
import { BadRequestException, HttpException } from '../exceptions/HttpException';
import logger from './logger';

export class ErrorUtils {
  /**
   * Handle validation errors
   * @param errors Array of validation errors
   * @returns Error message
   */
  public handleValidationErrors(errors: ValidationError[]): string {
    return errors
      .map((error: ValidationError) => {
        if (error.constraints) {
          return Object.values(error.constraints);
        }
        return [];
      })
      .join(', ');
  }

  /**
   * Handle Sequelize errors
   * @param error Sequelize error
   * @returns HttpException
   */
  public handleSequelizeError(error: any): HttpException {
    logger.error('Sequelize error:', error);

    if (error.name === 'SequelizeUniqueConstraintError') {
      return new BadRequestException('Data already exists');
    }

    if (error.name === 'SequelizeValidationError' && error.errors) {
      const messages = error.errors.map((e: { message: string }) => e.message);
      return new BadRequestException(`Validation error: ${messages.join(', ')}`);
    }

    return new BadRequestException('Data processing error');
  }

  /**
   * Log error
   * @param error Error object
   * @param req Request object
   */
  public logError(error: HttpException, req: any): void {
    logger.error(
      `${error.status} - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip} - ${
        error.stack || 'No stack trace'
      }`
    );
  }
}

export default new ErrorUtils(); 