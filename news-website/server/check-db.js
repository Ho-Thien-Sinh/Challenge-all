const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: console.log,
  }
);

async function checkDatabase() {
  try {
    // Kiểm tra kết nối
    await sequelize.authenticate();
    console.log('Kết nối database thành công!');

    // Kiểm tra các bảng
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('\nDanh sách các bảng trong database:');
    console.table(results);

    // Kiểm tra dữ liệu trong các bảng
    for (const { table_name } of results) {
      try {
        const [data] = await sequelize.query(`SELECT * FROM "${table_name}" LIMIT 5;`);
        console.log(`\nDữ liệu trong bảng ${table_name}:`);
        console.table(data);
      } catch (err) {
        console.error(`Lỗi khi đọc dữ liệu từ bảng ${table_name}:`, err.message);
      }
    }
  } catch (error) {
    console.error('Lỗi kết nối database:', error);
  } finally {
    await sequelize.close();
  }
}

checkDatabase();
