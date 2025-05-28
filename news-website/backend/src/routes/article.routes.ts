import ArticleController from '../controllers/article.controller';
import { CreateArticleDto, UpdateArticleDto } from '../dto/article.dto';
import { validationMiddleware } from '../middlewares/validation.middleware';
import { authMiddleware, optionalAuth, adminMiddleware } from '../middlewares/auth.middleware';
import { BaseRoutes } from './base.routes';
import { Service } from 'typedi';

@Service()
class ArticleRoutes extends BaseRoutes {
  public articleController = ArticleController;

  constructor() {
    super('/articles');
  }

  protected getRoutes() {
    return [
      // Public routes
      this.createRoute(
        '',
        'get',
        this.articleController.getAllArticles,
        [optionalAuth]
      ),
      this.createRoute(
        '/featured',
        'get',
        this.articleController.getFeaturedArticles
      ),
      this.createRoute(
        '/categories',
        'get',
        this.articleController.getArticleCategories
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
        this.articleController.getAllArticles,
        [adminMiddleware]
      )
    ];
  }
}

export default new ArticleRoutes();
