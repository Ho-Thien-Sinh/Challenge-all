import { User } from './user';

export interface Post {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  thumbnail?: string;
  images?: string[];
  status: 'draft' | 'published' | 'archived';
  category: string;
  tags: string[];
  author: Pick<User, 'id' | 'fullName' | 'username'>;
  viewCount: number;
  isFeatured: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostListResponse {
  data: Post[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters?: {
    search?: string;
    status?: string;
    category?: string;
    authorId?: string;
    isFeatured?: boolean;
    startDate?: string;
    endDate?: string;
  };
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

export interface CreatePostDto {
  title: string;
  slug: string;
  summary: string;
  content: string;
  thumbnail?: string;
  images?: string[];
  status: 'draft' | 'published' | 'archived';
  category: string;
  tags: string[];
  isFeatured?: boolean;
  publishedAt?: string;
}

export type UpdatePostDto = Partial<CreatePostDto>;
