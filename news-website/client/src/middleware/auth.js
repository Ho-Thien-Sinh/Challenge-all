const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = (req, res, next) => {
  // Get token from header
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1]; // Expected format: "Bearer TOKEN"

  // Check if not token
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token, authorization denied' });
  }

  // Verify token
  try {
    // Replace 'YOUR_JWT_SECRET' with your actual secret key from environment variables
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Assuming the decoded token contains user id or identifier
    req.user = decoded; // Attach decoded token payload to request object
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Token is not valid' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    // Assuming user role is available in req.user (from auth middleware)
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: `User role ${req.user.role} is not authorized to access this route` });
    }
    next();
  };
};

module.exports = { auth, authorize }; 