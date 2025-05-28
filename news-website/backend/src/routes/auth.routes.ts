import AuthController from '../controllers/auth.controller';
import { CreateUserDto, LoginUserDto, ForgotPasswordDto, ResetPasswordDto } from '../dto/user.dto';
import { validationMiddleware } from '../middlewares/validation.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { BaseRoutes } from './base.routes';
import { Service } from 'typedi';

@Service()
class AuthRoutes extends BaseRoutes {
  public authController = new AuthController();

  constructor() {
    super('/auth');
  }

  protected getRoutes() {
    return [
      this.createRoute(
        '/register',
        'post',
        this.authController.register,
        [validationMiddleware(CreateUserDto)]
      ),
      this.createRoute(
        '/login',
        'post',
        this.authController.login,
        [validationMiddleware(LoginUserDto)]
      ),
      this.createRoute(
        '/refresh-token',
        'post',
        this.authController.refreshToken
      ),
      this.createRoute(
        '/logout',
        'post',
        this.authController.logout,
        [authMiddleware]
      ),
      this.createRoute(
        '/verify-email/:token',
        'get',
        this.authController.verifyEmail
      ),
      this.createRoute(
        '/forgot-password',
        'post',
        this.authController.forgotPassword,
        [validationMiddleware(ForgotPasswordDto)]
      ),
      this.createRoute(
        '/reset-password',
        'post',
        this.authController.resetPassword,
        [validationMiddleware(ResetPasswordDto)]
      ),
      this.createRoute(
        '/me',
        'get',
        this.authController.getCurrentUser,
        [authMiddleware]
      )
    ];
  }
}

export default AuthRoutes;
