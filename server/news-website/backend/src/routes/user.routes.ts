import { Router } from 'express';
import UserController from '../controllers/user.controller';
import { UpdateUserDto } from '../dto/user.dto';
import { validationMiddleware } from '../middlewares/validation.middleware';
import { adminMiddleware, authMiddleware } from '../middlewares/auth.middleware';
import { Service } from 'typedi';

@Service()
class UserRoutes {
  public path = '/users';
  public router = Router();
  public userController = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Lấy danh sách người dùng (chỉ admin)
    this.router.get(
      `${this.path}`,
      adminMiddleware,
      this.userController.getUsers
    );

    // Lấy thông tin người dùng hiện tại
    this.router.get(
      `${this.path}/me`,
      authMiddleware,
      this.userController.getCurrentUser
    );

    // Lấy thông tin người dùng theo ID
    this.router.get(
      `${this.path}/:id(\\d+)`,
      authMiddleware,
      this.userController.getUserById
    );

    // Lấy thông tin chi tiết người dùng (kèm bài viết)
    this.router.get(
      `${this.path}/:id(\\d+)/profile`,
      authMiddleware,
      this.userController.getUserProfile
    );

    // Cập nhật thông tin người dùng
    this.router.patch(
      `${this.path}/:id(\\d+)`,
      authMiddleware,
      validationMiddleware(UpdateUserDto, true),
      this.userController.updateUser
    );

    // Xóa người dùng (chỉ admin)
    this.router.delete(
      `${this.path}/:id(\\d+)`,
      adminMiddleware,
      this.userController.deleteUser
    );
  }
}

export default UserRoutes;
