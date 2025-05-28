import UserController from '../controllers/user.controller';
import { UpdateUserDto } from '../dto/user.dto';
import { validationMiddleware } from '../middlewares/validation.middleware';
import { adminMiddleware, authMiddleware } from '../middlewares/auth.middleware';
import { BaseRoutes } from './base.routes';
import { Service } from 'typedi';

@Service()
class UserRoutes extends BaseRoutes {
  public userController = new UserController();

  constructor() {
    super('/users');
  }

  protected getRoutes() {
    return [
      // Admin routes
      this.createRoute(
        '',
        'get',
        this.userController.getUsers,
        [adminMiddleware]
      ),
      this.createRoute(
        '/:id',
        'delete',
        this.userController.deleteUser,
        [adminMiddleware]
      ),

      // Protected routes
      this.createRoute(
        '/me',
        'get',
        this.userController.getCurrentUser,
        [authMiddleware]
      ),
      this.createRoute(
        '/:id',
        'get',
        this.userController.getUserById,
        [authMiddleware]
      ),
      this.createRoute(
        '/:id/profile',
        'get',
        this.userController.getUserProfile,
        [authMiddleware]
      ),
      this.createRoute(
        '/:id',
        'patch',
        this.userController.updateUser,
        [authMiddleware, validationMiddleware(UpdateUserDto, true)]
      )
    ];
  }
}

export default UserRoutes;
