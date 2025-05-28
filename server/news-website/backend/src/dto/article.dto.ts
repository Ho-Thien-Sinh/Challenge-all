import { IsString, IsOptional, IsArray, IsUrl, IsDateString, IsEnum, IsBoolean, IsInt, Min, IsNumber } from 'class-validator';
import { ArticleStatus } from '../models';

export class CreateArticleDto {
  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsString()
  content!: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsArray()
  @IsOptional()
  images: string[] = [];

  @IsUrl()
  sourceUrl!: string;

  @IsDateString()
  @IsOptional()
  publishedAt: Date = new Date();

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  authorName?: string;

  @IsNumber()
  @IsOptional()
  authorId?: number;

  @IsEnum(ArticleStatus)
  @IsOptional()
  status: ArticleStatus = ArticleStatus.DRAFT;

  @IsBoolean()
  @IsOptional()
  isFeatured: boolean = false;
}

export class UpdateArticleDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsArray()
  @IsUrl({}, { each: true })
  @IsOptional()
  images?: string[];

  @IsUrl()
  @IsOptional()
  sourceUrl?: string;

  @IsDateString()
  @IsOptional()
  publishedAt?: Date;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  authorName?: string;

  @IsNumber()
  @IsOptional()
  authorId?: number;

  @IsEnum(ArticleStatus)
  @IsOptional()
  status?: ArticleStatus;

  @IsInt()
  @Min(0)
  @IsOptional()
  views?: number;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}

export class ArticleQueryDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  status?: ArticleStatus;

  @IsString()
  @IsOptional()
  authorId?: string;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsString()
  @IsOptional()
  sortBy?: string = 'publishedAt';

  @IsString()
  @IsOptional()
  order?: 'ASC' | 'DESC' = 'DESC';

  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;
}

export class ArticleResponseDto {
  id: number;
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
  createdAt: Date;
  updatedAt: Date;
  author?: any;

  constructor(article: any) {
    this.id = article.id;
    this.title = article.title;
    this.summary = article.summary;
    this.content = article.content;
    this.imageUrl = article.imageUrl;
    this.images = article.images || [];
    this.sourceUrl = article.sourceUrl;
    this.publishedAt = article.publishedAt;
    this.category = article.category;
    this.authorName = article.authorName;
    this.authorId = article.authorId;
    this.status = article.status;
    this.views = article.views || 0;
    this.isFeatured = article.isFeatured || false;
    this.createdAt = article.createdAt;
    this.updatedAt = article.updatedAt;
    
    if (article.author) {
      this.author = {
        id: article.author.id,
        name: article.author.name,
        email: article.author.email
      };
    }
  }
}
