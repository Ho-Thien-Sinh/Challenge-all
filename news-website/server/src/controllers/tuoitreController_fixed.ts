// @ts-nocheck
const axios = require('axios');
const cheerio = require('cheerio');

// Add a custom user agent to avoid being blocked
const axiosInstance = axios.create({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Connection': 'keep-alive',
  },
  timeout: 10000 // 10 second timeout
});

const fetchTuoitreNews = async (req, res) => {
  try {
    // Gửi yêu cầu đến trang chủ Tuổi Trẻ
    console.log('Đang lấy dữ liệu từ Tuổi Trẻ...');
    const response = await axiosInstance.get('https://tuoitre.vn', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    console.log('Đã nhận dữ liệu từ Tuổi Trẻ, đang phân tích...');
    const $ = cheerio.load(response.data);
    const articles = [];
    let noImageCount = 0;
    let noDescriptionCount = 0;
    let noImageNoDescriptionCount = 0;

    // Thử lấy các bài viết từ nhiều vị trí khác nhau
    const selectors = [
      // Các selector mới nhất từ Tuổi Trẻ
      '.box-category-cover .box-category-focus',
      '.box-category-content .box-category-middle-content',
      '.box-category-content .box-category-big-story',
      '.box-category-content .box-category-small-story',
      // Các selector cũ (để dự phòng)
      'article', 
      '[class*="news-item"]', 
      '[class*="item-news"]'
    ];

    console.log('Bắt đầu tìm kiếm bài viết với các selector...');
    
    // Thử từng selector cho đến khi tìm thấy bài viết
    for (const selector of selectors) {
      console.log(`Thử selector: ${selector}`);
      $(selector).each((i, el) => {
        const $el = $(el);
        const titleElement = $el.find('h3 a, h2 a, [class*="title"] a, [class*="title-news"] a').first();
        const title = titleElement.text().trim();
        const url = titleElement.attr('href');
        
        // Tìm mô tả từ nhiều vị trí có thể
        let description = $el.find('[class*="sapo"], [class*="description"], [class*="desc"]').first().text().trim();
        if (!description) {
          description = $el.find('p').first().text().trim();
        }
        
        // Tìm ảnh từ nhiều vị trí và thuộc tính
        const imageElement = $el.find('img').first();
        let imageUrl = imageElement.attr('data-src') || 
                     imageElement.attr('src') || 
                     imageElement.attr('data-original') ||
                     imageElement.attr('data-lazy-src');
                     
        // Lấy thời gian từ nhiều vị trí
        let time = $el.find('time, [class*="time"], [class*="date"]').first().text().trim() || 
                  $el.find('span[class*="time"], span[class*="date"]').first().text().trim() ||
                  new Date().toLocaleString();

        // Kiểm tra và xử lý URL ảnh
        if (imageUrl) {
          imageUrl = imageUrl.startsWith('http') ? imageUrl : `https:${imageUrl}`;
        } else {
          noImageCount++;
        }

        // Kiểm tra mô tả
        if (!description) {
          noDescriptionCount++;
        }

        // Kiểm tra cả hai trường hợp
        if (!imageUrl && !description) {
          noImageNoDescriptionCount++;
        }

        if (title && url) {
          articles.push({
            title,
            url: url.startsWith('http') ? url : `https://tuoitre.vn${url}`,
            description: description || 'Không có mô tả',
            imageUrl: imageUrl || '/placeholder-image.jpg',
            publishedAt: time || new Date().toISOString()
          });
        }
      });
    }

    const limitedArticles = articles.slice(0, 20);
    
    // Thêm thông tin thống kê vào phản hồi
    const stats = {
      totalArticles: limitedArticles.length,
      articlesWithoutImage: noImageCount,
      articlesWithoutDescription: noDescriptionCount,
      articlesWithoutBoth: noImageNoDescriptionCount
    };

    // Log dữ liệu để debug
    console.log('Tổng số bài viết tìm thấy:', limitedArticles.length);
    console.log('Mẫu dữ liệu bài viết đầu tiên:', limitedArticles[0]);
    console.log('Thống kê:', stats);

    res.json({
      articles: limitedArticles,
      stats
    });
  } catch (error) {
    console.error('Lỗi khi lấy tin tức từ Tuổi Trẻ:', error);
    console.error('Error details:', error.message);
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received. Request:', error.request);
    }
    res.status(500).json({ 
      error: 'Lỗi khi lấy tin tức từ Tuổi Trẻ',
      message: error.message 
    });
  }
};

module.exports = {
  fetchTuoitreNews
};

