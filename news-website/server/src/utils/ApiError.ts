class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public status: string;

  constructor(statusCode: number, message: string, isOperational: boolean = true, stack: string = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;