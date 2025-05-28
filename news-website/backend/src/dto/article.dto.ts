import { IsString, IsOptional, IsArray, IsUrl, IsDateString, IsEnum, IsBoolean, IsInt, Min, IsNumber } from 'class-validator';
import { ArticleStatus } from '../models';
import { BaseQueryParams, BaseResponseDto, PaginatedResponse, BaseCreateUpdateDto } from './base.dto';

export class ArticleQueryDto extends BaseQueryParams {
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
}

export class CreateArticleDto extends BaseCreateUpdateDto {
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

export class UpdateArticleDto extends BaseCreateUpdateDto {
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

export class ArticleResponseDto extends BaseResponseDto {
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
  author?: any;

  constructor(article: any) {
    super(article);
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
    
    if (article.author) {
      this.author = {
        id: article.author.id,
        name: article.author.name,
        email: article.author.email
      };
    }
  }
}

export class PaginatedArticleResponseDto extends PaginatedResponse<ArticleResponseDto> {
  constructor(
    articles: ArticleResponseDto[],
    pagination: { total: number; page: number; limit: number }
  ) {
    super(articles, pagination);
  }
}
