// Đăng ký module alias trước khi import bất kỳ module nào
require('module-alias/register');

// Cấu hình các aliases
require('module-alias').addAliases({
  '@': __dirname + '/dist',
  '@/config': __dirname + '/dist/config',
  '@/controllers': __dirname + '/dist/controllers',
  '@/middleware': __dirname + '/dist/middleware',
  '@/middlewares': __dirname + '/dist/middlewares',
  '@/models': __dirname + '/dist/models',
  '@/routes': __dirname + '/dist/routes',
  '@/services': __dirname + '/dist/services',
  '@/utils': __dirname + '/dist/utils',
  '@/types': __dirname + '/dist/types',
  '@/interfaces': __dirname + '/dist/interfaces'
});

// Khởi động ứng dụng
require('./dist/server');
