import { Op, WhereOptions } from 'sequelize';
import { Service } from 'typedi';
import { Article, User } from '../models';
import { ArticleStatus } from '../types/article.types';
import { CreateArticleDto, UpdateArticleDto, ArticleQueryDto, ArticleResponseDto } from '../dto/article.dto';
import { NotFoundException, BadRequestException } from '../exceptions/HttpException';
import logger from '../utils/logger';
import { ServiceUtils, PaginationParams, PaginationResult } from '../utils/service.utils';

@Service()
export class ArticleService {
  async getAllArticles(params: PaginationParams): Promise<PaginationResult<ArticleResponseDto>> {
    try {
      const { search, category, status, authorId } = params;
      const where: any = {};

      if (search) {
        where[Op.or] = ServiceUtils.buildSearchConditions(search, ['title', 'content']);
      }

      if (category) {
        where.category = category;
      }

      if (status) {
        where.status = status;
      }

      if (authorId) {
        where.authorId = authorId;
      }

      const { count, rows } = await Article.findAndCountAll({
        where,
        ...ServiceUtils.buildPaginationQuery(params),
        include: [{
          association: 'author',
          attributes: ['id', 'username', 'email', 'role']
        }]
      });

      return ServiceUtils.formatPaginationResult(
        rows.map(article => new ArticleResponseDto(article.toJSON())),
        count,
        params.page,
        params.limit
      );
    } catch (error) {
      ServiceUtils.handleDatabaseError(error, 'get articles');
    }
  }

  async getArticleById(id: number): Promise<ArticleResponseDto> {
    try {
      const article = await Article.findByPk(id, {
        include: [{
          association: 'author',
          attributes: ['id', 'username', 'email', 'role']
        }]
      });

      if (!article) {
        throw new NotFoundException('Article not found');
      }

      return new ArticleResponseDto(article.toJSON());
    } catch (error) {
      ServiceUtils.handleDatabaseError(error, 'get article');
    }
  }

  async createArticle(articleData: CreateArticleDto, authorId: number): Promise<ArticleResponseDto> {
    try {
      const article = await Article.create({
        ...articleData,
        authorId,
        status: 'draft'
      });

      const createdArticle = await Article.findByPk(article.id, {
        include: [{
          association: 'author',
          attributes: ['id', 'username', 'email', 'role']
        }]
      });

      if (!createdArticle) {
        throw new Error('Failed to retrieve created article');
      }

      return new ArticleResponseDto(createdArticle.toJSON());
    } catch (error) {
      ServiceUtils.handleDatabaseError(error, 'create article');
    }
  }

  async updateArticle(id: number, updateData: UpdateArticleDto, userId: number, userRole: string): Promise<ArticleResponseDto> {
    try {
      const article = await Article.findByPk(id);

      if (!article) {
        throw new NotFoundException('Article not found');
      }

      if (!ServiceUtils.hasPermission(userId, userRole, article.authorId)) {
        throw new BadRequestException('You do not have permission to update this article');
      }

      await article.update(updateData);

      const updatedArticle = await Article.findByPk(id, {
        include: [{
          association: 'author',
          attributes: ['id', 'username', 'email', 'role']
        }]
      });

      if (!updatedArticle) {
        throw new Error('Failed to retrieve updated article');
      }

      return new ArticleResponseDto(updatedArticle.toJSON());
    } catch (error) {
      ServiceUtils.handleDatabaseError(error, 'update article');
    }
  }

  async deleteArticle(id: number, userId: number, userRole: string): Promise<void> {
    try {
      const article = await Article.findByPk(id);

      if (!article) {
        throw new NotFoundException('Article not found');
      }

      if (!ServiceUtils.hasPermission(userId, userRole, article.authorId)) {
        throw new BadRequestException('You do not have permission to delete this article');
      }

      await article.destroy();
    } catch (error) {
      ServiceUtils.handleDatabaseError(error, 'delete article');
    }
  }

  async getCategories(): Promise<string[]> {
    try {
      const categories = await Article.findAll({
        attributes: ['category'],
        group: ['category'],
        raw: true
      });

      return categories.map(cat => cat.category).filter(Boolean);
    } catch (error) {
      ServiceUtils.handleDatabaseError(error, 'get categories');
    }
  }

  async getFeaturedArticles(limit: number = 5): Promise<ArticleResponseDto[]> {
    try {
      const articles = await Article.findAll({
        where: {
          status: 'published',
          isFeatured: true
        },
        limit,
        order: [['publishedAt', 'DESC']],
        include: [{
          association: 'author',
          attributes: ['id', 'username', 'email', 'role']
        }]
      });

      return articles.map(article => new ArticleResponseDto(article.toJSON()));
    } catch (error) {
      ServiceUtils.handleDatabaseError(error, 'get featured articles');
    }
  }
}
