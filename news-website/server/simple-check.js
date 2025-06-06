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

async function checkTables() {
  try {
    await sequelize.authenticate();
    console.log('Kết nối database thành công!');

    // Kiểm tra các bảng
    const [tables] = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('\nCác bảng trong database:');
    console.log(tables.map(t => t.table_name).join('\n'));

    // Kiểm tra dữ liệu trong bảng Users
    try {
      const [users] = await sequelize.query('SELECT * FROM "Users"');
      console.log('\nDữ liệu trong bảng Users:');
      console.log(users);
    } catch (e) {
      console.log('Không thể đọc dữ liệu từ bảng Users:', e.message);
    }

  } catch (error) {
    console.error('Lỗi:', error);
  } finally {
    await sequelize.close();
  }
}

checkTables();
