import { compare } from 'bcryptjs';
import { Op } from 'sequelize';
import { sign, verify } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { Service } from 'typedi';
import { JWT_CONFIG } from '../config';
import { User } from '../models';
import { UserResponseDto } from '../dto/user.dto';
import { BadRequestException, UnauthorizedException } from '../exceptions/HttpException';
import { sendEmail } from '../utils/email';
import logger from '../utils/logger';

@Service()
export class AuthService {
  async register(userData: any): Promise<User> {
    const existingUser = await User.findOne({ where: { email: userData.email } });
    
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const verificationToken = uuidv4();
    const user = await User.create({
      ...userData,
      verificationToken,
    });

    // Send verification email
    await this.sendVerificationEmail(user.email, verificationToken);

    return user;
  }

  async login(email: string, password: string): Promise<{ user: UserResponseDto; accessToken: string; refreshToken: string }> {
    const user = await User.findOne({ where: { email } });

    if (!user || !(await user.comparePassword(password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email first');
    }

    const accessToken = this.generateToken(user, 'access');
    const refreshToken = this.generateToken(user, 'refresh');

    return {
      user: new UserResponseDto(user.toJSON()),
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = verify(refreshToken, JWT_CONFIG.secret) as { id: number; type: string };
      
      if (decoded.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const newAccessToken = this.generateToken(user, 'access');
      const newRefreshToken = this.generateToken(user, 'refresh');

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await User.findOne({ where: { verificationToken: token } });

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      // Don't reveal that the email doesn't exist
      return;
    }

    const resetToken = uuidv4();
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour expiration

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    // Send password reset email
    await this.sendPasswordResetEmail(user.email, resetToken);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
  }

  private generateToken(user: User, type: 'access' | 'refresh'): string {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      type,
    };

    const expiresIn: string | number = type === 'access' 
      ? JWT_CONFIG.expiresIn 
      : JWT_CONFIG.refreshExpiresIn;

    return sign(payload, JWT_CONFIG.secret, { expiresIn } as any);
  }

  private async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    const verificationText = `Welcome to our News App!\n\nPlease click the link below to verify your email address:\n${verificationUrl}\n\nIf you didn't create an account, please ignore this email.`;
    
    try {
      await sendEmail({
        to: email,
        subject: 'Verify your email',
        text: verificationText,
        html: `
          <h1>Welcome to our News App!</h1>
          <p>Please click the link below to verify your email address:</p>
          <a href="${verificationUrl}">Verify Email</a>
          <p>Or copy and paste this link into your browser:</p>
          <p>${verificationUrl}</p>
          <p>If you didn't create an account, please ignore this email.</p>
        `,
      });
    } catch (error) {
      logger.error('Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  private async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    try {
      await sendEmail({
        to: email,
        subject: 'Password Reset Request',
        text: `You requested a password reset. Please use the following link to set a new password: ${resetUrl} \n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.`,
        html: `
          <h1>Password Reset</h1>
          <p>You requested a password reset. Click the link below to set a new password:</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>Or copy and paste this link into your browser:</p>
          <p>${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      });
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }
}
