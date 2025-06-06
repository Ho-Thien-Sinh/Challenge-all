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

async function checkAllTables() {
  try {
    await sequelize.authenticate();
    console.log('Kết nối database thành công!');

    // Kiểm tra tất cả các bảng
    const [tables] = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('\nDanh sách tất cả các bảng:');
    
    for (const { table_name } of tables) {
      console.log(`\nBảng: ${table_name}`);
      try {
        const [rows] = await sequelize.query(`SELECT * FROM \"${table_name}\" LIMIT 2`);
        console.log(`Số bản ghi: ${rows.length}`);
        console.log(rows);
      } catch (e) {
        console.log(`Không thể đọc dữ liệu: ${e.message}`);
      }
    }
  } catch (error) {
    console.error('Lỗi:', error);
  } finally {
    await sequelize.close();
  }
}

checkAllTables();
