import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Khởi tạo kết nối Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME || 'news_website_dev',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      underscored: true,
      timestamps: true,
      freezeTableName: true,
      paranoid: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    },
    dialectOptions: process.env.NODE_ENV === 'production' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {}
  }
);

// Hàm kết nối và xác thực database
const connectDB = async () => {
  try {
    console.log('🔄 Đang kết nối đến cơ sở dữ liệu...');
    await sequelize.authenticate();
    console.log('✅ Kết nối cơ sở dữ liệu thành công');
    return sequelize;
  } catch (error) {
    console.error('❌ Lỗi kết nối cơ sở dữ liệu:', error);
    throw error;
  }
};

// Lấy instance của sequelize
const getSequelizeInstance = () => {
  return sequelize;
};

// Export các hàm và biến cần thiết
export {
  connectDB,
  getSequelizeInstance,
  sequelize,
  Sequelize,
  DataTypes
};
