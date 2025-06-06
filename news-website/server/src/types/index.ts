import { Request } from 'express';

// Extend Express Request interface
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string;
    role: 'user' | 'publisher' | 'admin';
    status: 'active' | 'inactive' | 'suspended';
  };
}

// User types
export interface IUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'publisher' | 'admin';
  isVerified: boolean;
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string;
  bio?: string;
  lastLogin?: Date;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  verifyEmailToken?: string;
  verifyEmailExpire?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  preferences: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// Article types
export interface IArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isPublished: boolean;
  isFeatured: boolean;
  isBreaking: boolean;
  publishedAt?: Date;
  source?: string;
  sourceUrl?: string;
  readingTime?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  searchVector?: any;
  authorId: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// Category types
export interface ICategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: number;
  isActive: boolean;
  sortOrder: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Query parameters
export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  category?: string;
  author?: string;
  status?: string;
  fields?: string;
}

// JWT Payload
export interface JWTPayload {
  id: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Email options
export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  template?: string;
  context?: Record<string, any>;
}

// Database config
export interface DatabaseConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  port: number;
  dialect: 'postgres';
  logging: boolean | ((sql: string) => void);
  pool: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
  define: {
    underscored: boolean;
    timestamps: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
    paranoid: boolean;
    underscoredAll: boolean;
  };
  dialectOptions?: {
    ssl?: {
      require: boolean;
      rejectUnauthorized: boolean;
    };
  };
}

// Environment variables
export interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  FRONTEND_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRE: string;
  JWT_COOKIE_EXPIRE: number;
  DB_HOST: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_PORT: number;
  EMAIL_HOST: string;
  EMAIL_PORT: number;
  EMAIL_USERNAME: string;
  EMAIL_PASSWORD: string;
  EMAIL_FROM: string;
  EMAIL_FROM_NAME: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX: number;
  LOG_LEVEL: string;
  SESSION_SECRET: string;
  PASSWORD_RESET_EXPIRE: number;
  EMAIL_VERIFICATION_EXPIRE: number;
}