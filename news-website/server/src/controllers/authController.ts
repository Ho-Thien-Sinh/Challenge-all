import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { body, validationResult } from 'express-validator';
import { User } from '@/models';
import ApiError from '../utils/ApiError';
import sendEmail from '../utils/sendEmail';
import crypto from 'crypto';

import { IUser } from '@/types/user';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: Pick<IUser, 'id' | 'email' | 'name' | 'role' | 'status'>;
    }
  }
}

interface AuthRequest extends Request {
  user?: Pick<IUser, 'id' | 'email' | 'name' | 'role' | 'status'>;
  cookies: {
    token?: string;
  };
}

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = [
  // Validation
  body('username', 'Username is required').notEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  
  asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(400, 'Validation error', false));
    }

    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({
      where: {
        email: email
      }
    });

    if (userExists) {
      throw new ApiError(400, 'User already exists with this email or username');
    }

    // Create user
    const user = await User.create({
      name: name || email.split('@')[0],
      email,
      password,
      role: 'user',
      isVerified: false,
      status: 'active',
      loginAttempts: 0,
      preferences: {}
    } as any);

    // Generate token
    const token = (user as any).getSignedJwtToken();

    // Omit sensitive data from response
    const userData = user.get({ plain: true }) as any;
    delete userData.password;
    if (userData.resetPasswordToken) delete userData.resetPasswordToken;
    if (userData.resetPasswordExpire) delete userData.resetPasswordExpire;

    res.status(201).json({
      success: true,
      token,
      user: userData
    });
  })
];

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = [
  // Validation
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists(),
  
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', false);
    }

    const { email, password } = req.body;

    // Check if user exists and is active
    const user = await User.findOne({
      where: {
        email,
        status: 'active'
      }
    });

    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // Check if password matches
    const isMatch = await (user as any).matchPassword(password);

    if (!isMatch) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // Generate token
    const token = (user as any).getSignedJwtToken();

    // Omit sensitive data from response
    const userData = user.get({ plain: true }) as any;
    delete userData.password;
    if (userData.resetPasswordToken) delete userData.resetPasswordToken;
    if (userData.resetPasswordExpire) delete userData.resetPasswordExpire;

    res.json({
      success: true,
      token,
      user: userData
    });
  })
];

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, 'Not authorized');
  }
  
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpire'] }
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json({
    success: true,
    data: user
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = [
  // Validation
  body('email', 'Please include a valid email').isEmail(),
  
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', false);
    }

    const user = await User.findOne({ where: { email: req.body.email } });

    if (!user) {
      throw new ApiError(404, 'No user found with this email');
    }

    // Get reset token
    const resetToken = (user as any).getResetPasswordToken();

    // Save user with reset token
    await user.save();

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
      // Send email
      await sendEmail({
        to: user.email,
        subject: 'Your password reset token',
        text: message
      });

      res.json({ success: true, data: 'Email sent' });
    } catch (err) {
      console.error(err);
      (user as any).resetPasswordToken = undefined;
      (user as any).resetPasswordExpire = undefined;
      await user.save();
      throw new ApiError(500, 'Email could not be sent');
    }
  })
];

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
export const resetPassword = [
  // Validation
  body('password', 'Please include a password with 6 or more characters').isLength({ min: 6 }),
  
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', false);
    }

    // Get hashed token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params['resettoken'] || '').digest('hex');

    const user = await User.findOne({
      where: { resetPasswordToken: resetPasswordToken as any }
    });

    if (!user) {
      throw new ApiError(400, 'Invalid token or token has expired');
    }

    // Set new password
    (user as any).password = req.body.password;
    (user as any).resetPasswordToken = undefined;
    (user as any).resetPasswordExpire = undefined;
    await user.save();

    // Generate token
    const token = (user as any).getSignedJwtToken();

    // Omit sensitive data from response
    const userData = user.get({ plain: true }) as any;
    delete userData.password;
    if (userData.resetPasswordToken) delete userData.resetPasswordToken;
    if (userData.resetPasswordExpire) delete userData.resetPasswordExpire;

    res.json({
      success: true,
      token,
      user: userData
    });
  })
];

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
export const updateDetails = [
  // Validation
  body('email', 'Please include a valid email').optional().isEmail(),
  body('name', 'Name cannot be empty').optional().notEmpty(),
  
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', false);
    }
    
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, 'Not authorized');
    }

    const fieldsToUpdate: { name?: string; email?: string } = {};
    if (req.body.name) fieldsToUpdate.name = req.body.name;
    if (req.body.email) fieldsToUpdate.email = req.body.email;

    const user = await User.findByPk(userId);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Update user
    await user.update(fieldsToUpdate);

    // Get updated user without sensitive data
    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpire'] }
    });

    res.json({
      success: true,
      data: updatedUser
    });
  })
];

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
export const updatePassword = [
  // Validation
  body('currentPassword', 'Current password is required').notEmpty(),
  body('newPassword', 'Please include a password with 6 or more characters').isLength({ min: 6 }),
  
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', false);
    }

    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, 'Not authorized');
    }
    
    const user = await User.findByPk(userId);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Check current password
    const isMatch = await (user as any).matchPassword(req.body.currentPassword);

    if (!isMatch) {
      throw new ApiError(401, 'Password is incorrect');
    }

    // Update password
    (user as any).password = req.body.newPassword;
    await user.save();

    // Generate token
    const token = (user as any).getSignedJwtToken();

    // Omit sensitive data from response
    const userData = user.get({ plain: true }) as any;
    delete userData.password;
    if (userData.resetPasswordToken) delete userData.resetPasswordToken;
    if (userData.resetPasswordExpire) delete userData.resetPasswordExpire;

    res.json({
      success: true,
      token,
      user: userData
    });
  })
];

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

