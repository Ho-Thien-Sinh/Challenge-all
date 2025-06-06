require('dotenv').config();
const TuoiTreScraper = require('../services/scraper/tuoitreScraper');
const { sequelize } = require('../models');

async function main() {
  console.log('🔄 Đang kết nối đến cơ sở dữ liệu...');
  
  try {
    // Kiểm tra kết nối database
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công!');
    
    // Đồng bộ hóa model
    await sequelize.sync({ alter: true });
    console.log('🔄 Đã đồng bộ hóa các model');
    
    // Các chuyên mục cần lấy dữ liệu
    const categories = [
      'thoi_su',
      'the_gioi',
      'kinh_doanh',
      'giao_duc',
      'khoa_hoc',
      'suc_khoe',
      'the_thao',
      'giai_tri',
      'du_lich',
      'xe'
    ];
    
    // Lấy dữ liệu từng chuyên mục
    for (const category of categories) {
      console.log(`\n🚀 Bắt đầu lấy dữ liệu từ chuyên mục: ${category}`);
      await TuoiTreScraper.scrapeAndSave(category, 5);
      
      // Nghỉ giữa các chuyên mục để tránh bị chặn
      console.log(`🕒 Đang tạm dừng trước khi lấy chuyên mục tiếp theo...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    console.log('\n🎉 Hoàn thành lấy dữ liệu từ tất cả các chuyên mục!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Có lỗi xảy ra:', error);
    process.exit(1);
  }
}

// Chạy chương trình
main();
