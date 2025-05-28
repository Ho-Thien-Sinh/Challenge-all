import App from './app';
import logger from './utils/logger';
import { testConnection, syncDatabase, initializeModels } from './config/database';
import { NODE_ENV, PORT } from './config';

// Initialize the application
const app = new App();

// Sync database and start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Initialize models with associations
    await initializeModels();

    // Sync models with database
    await syncDatabase();

    // Start the server
    app.listen();
  } catch (error) {
    logger.error('Unable to start the server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception thrown:', error);
  process.exit(1);
});

// Start the server
startServer();
