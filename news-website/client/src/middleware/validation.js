const { validationResult } = require('express-validator');

// Middleware for handling validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Format validation errors
    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg,
    }));

    return res.status(400).json({ success: false, message: 'Validation failed', errors: formattedErrors });
  }
  next();
};

module.exports = { handleValidationErrors }; 