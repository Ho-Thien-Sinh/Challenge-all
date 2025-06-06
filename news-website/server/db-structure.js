const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
  }
);

async function checkDatabaseStructure() {
  try {
    await sequelize.authenticate();
    console.log('Đã kết nối thành công đến cơ sở dữ liệu');

    // Kiểm tra các bảng
    const [tables] = await sequelize.query(
      `SELECT table_name 
       FROM information_schema.tables 
       WHERE table_schema = 'public' 
       ORDER BY table_name`
    );

    console.log('\n=== CÁC BẢNG TRONG CƠ SỞ DỮ LIỆU ===');
    
    for (const { table_name } of tables) {
      console.log(`\nBảng: ${table_name}`);
      
      // Lấy thông tin cột
      const [columns] = await sequelize.query(
        `SELECT column_name, data_type, is_nullable 
         FROM information_schema.columns 
         WHERE table_name = '${table_name}' 
         ORDER BY ordinal_position`
      );
      
      console.log('Các cột:');
      console.table(columns);
      
      // Đếm số bản ghi
      try {
        const [count] = await sequelize.query(`SELECT COUNT(*) FROM \"${table_name}\"`);
        console.log(`Số bản ghi: ${count[0].count}`);
      } catch (e) {
        console.log('Không thể đếm số bản ghi:', e.message);
      }
    }
  } catch (error) {
    console.error('Lỗi khi kiểm tra cấu trúc cơ sở dữ liệu:', error);
  } finally {
    await sequelize.close();
  }
}

checkDatabaseStructure();
