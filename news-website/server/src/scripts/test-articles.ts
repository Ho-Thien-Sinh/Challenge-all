import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import chalk from 'chalk';
import { sequelize } from '../config/database';

// Cấu hình axios
const API_BASE_URL = process.env['API_BASE_URL'] || 'http://localhost:3001/api/v1';
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Hàm hiển thị kết quả
const logSuccess = (message: string) => console.log(chalk.green(`✅ ${message}`));
const logInfo = (message: string) => console.log(chalk.blue(`ℹ️ ${message}`));
const logError = (message: string) => console.error(chalk.red(`❌ ${message}`));
// const logWarning = (message: string) => console.log(chalk.yellow(`⚠️ ${message}`));

// Test case 1: Kết nối database
async function testDatabaseConnection() {
  try {
    logInfo('Đang kết nối đến cơ sở dữ liệu...');
    await sequelize.authenticate();
    logSuccess('Kết nối database thành công!');
    return true;
  } catch (error: any) {
    logError(`Lỗi kết nối database: ${error?.message || 'Lỗi không xác định'}`);
    return false;
  }
}

// Test case 2: Lấy danh sách bài viết
async function testGetArticles() {
  try {
    logInfo('Đang lấy danh sách bài viết...');
    const response = await api.get('/articles', {
      params: {
        page: 1,
        limit: 5,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }
    });

    const { data } = response;
    logSuccess(`Lấy thành công ${data.data.length} bài viết`);
    
    // Hiển thị thông tin các bài viết
    data.data.forEach((article: any, index: number) => {
      console.log(chalk.cyan(`\n${index + 1}. ${article.title}`));
      console.log(`   📅 ${new Date(article.createdAt).toLocaleString()}`);
      console.log(`   🔗 /article/${article.slug}`);
      console.log(`   👁️  ${article.viewCount} lượt xem`);
      if (article.categories?.length) {
        console.log(`   🏷️  ${article.categories.map((c: any) => c.name).join(', ')}`);
      }
    });

    return data.data;
  } catch (error) {
    handleApiError(error, 'Lỗi khi lấy danh sách bài viết');
    return [];
  }
}

// Test case 3: Tạo bài viết mới
async function testCreateArticle() {
  try {
    logInfo('Đang tạo bài viết mới...');
    
    const newArticle = {
      title: 'Bài viết kiểm thử ' + Date.now(),
      content: 'Đây là nội dung bài viết kiểm thử',
      summary: 'Tóm tắt bài viết kiểm thử',
      imageUrl: 'https://via.placeholder.com/800x400',
      category: 'test',
      status: 'draft',
      tags: ['test', 'demo']
    };

    const response = await api.post('/articles', newArticle);
    logSuccess(`Tạo bài viết thành công: ${response.data.data.title}`);
    console.log(`   ID: ${response.data.data.id}`);
    console.log(`   Slug: ${response.data.data.slug}`);
    
    return response.data.data;
  } catch (error) {
    handleApiError(error, 'Lỗi khi tạo bài viết');
    return null;
  }
}

// Test case 4: Cập nhật bài viết
async function testUpdateArticle(articleId: string) {
  try {
    logInfo(`Đang cập nhật bài viết ${articleId}...`);
    
    const updates = {
      title: `[ĐÃ CẬP NHẬT] Bài viết kiểm thử ${Date.now()}`,
      status: 'published',
      content: 'Nội dung đã được cập nhật vào ' + new Date().toLocaleString()
    };

    const response = await api.put(`/articles/${articleId}`, updates);
    logSuccess(`Cập nhật bài viết thành công`);
    console.log(`   Tiêu đề mới: ${response.data.data.title}`);
    console.log(`   Trạng thái: ${response.data.data.status}`);
    
    return response.data.data;
  } catch (error) {
    handleApiError(error, 'Lỗi khi cập nhật bài viết');
    return null;
  }
}

// Test case 5: Xóa bài viết
async function testDeleteArticle(articleId: string) {
  try {
    logInfo(`Đang xóa bài viết ${articleId}...`);
    await api.delete(`/articles/${articleId}`);
    logSuccess(`Đã xóa bài viết ${articleId}`);
    return true;
  } catch (error) {
    handleApiError(error, 'Lỗi khi xóa bài viết');
    return false;
  }
}

// Hàm xử lý lỗi API
function handleApiError(error: any, context: string) {
  if (error.response) {
    // Lỗi từ phản hồi của server
    const { status, data } = error.response;
    logError(`${context}: ${status} - ${data.message || 'Lỗi không xác định'}`);
    console.error('Chi tiết lỗi:', data);
  } else if (error.request) {
    // Không nhận được phản hồi từ server
    logError(`${context}: Không thể kết nối đến máy chủ`);
    console.error('Lỗi:', error.message);
  } else {
    // Lỗi khi thiết lập request
    logError(`${context}: ${error.message}`);
  }
}

// Hàm chạy tất cả các test case
async function runAllTests() {
  console.log(chalk.bold('\n=== BẮT ĐẦU KIỂM THỬ API ARTICLES ===\n'));
  
  // Test kết nối database
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    logError('Không thể tiếp tục kiểm thử do lỗi kết nối database');
    process.exit(1);
  }

  try {
    // Test 1: Lấy danh sách bài viết
    const articles = await testGetArticles();
    
    if (articles.length > 0) {
      // Test 2: Cập nhật bài viết đầu tiên
      const updatedArticle = await testUpdateArticle(articles[0].id);
      
      if (updatedArticle) {
        // Đợi 1 giây để xem kết quả
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Test 3: Tạo bài viết mới
    const newArticle = await testCreateArticle();
    
    if (newArticle) {
      // Test 4: Xóa bài viết vừa tạo
      await new Promise(resolve => setTimeout(resolve, 1000));
      await testDeleteArticle(newArticle.id);
    }
    
    logSuccess('\n✅ Đã hoàn thành tất cả các bài kiểm thử!');
  } catch (error) {
    logError(`Lỗi không mong muốn: ${(error as Error)?.message || 'Lỗi không xác định'}`);
  } finally {
    // Đóng kết nối database
    await sequelize.close();
    process.exit(0);
  }
}

// Chạy tất cả các test case
runAllTests();
