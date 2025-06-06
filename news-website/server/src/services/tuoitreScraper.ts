import axios from 'axios';
import * as cheerio from 'cheerio';
import { Article } from '@/models';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

// Các danh mục chính của Tuổi Trẻ
const CATEGORIES = [
  'thoi-su', 'the-gioi', 'kinh-doanh', 'the-thao', 'giai-tri',
  'giao-duc', 'khoa-hoc', 'suc-khoe', 'doi-song', 'du-lich'
];

// Interface cho bài viết
interface ScrapedArticle {
  title: string;
  url: string;
  imageUrl: string;
  summary: string;
  content: string;
  publishedAt: Date;
  category: string;
  author?: string;
  tags?: string[];
}

/**
 * Lấy danh sách bài viết từ trang chủ Tuổi Trẻ
 */
export const scrapeHomePage = async (category: string = 'thoi-su'): Promise<ScrapedArticle[]> => {
  try {
    const url = `https://tuoitre.vn/${category}.htm`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const articles: ScrapedArticle[] = [];

    // Lấy các bài viết nổi bật
    $('.box-category-item').each((i, el) => {
      const title = $(el).find('h3 a').text().trim();
      const url = $(el).find('h3 a').attr('href') || '';
      const imageUrl = $(el).find('img').attr('src') || '';
      const summary = $(el).find('.box-category-sapo').text().trim();
      
      if (title && url) {
        articles.push({
          title,
          url: url.startsWith('http') ? url : `https://tuoitre.vn${url}`,
          imageUrl: imageUrl.startsWith('http') ? imageUrl : `https:${imageUrl}`,
          summary,
          content: '', // Sẽ được điền sau khi lấy chi tiết bài viết
          publishedAt: new Date(),
          category
        });
      }
    });

    return articles;
  } catch (error) {
    console.error('Error scraping Tuoi Tre homepage:', error);
    throw new Error('Không thể lấy dữ liệu từ Tuổi Trẻ');
  }
};

/**
 * Lấy nội dung chi tiết của một bài viết
 */
export const scrapeArticleContent = async (article: ScrapedArticle): Promise<ScrapedArticle> => {
  try {
    const response = await axios.get(article.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    
    // Lấy nội dung chính
    let content = '';
    $('.detail-content p').each((i, el) => {
      const text = $(el).text().trim();
      if (text) {
        content += `<p>${text}</p>`;
      }
    });

    // Lấy tác giả
    const author = $('.author').text().trim() || 'Tuổi Trẻ';
    
    // Lấy ngày đăng
    const dateText = $('.date-time').text().trim();
    const publishedAt = dateText ? new Date(dateText) : new Date();
    
    // Lấy các tag
    const tags: string[] = [];
    $('.tags-wrapper a').each((i, el) => {
      const tag = $(el).text().trim();
      if (tag) tags.push(tag);
    });

    return {
      ...article,
      content,
      author,
      publishedAt,
      tags
    };
  } catch (error) {
    console.error(`Error scraping article ${article.url}:`, error);
    return article; // Trả về bài viết gốc nếu có lỗi
  }
};

/**
 * Lưu bài viết vào cơ sở dữ liệu
 */
export const saveArticlesToDB = async (articles: ScrapedArticle[]) => {
  try {
    const savedArticles = [];
    
    for (const article of articles) {
      // Kiểm tra xem bài viết đã tồn tại chưa
      const existingArticle = await Article.findOne({
        where: {
          [Op.or]: [
            { title: article.title },
            { url: article.url }
          ]
        }
      });

      if (!existingArticle) {
        // Tạo slug từ tiêu đề
        const slug = article.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        
        // Lưu bài viết mới
        const newArticle = await Article.create({
          id: uuidv4(),
          title: article.title,
          slug,
          excerpt: article.summary,
          content: article.content,
          featuredImage: article.imageUrl,
          viewCount: 0,
          likeCount: 0,
          commentCount: 0,
          isPublished: true,
          isFeatured: false,
          isBreaking: false,
          publishedAt: article.publishedAt,
          authorId: 1, // ID của admin hoặc tác giả mặc định
          userId: 1, // ID của người tạo
          metaTitle: article.title,
          metaDescription: article.summary,
          metaKeywords: article.tags?.join(', ') || ''
        });

        savedArticles.push(newArticle);
      }
    }

    return savedArticles;
  } catch (error) {
    console.error('Error saving articles to DB:', error);
    throw new Error('Không thể lưu bài viết vào cơ sở dữ liệu');
  }
};

/**
 * Lấy và lưu tin tức từ Tuổi Trẻ
 */
export const fetchAndSaveTuoiTreNews = async (category: string = 'thoi-su') => {
  try {
    console.log(`Đang lấy tin tức từ chuyên mục: ${category}...`);
    
    // Lấy danh sách bài viết từ trang chủ
    const articles = await scrapeHomePage(category);
    console.log(`Đã lấy được ${articles.length} bài viết từ trang chủ.`);
    
    // Lấy nội dung chi tiết cho từng bài viết
    const detailedArticles = [];
    for (const article of articles) {
      const detailedArticle = await scrapeArticleContent(article);
      detailedArticles.push(detailedArticle);
      
      // Chờ 1 giây giữa các request để tránh bị chặn
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Lưu vào cơ sở dữ liệu
    const savedArticles = await saveArticlesToDB(detailedArticles);
    console.log(`Đã lưu ${savedArticles.length} bài viết mới.`);
    
    return {
      success: true,
      message: `Đã cập nhật ${savedArticles.length} bài viết mới từ Tuổi Trẻ`,
      articles: savedArticles
    };
  } catch (error) {
    console.error('Error in fetchAndSaveTuoiTreNews:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Có lỗi xảy ra khi lấy tin tức',
      error: error
    };
  }
};

export default {
  scrapeHomePage,
  scrapeArticleContent,
  saveArticlesToDB,
  fetchAndSaveTuoiTreNews
};
