import { articleApi } from './api';
import { 
  Post, 
  PostListResponse, 
  CreatePostDto, 
  UpdatePostDto
} from '../types/post';

// Hàm chuyển đổi từ Article sang Post
const mapArticleToPost = (article: any): Post => {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    summary: article.summary || '',
    content: article.content,
    thumbnail: article.thumbnail || '',
    images: article.images || [],
    status: article.status || 'draft',
    category: article.category || '',
    tags: article.tags || [],
    author: article.author || { id: '', fullName: 'Unknown', username: 'unknown' },
    viewCount: article.viewCount || 0,
    isFeatured: article.isFeatured || false,
    publishedAt: article.publishedAt,
    createdAt: article.createdAt || new Date().toISOString(),
    updatedAt: article.updatedAt || new Date().toISOString()
  };
};

const postService = {
  /**
   * Lấy danh sách bài viết với phân trang, tìm kiếm, lọc và sắp xếp
   */
  getPosts: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'draft' | 'published' | 'archived';
    category?: string;
    authorId?: string;
    isFeatured?: boolean;
    startDate?: string;
    endDate?: string;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<PostListResponse> => {
    try {
      const response = await articleApi.getArticles({
        search: params.search,
        status: params.status,
        category: params.category,
        isFeatured: params.isFeatured,
        // Các tham số khác nếu cần
      });

      // Chuyển đổi dữ liệu từ Article sang Post
      const posts = (response.data?.articles || []).map(mapArticleToPost);
      const total = response.data?.total || 0;
      const page = params.page || 1;
      const limit = params.limit || 10;

      return {
        data: posts,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Lỗi khi lấy danh sách bài viết:', error);
      return {
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0
        }
      };
    }
  },

  /**
   * Lấy thông tin chi tiết bài viết theo ID hoặc slug
   */
  getPostById: async (idOrSlug: string): Promise<Post> => {
    try {
      const response = await articleApi.getArticleById(idOrSlug);
      return mapArticleToPost(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết bài viết:', error);
      throw error;
    }
  },

  /**
   * Tạo bài viết mới
   */
  createPost: async (postData: CreatePostDto): Promise<Post> => {
    try {
      const response = await articleApi.createArticle(postData);
      return mapArticleToPost(response.data);
    } catch (error) {
      console.error('Lỗi khi tạo bài viết:', error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin bài viết
   */
  updatePost: async (id: string, postData: UpdatePostDto): Promise<Post> => {
    try {
      const response = await articleApi.updateArticle(id, postData);
      return mapArticleToPost(response.data);
    } catch (error) {
      console.error('Lỗi khi cập nhật bài viết:', error);
      throw error;
    }
  },

  /**
   * Xóa bài viết
   */
  deletePost: async (id: string): Promise<void> => {
    try {
      await articleApi.deleteArticle(id);
    } catch (error) {
      console.error('Lỗi khi xóa bài viết:', error);
      throw error;
    }
  },

  /**
   * Cập nhật trạng thái bài viết
   */
  updatePostStatus: async (id: string, status: 'draft' | 'published' | 'archived'): Promise<Post> => {
    try {
      const response = await articleApi.updateArticle(id, { status });
      return mapArticleToPost(response.data);
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái bài viết:', error);
      throw error;
    }
  },

  /**
   * Đánh dấu bài viết nổi bật
   */
  toggleFeatured: async (id: string, isFeatured: boolean): Promise<Post> => {
    try {
      const response = await articleApi.updateArticle(id, { isFeatured });
      return mapArticleToPost(response.data);
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái nổi bật:', error);
      throw error;
    }
  },

  /**
   * Tăng số lượt xem
   */
  incrementViewCount: async (id: string): Promise<void> => {
    // API này có thể chưa được triển khai ở backend
    console.log(`Tăng lượt xem cho bài viết ${id}`);
  },

  /**
   * Lấy các bài viết liên quan
   */
  getRelatedPosts: async (postId: string, limit: number = 3): Promise<Post[]> => {
    try {
      // Giả sử có API lấy bài viết liên quan
      // const response = await articleApi.getRelatedArticles(postId, { limit });
      // return (response.data || []).map(mapArticleToPost);
      console.log(`Lấy ${limit} bài viết liên quan đến ${postId}`);
      return [];
    } catch (error) {
      console.error('Lỗi khi lấy bài viết liên quan:', error);
      return [];
    }
  },

  /**
   * Tải lên hình ảnh
   */
  uploadImage: async (file: File): Promise<{ url: string }> => {
    // API upload ảnh có thể chưa được triển khai
    console.log('Tải lên hình ảnh:', file.name);
    // Giả lập URL ảnh tạm thời
    return { url: URL.createObjectURL(file) };
  },
};

export default postService;
