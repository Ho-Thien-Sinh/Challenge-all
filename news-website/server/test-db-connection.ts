import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, './.env') });

async function testConnection() {
  console.log('🔄 Đang kết nối đến cơ sở dữ liệu...');
  
  const sequelize = new Sequelize(
    process.env.DB_NAME || 'news_website_dev',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'postgres',
    {
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      dialect: 'postgres',
      logging: console.log,
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
    }
  );

  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối cơ sở dữ liệu thành công');
    
    // Kiểm tra truy vấn đơn giản
    const [results] = await sequelize.query('SELECT 1');
    console.log('✅ Kiểm tra truy vấn thành công:', results);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi kết nối cơ sở dữ liệu:', error);
    process.exit(1);
  } finally {
    if (sequelize) {
      await sequelize.close();
    }
  }
}

testConnection();
