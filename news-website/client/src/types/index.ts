export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  category: string;
  author: string;
  publishedAt: string | Date;
  updatedAt: string | Date;
  viewCount: number;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  description: string;
  
  // Các trường bổ sung
  source?: string;
  url?: string;
  sourceUrl?: string;
  readingTime?: number;
  commentsCount?: number;
  likesCount?: number;
  sharesCount?: number;
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  
  // Đa phương tiện
  images?: string[];
  videoUrl?: string;
  
  // Phân loại
  categories?: string[];
  
  // Tùy chỉnh
  [key: string]: any;
}
