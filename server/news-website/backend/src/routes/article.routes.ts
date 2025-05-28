import { Router } from 'express';
import ArticleController from '../controllers/article.controller';
import { CreateArticleDto, UpdateArticleDto, ArticleQueryDto } from '../dto/article.dto';
import { validationMiddleware, queryValidationMiddleware } from '../middlewares/validation.middleware';
import { authMiddleware, optionalAuth, adminMiddleware } from '../middlewares/auth.middleware';
import { Service } from 'typedi';

@Service()
class ArticleRoutes {
  public path = '/articles';
  public router = Router();
  public articleController = new ArticleController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Lấy danh sách bài viết (public, có phân trang, lọc, sắp xếp)
    this.router.get(
      `${this.path}`,
      queryValidationMiddleware(ArticleQueryDto),
      optionalAuth,
      this.articleController.getArticles
    );

    // Lấy danh sách bài viết nổi bật (public)
    this.router.get(
      `${this.path}/featured`,
      this.articleController.getFeaturedArticles
    );

    // Lấy danh sách danh mục bài viết (public)
    this.router.get(
      `${this.path}/categories`,
      this.articleController.getCategories
    );

    // Tạo bài viết mới (yêu cầu đăng nhập)
    this.router.post(
      `${this.path}`,
      authMiddleware,
      validationMiddleware(CreateArticleDto),
      this.articleController.createArticle
    );

    // Lấy chi tiết bài viết (public)
    this.router.get(
      `${this.path}/:id(\\d+)`,
      optionalAuth,
      this.articleController.getArticleById
    );

    // Cập nhật bài viết (chỉ tác giả hoặc admin)
    this.router.patch(
      `${this.path}/:id(\\d+)`,
      authMiddleware,
      validationMiddleware(UpdateArticleDto, true),
      this.articleController.updateArticle
    );

    // Xóa bài viết (chỉ tác giả hoặc admin)
    this.router.delete(
      `${this.path}/:id(\\d+)`,
      authMiddleware,
      this.articleController.deleteArticle
    );

    // ===== ADMIN ROUTES =====
    
    // Lấy tất cả bài viết (kể cả chưa công khai) - Chỉ admin
    this.router.get(
      `/admin${this.path}`,
      adminMiddleware,
      queryValidationMiddleware(ArticleQueryDto),
      this.articleController.getArticles
    );
  }
}

export default ArticleRoutes;
