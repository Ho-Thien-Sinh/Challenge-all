import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

export interface NewsItem {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  image_url: string;
  category: string;
  url: string;
  published_at: string;
  source: string;
  author: string;
  created_at: string;
  updated_at: string;
}

export const getNews = async (limit: number = 10, category?: string): Promise<NewsItem[]> => {
  try {
    const response = await axios.get(API_ENDPOINTS.ARTICLES, {
      params: { limit, category }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
};

export const getLogoUrl = (): string => {
  return API_ENDPOINTS.NEWS_LOGO;
};
