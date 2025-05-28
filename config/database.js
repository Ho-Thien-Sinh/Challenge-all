const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'your_database_name', // Thay đổi tên database của bạn
  password: 'your_password', // Thay đổi password của bạn
  port: 5432, // Port mặc định của PostgreSQL
});

// Test kết nối
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Connected to PostgreSQL database successfully!');
  release();
});

module.exports = {
  query: (text, params) => pool.query(text, params),
}; 