import axios from 'axios';
import * as cheerio from 'cheerio';
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';
import db from '../../models';

interface ArticleData {
  title: string;
  url: string;
  excerpt: string;
  thumbnail?: string;
  category: string;
}

interface ScrapedArticle extends ArticleData {
  content: string;
  author: string;
  publishedAt: string;
  featuredImage?: string;
}

class TuoiTreScraper {
  private baseUrl: string;
  private categories: { [key: string]: string };

  constructor() {
    this.baseUrl = 'https://tuoitre.vn';
    this.categories = {
      thoi_su: 'thoi-su',
      the_gioi: 'the-gioi',
      phap_luat: 'phap-luat',
      kinh_doanh: 'kinh-doanh',
      giai_tri: 'giai-tri',
      the_thao: 'the-thao',
      giao_duc: 'giao-duc',
      khoa_hoc: 'khoa-hoc',
      suc_khoe: 'suc-khoe',
      doi_song: 'doi-song',
      du_lich: 'du-lich',
      xe: 'xe',
      nhip_song_tre: 'nhip-song-tre',
      van_hoa: 'van-hoa',
      goc_nhin: 'goc-nhin',
    };
  }

  async scrapeCategory(category: string, limit: number = 10): Promise<ArticleData[]> {
    try {
      const categoryUrl = `${this.baseUrl}/${this.categories[category]}.htm`;
      console.log(`🔄 Đang lấy dữ liệu từ: ${categoryUrl}`);
      
      const response = await axios.get(categoryUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      const articles: ArticleData[] = [];

      // Lấy các bài viết nổi bật
      $('div.zone--timeline article').slice(0, limit).each((i, el) => {
        const title = $(el).find('h3 a').text().trim();
        const url = $(el).find('h3 a').attr('href');
        const excerpt = $(el).find('p').text().trim();
        const thumbnail = $(el).find('img').attr('data-src') || $(el).find('img').attr('src');
        
        if (title && url) {
          articles.push({
            title,
            url: url.startsWith('http') ? url : `${this.baseUrl}${url}`,
            excerpt,
            thumbnail,
            category
          });
        }
      });

      return articles;
    } catch (error) {
      console.error(`❌ Lỗi khi lấy dữ liệu từ ${category}:`, error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  async scrapeArticle(articleUrl: string): Promise<ScrapedArticle | null> {
    try {
      const response = await axios.get(articleUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      
      // Lấy tiêu đề
      const title = $('h1.article-title').text().trim();
      
      // Lấy tác giả và thời gian
      const author = $('div.author-info .author').text().trim() || 'Tuổi Trẻ Online';
      const publishedAt = $('div.author-info time').attr('datetime') || new Date().toISOString();
      
      // Lấy nội dung
      let content = '';
      $('div.content.fck p').each((i, el) => {
        const text = $(el).text().trim();
        if (text) {
          content += `<p>${text}</p>`;
        }
      });

      // Lấy ảnh đại diện
      const featuredImage = $('div.VCSortableInPreviewMode img').attr('src') || 
                           $('div.photo img').attr('src') ||
                           $('figure.photo img').attr('src') ||
                           '';

      return {
        title,
        url: articleUrl,
        excerpt: $('h2.sapo').text().trim() || content.substring(0, 200) + '...',
        thumbnail: featuredImage,
        category: '', // Will be set by the caller
        content,
        author,
        publishedAt,
        featuredImage
      };
    } catch (error) {
      console.error(`❌ Lỗi khi lấy nội dung bài viết ${articleUrl}:`, error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  async scrapeAndSaveArticles(category: string, limit: number = 10): Promise<void> {
    try {
      console.log(`🔄 Bắt đầu cập nhật bài viết cho chuyên mục: ${category}`);
      
      // Kết nối CSDL nếu chưa kết nối
      await db.connectDB();
      
      // Lấy danh sách bài viết từ chuyên mục
      const articles = await this.scrapeCategory(category, limit);
      
      // Lưu từng bài viết vào cơ sở dữ liệu
      for (const article of articles) {
        try {
          // Kiểm tra xem bài viết đã tồn tại chưa
          const existingArticle = await db.Article.findOne({
            where: { sourceUrl: article.url } as any
          });

          if (!existingArticle) {
            // Lấy nội dung chi tiết bài viết
            const articleDetail = await this.scrapeArticle(article.url);
            
            if (articleDetail) {
              // Tạo slug từ tiêu đề
              const slug = slugify(article.title, {
                lower: true,
                strict: true,
                locale: 'vi'
              }) + '-' + uuidv4().substring(0, 8);

              // Tạo bài viết mới
              const newArticle = await db.Article.create({
                title: article.title,
                slug,
                content: articleDetail.content,
                excerpt: article.excerpt,
                featuredImage: article.thumbnail || articleDetail.featuredImage || '',
                authorId: 1, // Default admin user ID
                userId: 1, // Default admin user
                publishedAt: new Date(articleDetail.publishedAt),
                sourceUrl: article.url,
                source: 'Tuổi Trẻ',
                readingTime: 5, // Default reading time in minutes
                viewCount: 0,
                likeCount: 0,
                commentCount: 0,
                isPublished: true,
                isFeatured: false,
                isBreaking: false,
                metaTitle: article.title,
                metaDescription: article.excerpt,
                metaKeywords: article.category
              } as any);

              // Lưu danh mục
              if (article.category) {
                try {
                  let category = await db.Category.findOne({
                    where: { slug: article.category }
                  });

                  if (!category) {
                    category = await db.Category.create({
                      name: article.category,
                      slug: article.category,
                      description: `Chuyên mục ${article.category}`,
                      isActive: true,
                      isFeatured: false,
                      metaTitle: article.category,
                      metaDescription: `Các bài viết về ${article.category}`,
                      metaKeywords: article.category
                    });
                  }
                  // Liên kết bài viết với danh mục
                  await db.ArticleCategory.create({
                    articleId: newArticle.id,
                    categoryId: category.id
                  });
                } catch (error) {
                  console.error(`❌ Lỗi khi lưu danh mục ${article.category}:`, error);
                }
              }
              
              console.log(`✅ Đã lưu bài viết: ${article.title}`);
            }
          } else {
            console.log(`⏩ Bỏ qua bài viết đã tồn tại: ${article.title}`);
          }
        } catch (error) {
          console.error(`❌ Lỗi khi lưu bài viết:`, error instanceof Error ? error.message : 'Unknown error');
        }
      }
      
      console.log(`✅ Hoàn thành cập nhật bài viết cho chuyên mục: ${category}`);
    } catch (error) {
      console.error(`❌ Lỗi khi cập nhật bài viết:`, error instanceof Error ? error.message : 'Unknown error');
    }
  }
}

export default new TuoiTreScraper();
