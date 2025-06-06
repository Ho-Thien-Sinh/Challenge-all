require('module-alias/register');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Đăng ký module alias
require('module-alias').addAliases({
  '@': __dirname,
  '@/config': path.join(__dirname, 'dist/config'),
  '@/controllers': path.join(__dirname, 'dist/controllers'),
  '@/middleware': path.join(__dirname, 'dist/middleware'),
  '@/middlewares': path.join(__dirname, 'dist/middlewares'),
  '@/models': path.join(__dirname, 'dist/models'),
  '@/routes': path.join(__dirname, 'dist/routes'),
  '@/services': path.join(__dirname, 'dist/services'),
  '@/utils': path.join(__dirname, 'dist/utils'),
  '@/types': path.join(__dirname, 'dist/types'),
  '@/interfaces': path.join(__dirname, 'dist/interfaces')
});

// Kiểm tra file .env
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ Lỗi: Không tìm thấy file .env');
  process.exit(1);
}

console.log('🔄 Đang kiểm tra và khởi tạo cơ sở dữ liệu...');
try {
  // Chạy script khởi tạo database
  execSync('npx ts-node init-db.ts', { stdio: 'inherit' });
  
  console.log('\n🔄 Đang khởi động server...');
  
  // Khởi động server
  if (process.platform === 'win32') {
    // Trên Windows
    execSync('set NODE_ENV=development && npx nodemon --exec ts-node -r tsconfig-paths/register src/server.ts', { 
      stdio: 'inherit',
      shell: true
    });
  } else {
    // Trên Unix/Linux/Mac
    execSync('NODE_ENV=development npx nodemon --exec ts-node -r tsconfig-paths/register src/server.ts', { 
      stdio: 'inherit',
      shell: true
    });
  }
} catch (error) {
  console.error('❌ Lỗi khi khởi động ứng dụng:', error);
  process.exit(1);
}
