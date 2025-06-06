const logger = require('../utils/logger');
const { ValidationError, UniqueConstraintError, ForeignKeyConstraintError, DatabaseError } = require('sequelize');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = [];

  // Log the error
  logger.error(`Error: ${err.message}`, { stack: err.stack, url: req.originalUrl, method: req.method, ip: req.ip });

  // Handle Sequelize Validation Errors
  if (err instanceof ValidationError) {
    statusCode = 400; // Bad Request
    message = 'Validation Error';
    errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
  } else if (err instanceof UniqueConstraintError) {
    statusCode = 400; // Bad Request
    // Extract the field that caused the unique constraint error
    const fields = Object.keys(err.fields);
    message = `Duplicate field value: ${fields.join(', ')}`;
    errors = fields.map(field => ({
        field,
        message: `The ${field} already exists`
    }));
  } else if (err instanceof ForeignKeyConstraintError) {
    statusCode = 400; // Bad Request
    message = 'Foreign Key Constraint Failed';
    // You might want to extract more details from err here
    errors = [{ message: `Related record not found for field: ${err.fields.join(', ' || 'unknown')}` }];
  } else if (err instanceof DatabaseError) {
      // Catch other general database errors
      statusCode = 500; // Internal Server Error
      message = 'Database Error';
      // In development, you might expose err.message for more details, but in production, keep it generic
      if (process.env.NODE_ENV === 'development') {
          message = `Database Error: ${err.message}`;
      }
  } else if (err.name === 'UnauthorizedError') {
    // Handle JWT authentication errors
    statusCode = 401; // Unauthorized
    message = 'Invalid Token';
  }

  // More specific error handling can be added here

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: message,
    errors: errors.length > 0 ? errors : undefined,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { errorHandler };