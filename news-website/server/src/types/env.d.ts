declare namespace NodeJS {
  interface ProcessEnv {
    // Database
    DB_USER: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    DB_HOST: string;
    DB_PORT: string;
    DB_POOL_MAX?: string;
    DB_POOL_MIN?: string;
    DB_POOL_ACQUIRE?: string;
    DB_POOL_IDLE?: string;
    
    // JWT
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    JWT_COOKIE_EXPIRES_IN: string;
    
    // App
    NODE_ENV: 'development' | 'production' | 'test';
    PORT: string;
    
    // CORS
    FRONTEND_URL: string;
    
    // File upload
    MAX_FILE_UPLOAD: string;
    FILE_UPLOAD_PATH: string;
    
    // Email
    EMAIL_HOST: string;
    EMAIL_PORT: string;
    EMAIL_USER: string;
    EMAIL_PASS: string;
    EMAIL_FROM: string;
    
    // Rate limiting
    RATE_LIMIT_WINDOW_MS?: string;
    RATE_LIMIT_MAX?: string;
  }
}
