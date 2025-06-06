import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'newsapp',
};

async function initializeDatabase() {
  console.log('🔄 Đang kiểm tra kết nối cơ sở dữ liệu...');

  // Kết nối tới PostgreSQL server (không chỉ định database cụ thể)
  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    logging: false,
  });

  try {
    // Kiểm tra kết nối
    await sequelize.authenticate();
    console.log('✅ Đã kết nối thành công đến PostgreSQL server');

    // Kiểm tra xem database đã tồn tại chưa
    const [results] = await sequelize.query(
      `SELECT 1 FROM pg_database WHERE datname = '${dbConfig.database}'`
    );

    if ((results as any[]).length === 0) {
      console.log(`🔄 Đang tạo cơ sở dữ liệu '${dbConfig.database}'...`);
      await sequelize.query(`CREATE DATABASE "${dbConfig.database}"`);
      console.log(`✅ Đã tạo cơ sở dữ liệu '${dbConfig.database}'`);
    } else {
      console.log(`ℹ️  Cơ sở dữ liệu '${dbConfig.database}' đã tồn tại`);
    }

    // Đóng kết nối
    await sequelize.close();

    // Kết nối tới database vừa tạo
    const db = new Sequelize({
      database: dbConfig.database,
      username: dbConfig.username,
      password: dbConfig.password,
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: 'postgres',
      logging: false,
    });

    // Kiểm tra kết nối tới database
    await db.authenticate();
    console.log(`✅ Đã kết nối thành công đến database '${dbConfig.database}'`);
    
    // Đóng kết nối
    await db.close();
    
    console.log('✅ Khởi tạo cơ sở dữ liệu hoàn tất');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi khởi tạo cơ sở dữ liệu:', error);
    process.exit(1);
  }
}

initializeDatabase();
