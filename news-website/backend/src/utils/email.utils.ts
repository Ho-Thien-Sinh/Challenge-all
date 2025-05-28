import { sendEmail } from './email';
import logger from './logger';

export class EmailUtils {
  /**
   * Send verification email
   * @param email User email
   * @param token Verification token
   */
  static async sendVerificationEmail(email: string, token: string): Promise<void> {
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

  /**
   * Send password reset email
   * @param email User email
   * @param token Reset token
   */
  static async sendPasswordResetEmail(email: string, token: string): Promise<void> {
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