const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');
const { Op } = require('sequelize'); // Import Op from sequelize

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    logger.info('Attempting user registration', { email: req.body.email });
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password });

    // Generate verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    user.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken);

    logger.info(`User registered successfully with ID: ${user.id}`, { email: user.email });
    sendTokenResponse(user, 201, res);
  } catch (error) {
    logger.error('Error during user registration', { error: error.message, stack: error.stack, email: req.body.email });
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    logger.info('Attempting user login', { email: req.body.email });
    const { email, password } = req.body;
    if (!email || !password) {
      logger.warn('Login attempt with missing email or password');
      return res.status(400).json({ success: false, error: { message: 'Please provide an email and password' } });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      logger.warn('Login attempt with invalid credentials (user not found)', { email: email });
      return res.status(401).json({ success: false, error: { message: 'Invalid credentials' } });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn('Login attempt with invalid credentials (incorrect password)', { email: email });
      return res.status(401).json({ success: false, error: { message: 'Invalid credentials' } });
    }
    logger.info(`User logged in successfully with ID: ${user.id}`, { email: user.email });
    sendTokenResponse(user, 200, res);
  } catch (error) {
    logger.error('Error during user login', { error: error.message, stack: error.stack, email: req.body.email });
    next(error);
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    logger.info('Attempting to verify email with token');
    const verificationToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      where: {
        emailVerificationToken: verificationToken,
        emailVerificationExpire: { [Op.gt]: Date.now() } // Use Op from sequelize
      }
    });
    if (!user) {
      logger.warn('Email verification failed: Invalid or expired token');
      return res.status(400).json({ success: false, error: { message: 'Invalid or expired token' } });
    }
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpire = null;
    await user.save();
    logger.info(`Email verified successfully for user ID: ${user.id}`);
    res.status(200).json({ success: true, data: { message: 'Email verified successfully' } });
  } catch (error) {
    logger.error('Error during email verification', { error: error.message, stack: error.stack });
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    logger.info('Attempting forgot password request', { email: req.body.email });
    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) {
      logger.warn('Forgot password request for non-existent user', { email: req.body.email });
      // It's better practice to return a generic success message even if the user doesn't exist
      // to prevent email enumeration, but for demonstration, we return user not found.
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();
    await sendPasswordResetEmail(user.email, resetToken);
    logger.info(`Password reset email sent to user ID: ${user.id}`);
    res.status(200).json({ success: true, data: { message: 'Password reset email sent' } });
  } catch (error) {
    logger.error('Error during forgot password request', { error: error.message, stack: error.stack, email: req.body.email });
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    logger.info('Attempting password reset with token');
    const resetToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      where: {
        resetPasswordToken: resetToken,
        resetPasswordExpire: { [Op.gt]: Date.now() } // Use Op from sequelize
      }
    });
    if (!user) {
      logger.warn('Password reset failed: Invalid or expired token');
      return res.status(400).json({ success: false, error: { message: 'Invalid or expired token' } });
    }
    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();
    logger.info(`Password reset successful for user ID: ${user.id}`);
    res.status(200).json({ success: true, data: { message: 'Password reset successful' } });
  } catch (error) {
    logger.error('Error during password reset', { error: error.message, stack: error.stack });
    next(error);
  }
};

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  logger.info(`Sending token response for user ID: ${user.id}`);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified
    }
  });
}; 