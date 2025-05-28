import { Request, Response } from 'express';
import { Container } from 'typedi';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { CreateUserDto, LoginUserDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto } from '../dto/user.dto';
import { UserResponseDto } from '../dto/user.dto';
import { BaseController } from './base.controller';

class AuthController extends BaseController {
  public authService = Container.get(AuthService);
  public userService = Container.get(UserService);

  public register = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userData: CreateUserDto = req.body;
    const user = await this.authService.register(userData);
    
    this.sendSuccess(
      res,
      new UserResponseDto(user.toJSON()),
      201,
      'Registration successful. Please check your email to verify your account.'
    );
  });

  public login = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userData: LoginUserDto = req.body;
    const { user, accessToken, refreshToken } = await this.authService.login(
      userData.email,
      userData.password
    );

    // Set HTTP-only cookie for refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    this.sendSuccess(res, { user, accessToken });
  });

  public refreshToken = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    
    if (!refreshToken) {
      throw new Error('No refresh token provided');
    }

    const { accessToken, refreshToken: newRefreshToken } = await this.authService.refreshToken(refreshToken);

    // Set new refresh token in HTTP-only cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    this.sendSuccess(res, { accessToken });
  });

  public logout = (req: Request, res: Response): void => {
    res.clearCookie('refreshToken');
    this.sendSuccess(res, null, 200, 'Successfully logged out');
  };

  public verifyEmail = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { token } = req.params as unknown as VerifyEmailDto;
    await this.authService.verifyEmail(token);
    
    this.sendSuccess(res, null, 200, 'Email verified successfully');
  });

  public forgotPassword = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body as ForgotPasswordDto;
    await this.authService.forgotPassword(email);
    
    this.sendSuccess(
      res,
      null,
      200,
      'If an account with that email exists, a password reset link has been sent'
    );
  });

  public resetPassword = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const resetData: ResetPasswordDto = req.body;
    await this.authService.resetPassword(resetData.token, resetData.password);
    
    this.sendSuccess(res, null, 200, 'Password reset successful');
  });

  public getCurrentUser = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user.id;
    const user = await this.userService.getUserById(userId);
    
    this.sendSuccess(res, user);
  });
}

export default AuthController;
