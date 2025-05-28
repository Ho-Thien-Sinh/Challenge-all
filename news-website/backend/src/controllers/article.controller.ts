import { Request, Response } from 'express';
import { Container } from 'typedi';
import { ArticleService } from '../services/article.service';
import { CreateArticleDto, UpdateArticleDto, ArticleQueryDto } from '../dto/article.dto';
import { BaseController } from './base.controller';
import { UserRole } from '../types';

class ArticleController extends BaseController {
  public articleService = Container.get(ArticleService);

  public getArticles = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const query = this.parsePaginationQuery(req);
    const articleQuery: ArticleQueryDto = {
      ...query,
      category: req.query.category as string,
      status: req.query.status as any,
      authorId: req.query.authorId as string,
      isFeatured: req.query.isFeatured ? req.query.isFeatured === 'true' : undefined
    };
    
    const result = await this.articleService.getAllArticles(articleQuery);
    this.sendPaginatedResponse(res, result.data, result.pagination);
  });

  public getArticleById = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const articleId = parseInt(req.params.id);
    const article = await this.articleService.getArticleById(articleId);
    
    this.sendSuccess(res, article);
  });

  public createArticle = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const articleData: CreateArticleDto = req.body;
    const currentUser = (req as any).user;
    
    const article = await this.articleService.createArticle(articleData, currentUser?.id);
    this.sendSuccess(res, article, 201);
  });

  public updateArticle = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const articleId = parseInt(req.params.id);
    const articleData: UpdateArticleDto = req.body;
    const currentUser = (req as any).user;
    
    this.checkPermission(currentUser, articleId, [UserRole.ADMIN, UserRole.EDITOR]);
    
    const updatedArticle = await this.articleService.updateArticle(
      articleId,
      articleData,
      currentUser.id,
      currentUser.role
    );
    
    this.sendSuccess(res, updatedArticle);
  });

  public deleteArticle = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const articleId = parseInt(req.params.id);
    const currentUser = (req as any).user;
    
    this.checkPermission(currentUser, articleId, [UserRole.ADMIN, UserRole.EDITOR]);
    
    await this.articleService.deleteArticle(articleId, currentUser.id, currentUser.role);
    this.sendSuccess(res, null, 200, 'Article deleted successfully');
  });

  public getCategories = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const categories = await this.articleService.getCategories();
    this.sendSuccess(res, categories);
  });

  public getFeaturedArticles = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const limit = parseInt(req.query.limit as string) || 5;
    const articles = await this.articleService.getFeaturedArticles(limit);
    this.sendSuccess(res, articles);
  });
}

export default ArticleController;
