import { Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import { ArticleService } from '../services/article.service';
import { CreateArticleDto, UpdateArticleDto, ArticleQueryDto } from '../dto/article.dto';
import { validationMiddleware } from '../middlewares/validation.middleware';

class ArticleController {
  public articleService = Container.get(ArticleService);

  public getArticles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query: ArticleQueryDto = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string,
        category: req.query.category as string,
        status: req.query.status as any,
        authorId: req.query.authorId as string,
        isFeatured: req.query.isFeatured ? req.query.isFeatured === 'true' : undefined,
        sortBy: req.query.sortBy as string,
        order: req.query.order as 'ASC' | 'DESC',
      };
      
      const result = await this.articleService.getAllArticles(query, (req as any).user);
      
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  public getArticleById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const articleId = parseInt(req.params.id);
      const incrementViews = req.query.incrementViews === 'true';
      const article = await this.articleService.getArticleById(articleId, incrementViews);
      
      res.status(200).json({
        success: true,
        data: article,
      });
    } catch (error) {
      next(error);
    }
  };

  public createArticle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const articleData: CreateArticleDto = req.body;
      const currentUser = (req as any).user;
      
      const article = await this.articleService.createArticle(
        articleData,
        currentUser?.id
      );
      
      res.status(201).json({
        success: true,
        data: article,
      });
    } catch (error) {
      next(error);
    }
  };

  public updateArticle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const articleId = parseInt(req.params.id);
      const articleData: UpdateArticleDto = req.body;
      const currentUser = (req as any).user;
      
      const updatedArticle = await this.articleService.updateArticle(
        articleId,
        articleData,
        currentUser
      );
      
      res.status(200).json({
        success: true,
        data: updatedArticle,
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteArticle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const articleId = parseInt(req.params.id);
      const currentUser = (req as any).user;
      
      await this.articleService.deleteArticle(articleId, currentUser);
      
      res.status(200).json({
        success: true,
        message: 'Article deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await this.articleService.getCategories();
      
      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  };

  public getFeaturedArticles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const articles = await this.articleService.getFeaturedArticles(limit);
      
      res.status(200).json({
        success: true,
        data: articles,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default ArticleController;
