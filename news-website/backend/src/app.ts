import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import { NODE_ENV, PORT, IS_PRODUCTION, RATE_LIMIT } from './config';
import logger, { stream } from './utils/logger';
import { errorHandler } from './middlewares/error.middleware';
import { notFoundHandler } from './middlewares/not-found.middleware';
import { rateLimit } from 'express-rate-limit';
import { Container } from 'typedi';
import { testConnection, syncDatabase, initializeModels } from './config/database';

// Import routes
import AuthRoutes from './routes/auth.routes';
import UserRoutes from './routes/user.routes';
import ArticleRoutes from './routes/article.routes';

// Initialize routes
const authRoutes = Container.get(AuthRoutes).router;
const userRoutes = Container.get(UserRoutes).router;
const articleRoutes = Container.get(ArticleRoutes).router;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'News Website API',
      version: '1.0.0',
      description: 'API documentation for News Website',
      contact: {
        name: 'API Support',
        url: 'https://example.com/support',
        email: 'support@example.com',
      },
      license: {
        name: 'Apache 2.0',
        url: 'https://www.apache.org/licenses/LICENSE-2.0.html',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
      {
        url: 'https://api.example.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    path.join(__dirname, './routes/*.ts'),
    path.join(__dirname, './dto/*.ts'),
  ],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

class App {
  public app: Application;
  public port: string | number;
  public env: string;

  constructor() {
    this.app = express();
    this.port = PORT || 3000;
    this.env = NODE_ENV || 'development';

    this.connectToTheDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeSwagger();
    this.initializeErrorHandling();
  }

  private async connectToTheDatabase() {
    try {
      // Test database connection
      await testConnection();
      logger.info('Database connected');
      
      // Initialize models
      await initializeModels();
      
      // Sync database (set to false in production)
      if (process.env.NODE_ENV !== 'production') {
        await syncDatabase();
      }
    } catch (error) {
      logger.error('Database connection error:', error);
      process.exit(1);
    }
  }

  private initializeMiddlewares() {
    // Security middlewares
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Logging
    if (this.env === 'development') {
      this.app.use(morgan('dev', { stream }));
    }
    
    // Rate limiting
    const limiter = rateLimit({
      windowMs: RATE_LIMIT.windowMs,
      max: RATE_LIMIT.max,
      message: RATE_LIMIT.message,
    });
    this.app.use(limiter);
  }

  private initializeRoutes() {
    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/articles', articleRoutes);
    
    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({ status: 'OK', timestamp: new Date() });
    });
  }

  private initializeSwagger() {
    // Swagger UI
    this.app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
      })
    );
    
    // Swagger JSON
    this.app.get('/api-docs.json', (req: Request, res: Response) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });
    
    logger.info(`Swagger UI available at /api-docs`);
  }
  
  private initializeErrorHandling() {
    // Handle 404
    this.app.use(notFoundHandler);
    
    // Handle errors
    this.app.use(errorHandler);
  }

  public listen() {
    const server = this.app.listen(this.port, () => {
      logger.info(`Server is running on port ${this.port}`);
      logger.info(`Environment: ${this.env}`);
      logger.info(`API Documentation: http://localhost:${this.port}/api-docs`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err: Error) => {
      logger.error('Unhandled Rejection:', err);
      // Close server & exit process
      server.close(() => process.exit(1));
    });

    return server;
  }
  
  public getServer() {
    return this.app;
  }
}

export default App;
