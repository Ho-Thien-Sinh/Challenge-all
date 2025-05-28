import ArticleController from '../controllers/article.controller';
import { CreateArticleDto, UpdateArticleDto, ArticleQueryDto } from '../dto/article.dto';
import { validationMiddleware, queryValidationMiddleware } from '../middlewares/validation.middleware';
import { authMiddleware, optionalAuth, adminMiddleware } from '../middlewares/auth.middleware';
import { BaseRoutes } from './base.routes';
import { Service } from 'typedi';

@Service()
class ArticleRoutes extends BaseRoutes {
  public articleController = new ArticleController();

  constructor() {
    super('/articles');
  }

  protected getRoutes() {
    return [
      // Public routes
      this.createRoute(
        '',
        'get',
        this.articleController.getArticles,
        [queryValidationMiddleware(ArticleQueryDto), optionalAuth]
      ),
      this.createRoute(
        '/featured',
        'get',
        this.articleController.getFeaturedArticles
      ),
      this.createRoute(
        '/categories',
        'get',
        this.articleController.getCategories
      ),
      this.createRoute(
        '/:id',
        'get',
        this.articleController.getArticleById,
        [optionalAuth]
      ),

      // Protected routes
      this.createRoute(
        '',
        'post',
        this.articleController.createArticle,
        [authMiddleware, validationMiddleware(CreateArticleDto)]
      ),
      this.createRoute(
        '/:id',
        'patch',
        this.articleController.updateArticle,
        [authMiddleware, validationMiddleware(UpdateArticleDto, true)]
      ),
      this.createRoute(
        '/:id',
        'delete',
        this.articleController.deleteArticle,
        [authMiddleware]
      ),

      // Admin routes
      this.createRoute(
        '/admin',
        'get',
        this.articleController.getArticles,
        [adminMiddleware, queryValidationMiddleware(ArticleQueryDto)]
      )
    ];
  }
}

export default ArticleRoutes;
