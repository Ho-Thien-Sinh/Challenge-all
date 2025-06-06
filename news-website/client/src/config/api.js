const API_BASE_URL = '/api';  // Using proxy configuration

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh-token`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,

  // News endpoints
  NEWS: `${API_BASE_URL}/articles`,  // Changed to match backend endpoint
  NEWS_LOGO: `${API_BASE_URL}/articles/logo`,

  // Article endpoints
  ARTICLES: `${API_BASE_URL}/articles`,
  ARTICLE_BY_ID: (id) => `${API_BASE_URL}/articles/${id}`,
  ARTICLE_CATEGORIES: `${API_BASE_URL}/articles/categories`,
  ARTICLE_SEARCH: `${API_BASE_URL}/articles/search`,

  // User endpoints
  USER_PROFILE: `${API_BASE_URL}/users/profile`,
  USER_ARTICLES: `${API_BASE_URL}/users/articles`,
};

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for handling cookies (JWT)
}; 