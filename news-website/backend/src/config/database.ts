import { Sequelize } from 'sequelize';
import { DB_CONFIG } from './';
import logger from '../utils/logger';

// Create a new Sequelize instance
const sequelize = new Sequelize(
  DB_CONFIG.database,
  DB_CONFIG.username,
  DB_CONFIG.password,
  {
    host: DB_CONFIG.host,
    port: DB_CONFIG.port,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? (msg: string) => logger.debug(msg) : false,
    define: {
      timestamps: true,
      underscored: true,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

/**
 * Test the database connection
 */
const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

/**
 * Sync all models with the database
 */
const syncDatabase = async (): Promise<void> => {
  try {
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('Database synced in development mode');
    } else {
      await sequelize.sync();
      logger.info('Database synced');
    }
  } catch (error) {
    logger.error('Error syncing database:', error);
    process.exit(1);
  }
};

/**
 * Initialize all models
 */
const initializeModels = async (): Promise<void> => {
  try {
    // Import models
    const { User, Article } = await import('../models');
    
    // Initialize models with associations
    if (User.associate) {
      User.associate({ Article });
    }
    
    if (Article.associate) {
      Article.associate({ User });
    }
    
    logger.info('All models were synchronized successfully.');
  } catch (error) {
    logger.error('Error initializing models:', error);
    process.exit(1);
  }
};

// Export the Sequelize instance and functions
export { sequelize, testConnection, syncDatabase, initializeModels };
export default sequelize;
