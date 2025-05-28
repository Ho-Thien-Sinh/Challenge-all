import { BaseAttributes, BaseModelInstance, BaseModel, BaseQueryOptions } from './base.types';

// Enum cho trạng thái bài viết
export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

// Interface cho attributes của Article
export interface ArticleAttributes extends BaseAttributes {
  title: string;
  summary?: string;
  content: string;
  imageUrl?: string;
  images?: string[];
  sourceUrl: string;
  publishedAt: Date;
  category?: string;
  authorName?: string;
  authorId?: number;
  status: ArticleStatus;
  views: number;
  isFeatured: boolean;
}

// Interface cho instance của Article
export interface IArticle extends BaseModelInstance<ArticleAttributes> {
  // Các phương thức instance cụ thể của Article
  incrementViews(): Promise<void>;
  getAuthor(): Promise<any>;
}

// Type cho model Article
export type ArticleModel = BaseModel<ArticleAttributes, IArticle>;

// Interface cho options query của Article
export interface ArticleQueryOptions extends BaseQueryOptions {
  where?: {
    status?: ArticleStatus;
    category?: string;
    authorId?: number;
    isFeatured?: boolean;
    [key: string]: any;
  };
  include?: any[];
  order?: any[];
  limit?: number;
  offset?: number;
}
