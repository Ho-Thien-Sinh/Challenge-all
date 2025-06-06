const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');

class NewsService {
  constructor() {
    this.articles = [];
    this.categories = [
      'thoi-su', 'du-lich', 'the-gioi', 'kinh-doanh',
      'khoa-hoc', 'giai-tri', 'the-thao', 'phap-luat',
      'giao-duc', 'suc-khoe', 'doi-song', 'xa-hoi'
    ];
    this.isUpdating = false;
    
    // Khởi tạo dữ liệu ngay khi khởi động
    this.updateAllNews();
    
    // Lập lịch cập nhật mỗi 30 phút
    cron.schedule('*/30 * * * *', () => {
      console.log('Đang cập nhật dữ liệu tin tức theo lịch...');
      this.updateAllNews();
    });
  }

  async fetchArticlesFromCategory(category, limit = 100) {
    try {
      const url = `https://tuoitre.vn/rss/${category}.rss`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data, { xmlMode: true });
      const items = $('item').toArray();
      
      return items.map(item => {
        const $item = $(item);
        const title = $item.find('title').first().text().trim();
        const link = $item.find('link').first().text().trim();
        let description = $item.find('description').first().text().trim();
        
        // Trích xuất ảnh từ mô tả
        let imageUrl = '';
        const imgMatch = description.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (imgMatch && imgMatch[1]) {
          imageUrl = imgMatch[1];
        }
        
        // Làm sạch mô tả
        description = description.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
        
        return {
          id: Buffer.from(link).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 12),
          title,
          description: description || 'Không có mô tả',
          url: link,
          imageUrl: imageUrl || 'https://via.placeholder.com/150',
          publishedAt: $item.find('pubDate').first().text() || new Date().toISOString(),
          category,
          source: 'Tuổi Trẻ'
        };
      }).filter(article => article.title && article.url);
      
    } catch (error) {
      console.error(`Lỗi khi lấy dữ liệu từ danh mục ${category}:`, error.message);
      return [];
    }
  }

  async updateAllNews() {
    if (this.isUpdating) {
      console.log('Đang cập nhật dữ liệu, bỏ qua lần cập nhật này...');
      return;
    }
    
    this.isUpdating = true;
    console.log('Bắt đầu cập nhật dữ liệu tin tức...');
    
    try {
      const allArticles = [];
      
      // Lấy bài viết từ tất cả các danh mục
      for (const category of this.categories) {
        console.log(`Đang lấy dữ liệu từ danh mục: ${category}`);
        const articles = await this.fetchArticlesFromCategory(category);
        allArticles.push(...articles);
      }
      
      // Loại bỏ các bài viết trùng lặp dựa trên URL
      const uniqueArticles = [];
      const urlSet = new Set();
      
      for (const article of allArticles) {
        if (!urlSet.has(article.url)) {
          urlSet.add(article.url);
          uniqueArticles.push(article);
        }
      }
      
      // Sắp xếp theo thời gian đăng bài (mới nhất lên đầu)
      uniqueArticles.sort((a, b) => {
        return new Date(b.publishedAt) - new Date(a.publishedAt);
      });
      
      this.articles = uniqueArticles;
      console.log(`Cập nhật thành công ${this.articles.length} bài viết`);
      
    } catch (error) {
      console.error('Lỗi khi cập nhật dữ liệu tin tức:', error);
    } finally {
      this.isUpdating = false;
    }
  }
  
  getArticles(limit = 52) {
    return {
      articles: this.articles.slice(0, limit),
      stats: {
        totalArticles: this.articles.length,
        lastUpdated: new Date().toISOString()
      }
    };
  }
}

// Tạo instance duy nhất
const newsService = new NewsService();
module.exports = newsService;
