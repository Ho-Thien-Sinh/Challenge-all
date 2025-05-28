import { Op, WhereOptions } from 'sequelize';
import { Service } from 'typedi';
import { Article, User } from '../models';
import { ArticleStatus } from '../types/article.types';
import { CreateArticleDto, UpdateArticleDto, ArticleQueryDto, ArticleResponseDto } from '../dto/article.dto';
import { NotFoundException, BadRequestException } from '../exceptions/HttpException';
import logger from '../utils/logger';

@Service()
export class ArticleService {
  async getAllArticles(query: ArticleQueryDto, currentUser?: any) {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      status,
      authorId,
      isFeatured,
      sortBy = 'publishedAt',
      order = 'DESC',
    } = query;

    const offset = (page - 1) * limit;
    
    let where: any = {};
    
    // Only show published articles to non-admins
    if (!currentUser || currentUser.role !== 'admin') {
      where.status = ArticleStatus.PUBLISHED;
    } else if (status) {
      if (status === 'published') {
        where.status = ArticleStatus.PUBLISHED;
      } else if (status === 'draft') {
        where.status = ArticleStatus.DRAFT;
      } else if (status === 'archived') {
        where.status = ArticleStatus.ARCHIVED;
      } else {
        where.status = status;
      }
    }
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } },
        { summary: { [Op.iLike]: `%${search}%` } },
      ];
    }
    
    if (category) {
      where.category = category;
    }
    
    if (authorId) {
      where.authorId = authorId;
    }
    
    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }
    
    const { count, rows } = await Article.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortBy, order]],
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });
    
    return {
      data: rows.map(article => new ArticleResponseDto(article.toJSON())),
      pagination: {
        total: count,
        page,
        totalPages: Math.ceil(count / limit),
        limit,
      },
    };
  }
  
  async getArticleById(id: number, incrementViews: boolean = false): Promise<ArticleResponseDto> {
    const article = await Article.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });
    
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    
    // Increment view count if the article is published
    if (incrementViews && article.status === ArticleStatus.PUBLISHED) {
      article.views = (article.views || 0) + 1;
      await article.save();
    }
    
    return new ArticleResponseDto(article.toJSON());
  }
  
  async createArticle(articleData: CreateArticleDto, authorId?: number): Promise<ArticleResponseDto> {
    const article = await Article.create({
      ...articleData,
      authorId,
      // If no authorId is provided but authorName is, use that
      ...(authorId ? {} : { authorName: articleData.authorName || 'Anonymous' }),
    });
    
    // Reload to get associations
    const createdArticle = await Article.findByPk(article.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });
    
    return new ArticleResponseDto(createdArticle!.toJSON());
  }
  
  async updateArticle(
    id: number,
    articleData: UpdateArticleDto,
    currentUser: any
  ): Promise<ArticleResponseDto> {
    const article = await Article.findByPk(id);
    
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    
    // Only the author or an admin can update the article
    if (currentUser.role !== 'admin' && article.authorId !== currentUser.id) {
      throw new BadRequestException('You can only update your own articles');
    }
    
    // Prevent changing the author unless you're an admin
    if (articleData.authorId && currentUser.role !== 'admin') {
      delete articleData.authorId;
    }
    
    await article.update(articleData);
    
    // Reload to get associations
    const updatedArticle = await Article.findByPk(article.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });
    
    return new ArticleResponseDto(updatedArticle!.toJSON());
  }
  
  async deleteArticle(id: number, currentUser: any): Promise<void> {
    const article = await Article.findByPk(id);
    
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    
    // Only the author or an admin can delete the article
    if (currentUser.role !== 'admin' && article.authorId !== currentUser.id) {
      throw new BadRequestException('You can only delete your own articles');
    }
    
    await article.destroy();
  }
  
  async getCategories(): Promise<string[]> {
    const categories = await Article.findAll({
      attributes: ['category'],
      group: ['category'],
      where: {
        category: { [Op.not]: null },
        status: ArticleStatus.PUBLISHED,
      },
    });
    
    return categories
      .map(cat => cat.category)
      .filter((cat): cat is string => cat !== null);
  }
  
  async getFeaturedArticles(limit: number = 5): Promise<ArticleResponseDto[]> {
    const articles = await Article.findAll({
      where: {
        isFeatured: true,
        status: ArticleStatus.PUBLISHED,
      },
      limit,
      order: [['publishedAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name'],
        },
      ],
    });
    
    return articles.map(article => new ArticleResponseDto(article.toJSON()));
  }
}
