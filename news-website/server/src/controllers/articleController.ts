import { Request, Response, NextFunction } from 'express';
import { Op, WhereOptions, Includeable } from 'sequelize';
import asyncHandler from '../middleware/asyncHandler';
import { ArticleCategory } from '@/models';

// Định nghĩa interface cho models
interface Models {
  Article: any;
  Category: any;
  ArticleCategory: any;
  User: any;
  [key: string]: any;
}

// Lấy models từ app trong mỗi request
const getModels = (req: Request): Models => {
  return req.app.get('models');
};

// Interfaces
interface IRequestQuery {
  page?: string;
  limit?: string;
  search?: string;
  category?: string;
  sortBy?: string;
  [key: string]: any;
}

interface IPaginationResult {
  success: boolean;
  count: number;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  data: any[];
}

// Custom error class
class CustomError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

// @desc    Get all articles
// @route   GET /api/v1/articles
// @access  Public
export const getArticles = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { Article, Category, ArticleCategory, User } = getModels(req);
  try {
    const query = req.query as IRequestQuery;
    
    // Lấy tham số từ query
    const page = query.page ? parseInt(query.page) : 1;
    const limit = query.limit ? parseInt(query.limit) : 20;
    const offset = (page - 1) * limit;
    
    // Tạo điều kiện where
    const where: WhereOptions = { isPublished: true };
    
    // Xử lý tìm kiếm
    if (query.search) {
      // Sửa lỗi TypeScript bằng cách ép kiểu where thành any
      (where as any)[Op.or] = [
        { title: { [Op.like]: `%${query.search}%` } },
        { content: { [Op.like]: `%${query.search}%` } },
      ];
    }
    
    // Xử lý danh mục (nếu có)
    let articleIds: number[] = [];
    if (query.category) {
      const categoryArticles = await ArticleCategory.findAll({
        where: { categoryId: query.category },
        attributes: ['articleId'],
        raw: true
      });
      articleIds = categoryArticles.map(ca => ca.articleId);
    }
    
    // Nếu có lọc theo category, thêm điều kiện vào where
    if (articleIds.length > 0) {
      (where as any).id = { [Op.in]: articleIds };
    }
    
    // Xử lý sắp xếp
    const order: [string, string][] = [['publishedAt', 'DESC']];
    if (query.sortBy) {
      const [field, direction = 'DESC'] = query.sortBy.split(':');
      if (field) {
        order[0] = [field, direction.toUpperCase()];
      }
    }
    
    // Cấu hình include
    const include: Includeable[] = [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'email']
      },
      {
        model: Category,
        as: 'categories',
        through: { attributes: [] },
        attributes: ['id', 'name', 'slug']
      }
    ];
    
    // Lấy danh sách bài viết với phân trang
    const { count: total, rows: articles } = await Article.findAndCountAll({
      where,
      include,
      order,
      limit,
      offset,
      distinct: true
    });
    
    // Tính tổng số trang
    const totalPages = Math.ceil(total / limit);
    
    // Format dữ liệu trả về
    const response: IPaginationResult = {
      success: true,
      count: articles.length,
      pagination: {
        total,
        page,
        limit,
        totalPages
      },
      data: articles
    };
    
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

// @desc    Get single article
// @route   GET /api/articles/:id
// @access  Public
export const getArticle = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const article = await Article.findByPk(Number(id), {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Category,
          as: 'categories',
          through: { attributes: [] },
          attributes: ['id', 'name', 'slug']
        }
      ]
    });

    if (!article) {
      return next(new CustomError(`Article not found with id of ${id}`, 404));
    }

    // Tăng view count
    article.viewCount += 1;
    await article.save();

    res.status(200).json({
      success: true,
      data: article
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Create new article
// @route   POST /api/articles
// @access  Private/Admin/Author
export const createArticle = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { Article, Category, ArticleCategory, User } = getModels(req);
  try {
    // Lấy thông tin từ request body
    const { title, content, excerpt, featuredImage, categories, isPublished = true } = req.body;
    
    // Tạm thời bỏ qua xác thực người dùng để kiểm tra
    // Sử dụng một authorId mặc định hoặc yêu cầu client gửi lên
    const authorId = 1; // Tạm thời sử dụng authorId = 1
    
    // Tạo slug từ tiêu đề
    const slug = title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '';
    
    // Tạo bài viết mới với các trường bắt buộc
    const article = await Article.create({
      title: title || 'Tiêu đề mặc định',
      slug: slug || 'bai-viet-moi',
      content: content || '',
      excerpt: excerpt || '',
      featuredImage: featuredImage || '',
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      isPublished: isPublished !== undefined ? isPublished : true,
      isFeatured: false,
      isBreaking: false,
      authorId: authorId,
      userId: authorId // Tạm thời sử dụng authorId cho userId
    });
    
    // Thêm các danh mục cho bài viết (nếu có)
    if (categories && categories.length > 0) {
      const articleCategories = categories.map((categoryId: number) => ({
        articleId: article.id,
        categoryId
      }));
      
      await ArticleCategory.bulkCreate(articleCategories);
    }
    
    // Lấy lại thông tin đầy đủ của bài viết
    const createdArticle = await Article.findByPk(article.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Category,
          as: 'categories',
          through: { attributes: [] },
          attributes: ['id', 'name', 'slug']
        }
      ]
    });
    
    res.status(201).json({
      success: true,
      data: createdArticle
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Update article
// @route   PUT /api/articles/:id
// @access  Private/Admin/Author
export const updateArticle = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, featuredImage, categories, isPublished } = req.body;
    
    // Tìm bài viết
    let article = await Article.findByPk(id);
    
    if (!article) {
      return next(new CustomError(`Article not found with id of ${id}`, 404));
    }
    
    // Kiểm tra quyền sở hữu hoặc quyền admin
    if (req.user && (req.user.role !== 'admin' && article.authorId !== req.user.id)) {
      return next(new CustomError('Not authorized to update this article', 401));
    }
    
    // Cập nhật thông tin bài viết
    const articleData: any = {};
    if (title) articleData.title = title;
    if (content) articleData.content = content;
    if (excerpt) articleData.excerpt = excerpt;
    if (featuredImage) articleData.featuredImage = featuredImage;
    if (typeof isPublished === 'boolean') articleData.isPublished = isPublished;
    
    await article.update(articleData);
    
    // Cập nhật danh mục nếu có
    if (categories && categories.length > 0) {
      // Xóa các danh mục cũ
      await ArticleCategory.destroy({
        where: { articleId: id }
      });
      
      // Thêm các danh mục mới
      const articleCategories = categories.map((categoryId: number) => ({
        articleId: id,
        categoryId
      }));
      
      await ArticleCategory.bulkCreate(articleCategories);
    }
    
    // Lấy lại thông tin đầy đủ của bài viết
    const updatedArticle = await Article.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Category,
          as: 'categories',
          through: { attributes: [] },
          attributes: ['id', 'name', 'slug']
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      data: updatedArticle
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Delete article
// @route   DELETE /api/articles/:id
// @access  Private/Admin/Author
export const deleteArticle = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Tìm bài viết
    const article = await Article.findByPk(id);
    
    if (!article) {
      return next(new CustomError(`Article not found with id of ${id}`, 404));
    }
    
    // Kiểm tra quyền sở hữu hoặc quyền admin
    if (req.user && (req.user.role !== 'admin' && article.authorId !== req.user.id)) {
      return next(new CustomError('Not authorized to delete this article', 401));
    }
    
    // Xóa các liên kết với danh mục
    await ArticleCategory.destroy({
      where: { articleId: id }
    });
    
    // Xóa bài viết
    await article.destroy();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Get articles by category
// @route   GET /api/articles/category/:categoryId
// @access  Public
export const getArticlesByCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryId } = req.params;
    const query = req.query as IRequestQuery;
    
    const page = query.page ? parseInt(query.page) : 1;
    const limit = query.limit ? parseInt(query.limit) : 20;
    const offset = (page - 1) * limit;
    
    // Lấy danh sách bài viết thuộc category
    const { count, rows: articles } = await Article.findAndCountAll({
      include: [
        {
          model: Category,
          as: 'categories',
          where: { id: categoryId },
          through: { attributes: [] },
          attributes: []
        },
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        }
      ],
      where: { isPublished: true },
      limit,
      offset,
      distinct: true
    });
    
    const totalPages = Math.ceil(count / limit);
    
    const response: IPaginationResult = {
      success: true,
      count: articles.length,
      pagination: {
        total: count,
        page,
        limit,
        totalPages
      },
      data: articles
    };
    
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

// @desc    Get articles by author
// @route   GET /api/articles/author/:authorId
// @access  Public
export const getArticlesByAuthor = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { authorId } = req.params;
    const query = req.query as IRequestQuery;
    
    const page = query.page ? parseInt(query.page) : 1;
    const limit = query.limit ? parseInt(query.limit) : 20;
    const offset = (page - 1) * limit;
    
    // Lấy danh sách bài viết của tác giả
    const { count, rows: articles } = await Article.findAndCountAll({
      where: { 
        authorId,
        isPublished: true 
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Category,
          as: 'categories',
          through: { attributes: [] },
          attributes: ['id', 'name', 'slug']
        }
      ],
      limit,
      offset,
      distinct: true
    });
    
    const totalPages = Math.ceil(count / limit);
    
    const response: IPaginationResult = {
      success: true,
      count: articles.length,
      pagination: {
        total: count,
        page,
        limit,
        totalPages
      },
      data: articles
    };
    
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

// @desc    Search articles
// @route   GET /api/articles/search
// @access  Public
export const searchArticles = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return next(new CustomError('Please provide a search query', 400));
    }
    
    const articles = await Article.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${q}%` } },
          { content: { [Op.like]: `%${q}%` } },
          { excerpt: { [Op.like]: `%${q}%` } }
        ],
        isPublished: true
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Category,
          as: 'categories',
          through: { attributes: [] },
          attributes: ['id', 'name', 'slug']
        }
      ],
      limit: 10
    });
    
    res.status(200).json({
      success: true,
      count: articles.length,
      data: articles
    });
  } catch (err) {
    next(err);
  }
});
