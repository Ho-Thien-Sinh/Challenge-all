import { compare } from 'bcryptjs';
import { Op } from 'sequelize';
import { verify } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { Service } from 'typedi';
import { JWT_CONFIG } from '../config';
import { User } from '../models';
import { UserResponseDto } from '../dto/user.dto';
import { BadRequestException, UnauthorizedException } from '../exceptions/HttpException';
import { AuthUtils } from '../utils/auth.utils';
import { EmailUtils } from '../utils/email.utils';

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

    await EmailUtils.sendVerificationEmail(user.email, verificationToken);
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

    const accessToken = AuthUtils.generateToken(user, 'access');
    const refreshToken = AuthUtils.generateToken(user, 'refresh');

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

      const newAccessToken = AuthUtils.generateToken(user, 'access');
      const newRefreshToken = AuthUtils.generateToken(user, 'refresh');

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

    await EmailUtils.sendPasswordResetEmail(user.email, resetToken);
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
}
