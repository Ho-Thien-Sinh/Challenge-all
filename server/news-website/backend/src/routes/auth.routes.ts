import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import { CreateUserDto, LoginUserDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto } from '../dto/user.dto';
import { validationMiddleware } from '../middlewares/validation.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';

import { Service } from 'typedi';

@Service()
class AuthRoutes {
  public path = '/auth';
  public router = Router();
  public authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Đăng ký tài khoản mới
    this.router.post(
      `${this.path}/register`,
      validationMiddleware(CreateUserDto),
      this.authController.register
    );

    // Đăng nhập
    this.router.post(
      `${this.path}/login`,
      validationMiddleware(LoginUserDto),
      this.authController.login
    );

    // Làm mới token
    this.router.post(
      `${this.path}/refresh-token`,
      this.authController.refreshToken
    );

    // Đăng xuất
    this.router.post(
      `${this.path}/logout`,
      authMiddleware,
      this.authController.logout
    );

    // Xác thực email
    this.router.get(
      `${this.path}/verify-email/:token`,
      this.authController.verifyEmail
    );

    // Quên mật khẩu
    this.router.post(
      `${this.path}/forgot-password`,
      validationMiddleware(ForgotPasswordDto),
      this.authController.forgotPassword
    );

    // Đặt lại mật khẩu
    this.router.post(
      `${this.path}/reset-password`,
      validationMiddleware(ResetPasswordDto),
      this.authController.resetPassword
    );

    // Lấy thông tin người dùng hiện tại
    this.router.get(
      `${this.path}/me`,
      authMiddleware,
      this.authController.getCurrentUser
    );
  }
}

export default AuthRoutes;
