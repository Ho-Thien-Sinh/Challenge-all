// Type definitions for the application

export interface Article {
  id?: string;
  title: string;
  url: string;
  description: string;
  publishedAt: string;
  imageUrl: string;
  category?: string;
  source?: string;
}

export interface NewsResponse {
  articles: Article[];
  stats: {
    totalArticles: number;
    articlesWithoutImage: number;
    articlesWithoutDescription: number;
    articlesWithoutBoth: number;
  };
}
