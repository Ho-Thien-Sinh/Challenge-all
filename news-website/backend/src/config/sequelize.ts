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

export { sequelize };
export default sequelize;
