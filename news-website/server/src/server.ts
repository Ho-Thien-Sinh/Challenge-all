import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
// @ts-ignore
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import morgan from 'morgan';

// Import database connection and models
import { connectDB } from './models';

// Import middleware and utilities
import errorHandler from './middleware/error';
import logger from '@/utils/logger';
import ApiError from '@/utils/ApiError';
import { scheduler } from '@/services/scheduler';

// Import API routes
import articleRoutes from './routes/articleRoutes';
import testRoutes from './routes/testRoutes';
import scraperRoutes from './routes/scraperRoutes';

// Initialize Express app
const app = express();

// Enable CORS with specific options
const corsOptions: cors.CorsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3001',
      // Add other domains if needed
    ];
    
    // Allow all origins in development
    if (process.env.NODE_ENV === 'development' && !origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin!) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'x-auth-token'
  ],
  exposedHeaders: ['x-auth-token']
};

// Set security HTTP headers
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Enable CORS
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev', { 
    stream: { write: (message: string) => logger.http(message.trim()) } 
  }));
}

// Body parser, reading data from body into req.body
app.use(express.json({ limit: process.env.MAX_FILE_UPLOAD || '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Cookie parser
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'sort',
      'page',
      'limit',
      'fields',
      'search',
      'category',
      'author',
      'status',
      'createdAt',
      'updatedAt'
    ]
  })
);

// Compress all responses
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all API routes
app.use('/api', limiter);

// Mount routers
app.use('/api/v1/articles', articleRoutes);
app.use('/api/v1/test', testRoutes);
app.use('/api/v1/scrape', scraperRoutes);

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env['npm_package_version'] || '1.0.0'
  });
});

// Handle 404 for API routes only
app.all('/api/*', (req: Request, _res: Response, next: NextFunction) => {
  next(new ApiError(404, `Can't find ${req.originalUrl} on this server!`));
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../../client/build')));

// Handle React routing, return all requests to React app
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
});

// Global error handling middleware
app.use(errorHandler);

// Connect to database and start server
const startServer = async (): Promise<void> => {
  try {
    // Kết nối database và khởi tạo models
    console.log('🔄 Đang kết nối đến cơ sở dữ liệu...');
    const { sequelize, models } = await connectDB();
    console.log('✅ Kết nối database ổn định');
    
    // Đồng bộ hóa models trong môi trường development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Đang đồng bộ hóa database...');
      await sequelize.sync({ alter: true });
      console.log('✅ Đã đồng bộ hóa database thành công');
    }

    // Khởi tạo các model trong app để sử dụng trong các route
    app.set('models', models);
    
    // Khởi động server
    const PORT = process.env.PORT || 5000;
    console.log(`🔄 Đang khởi động server trên cổng ${PORT}...`);
    
    const server = app.listen(PORT, () => {
      console.log(`✅ Server đang chạy: http://localhost:${PORT}`);
      
      // Khởi động scheduler để cập nhật tin tức tự động
      if (process.env.NODE_ENV !== 'test') {
        console.log('🔄 Đang khởi động scheduler cập nhật tin tức...');
        scheduler.start();
        console.log('✅ Đã khởi động scheduler cập nhật tin tức tự động');
      }
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err: Error) => {
      logger.error(`UNHANDLED REJECTION! ${err.name}: ${err.message}`);
      logger.error(`UNHANDLED REJECTION! 💥 ${err.name}: ${err.message}`);
      // Close server & exit process
      server.close(() => {
        process.exit(1);
      });
    });
  } catch (err: any) {
    logger.error(`❌ Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

// Start the application
startServer();