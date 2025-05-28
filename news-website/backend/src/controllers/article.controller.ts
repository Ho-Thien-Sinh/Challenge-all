import { Request, Response } from 'express';
import { Container } from 'typedi';
import { BaseController } from './base.controller';
import { ArticleService } from '../services/article.service';
import { CreateArticleDto, UpdateArticleDto } from '../dto/article.dto';
import { ArticleResponseDto } from '../dto/article.dto';
import { UserRole } from '../models/User.model';
import { ForbiddenException } from '../exceptions/HttpException';
import { PaginationParams } from '../utils/service.utils';

class ArticleController extends BaseController {
  public articleService = Container.get(ArticleService);

  constructor() {
    super();
  }

  public async getAllArticles(req: Request, res: Response): Promise<void> {
    const query = this.parsePaginationQuery(req);
    const params: PaginationParams & { category?: string; status?: string; authorId?: number } = {
      ...query,
      category: req.query.category as string,
      status: req.query.status as string,
      authorId: req.query.authorId ? parseInt(req.query.authorId as string) : undefined
    };
    
    const result = await this.articleService.getAllArticles(params);
    
    this.sendPaginatedResponse(
      res,
      result.data,
      result.pagination
    );
  }

  public async getArticleById(req: Request, res: Response): Promise<void> {
    const articleId = parseInt(req.params.id);
    const article = await this.articleService.getArticleById(articleId);
    this.sendSuccess(res, article);
  }

  public async createArticle(req: Request, res: Response): Promise<void> {
    const articleData: CreateArticleDto = req.body;
    const authorId = (req as any).user.id;
    
    const article = await this.articleService.createArticle(articleData, authorId);
    this.sendSuccess(res, article, 201);
  }

  public async updateArticle(req: Request, res: Response): Promise<void> {
    const articleId = parseInt(req.params.id);
    const articleData: UpdateArticleDto = req.body;
    const currentUser = (req as any).user;
    
    const article = await this.articleService.getArticleById(articleId);
    
    if (currentUser.role !== UserRole.ADMIN && article.authorId !== currentUser.id) {
      throw new ForbiddenException('You do not have permission to update this article');
    }

    const updatedArticle = await this.articleService.updateArticle(
      articleId,
      articleData,
      currentUser.id,
      currentUser.role
    );
    this.sendSuccess(res, updatedArticle);
  }

  public async deleteArticle(req: Request, res: Response): Promise<void> {
    const articleId = parseInt(req.params.id);
    const currentUser = (req as any).user;
    
    const article = await this.articleService.getArticleById(articleId);
    
    if (currentUser.role !== UserRole.ADMIN && article.authorId !== currentUser.id) {
      throw new ForbiddenException('You do not have permission to delete this article');
    }

    await this.articleService.deleteArticle(articleId, currentUser.id, currentUser.role);
    res.status(204).send();
  }

  public async getFeaturedArticles(req: Request, res: Response): Promise<void> {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    const articles = await this.articleService.getFeaturedArticles(limit);
    this.sendSuccess(res, articles);
  }

  public async getArticleCategories(req: Request, res: Response): Promise<void> {
    const categories = await this.articleService.getCategories();
    this.sendSuccess(res, categories);
  }
}

export default new ArticleController();
