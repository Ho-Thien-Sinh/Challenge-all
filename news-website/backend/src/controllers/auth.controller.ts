import { Request, Response } from 'express';
import { Container } from 'typedi';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { UserResponseDto } from '../dto/user.dto';
import { BaseController } from './base.controller';
import { UserRole } from '../models/User.model';

// Define DTOs locally since auth.dto.ts is missing
interface LoginDto {
  email: string;
  password: string;
}

interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

interface VerifyEmailDto {
  token: string;
}

interface ResetPasswordDto {
  token: string;
  password: string;
}

class AuthController extends BaseController {
  private readonly authService: AuthService;
  private readonly userService: UserService;

  constructor() {
    super();
    this.authService = Container.get(AuthService);
    this.userService = Container.get(UserService);
  }

  public async register(req: Request, res: Response): Promise<void> {
    const userData: RegisterDto = req.body;
    const user = await this.authService.register(userData);
    this.sendSuccess(res, new UserResponseDto(user), 201);
  }

  public async login(req: Request, res: Response): Promise<void> {
    const { email, password }: LoginDto = req.body;
    const { user, accessToken, refreshToken } = await this.authService.login(email, password);
    this.sendSuccess(res, { 
      user: new UserResponseDto(user), 
      accessToken,
      refreshToken 
    });
  }

  public async verifyEmail(req: Request, res: Response): Promise<void> {
    const { token }: VerifyEmailDto = req.body;
    await this.authService.verifyEmail(token);
    this.sendSuccess(res, null, 200, 'Email verified successfully');
  }

  public async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    await this.authService.forgotPassword(email);
    this.sendSuccess(res, null, 200, 'Password reset instructions sent to your email');
  }

  public async resetPassword(req: Request, res: Response): Promise<void> {
    const { token, password }: ResetPasswordDto = req.body;
    await this.authService.resetPassword(token, password);
    this.sendSuccess(res, null, 200, 'Password reset successfully');
  }

  public async getCurrentUser(req: Request, res: Response): Promise<void> {
    const userId = (req as any).user.id;
    const user = await this.userService.getUserById(userId);
    this.sendSuccess(res, user);
  }
}

export default new AuthController();
