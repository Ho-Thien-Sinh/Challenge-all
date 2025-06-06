import schedule from 'node-schedule';
import tuoiTreScraper from './scraper/tuoitreScraper';
import logger from '@/utils/logger';

class Scheduler {
  private scraper: typeof tuoiTreScraper;
  private job: schedule.Job | null = null;

  constructor() {
    this.scraper = tuoiTreScraper;
  }

  // Hàm khởi tạo lịch cập nhật tin tức
  public start(): void {
    // Chạy ngay lần đầu khi khởi động
    this.runScraping().catch(error => {
      logger.error('Lỗi khi chạy scraping lần đầu:', error);
    });

    // Lập lịch chạy mỗi 30 phút
    this.job = schedule.scheduleJob('*/30 * * * *', async () => {
      logger.info('Bắt đầu cập nhật tin tức tự động...');
      await this.runScraping();
    });

    logger.info('Đã khởi tạo lịch cập nhật tin tức tự động (30 phút/lần)');
  }

  // Dừng lịch cập nhật
  public stop(): void {
    if (this.job) {
      this.job.cancel();
      logger.info('Đã dừng lịch cập nhật tin tức tự động');
    }
  }

  // Thực hiện quá trình scraping
  private async runScraping(): Promise<void> {
    try {
      // Lấy các danh mục chính từ Tuổi Trẻ
      const categories = ['thoi-su', 'the-gioi', 'kinh-doanh', 'giai-tri', 'the-thao', 'phap-luat'];
      
      for (const category of categories) {
        try {
          logger.info(`Đang cập nhật tin tức từ chuyên mục: ${category}`);
          await this.scraper.scrapeAndSaveArticles(category, 5); // Lấy 5 bài mới nhất mỗi danh mục
          logger.info(`Đã cập nhật xong chuyên mục: ${category}`);
          
          // Đợi 5 giây giữa các danh mục để tránh bị block
          await new Promise(resolve => setTimeout(resolve, 5000));
        } catch (error) {
          logger.error(`Lỗi khi cập nhật chuyên mục ${category}:`, error);
        }
      }
      
      logger.info('Hoàn tất cập nhật tin tức tự động');
    } catch (error) {
      logger.error('Lỗi trong quá trình cập nhật tin tức tự động:', error);
    }
  }
}

// Tạo và xuất instance của Scheduler
export const scheduler = new Scheduler();
