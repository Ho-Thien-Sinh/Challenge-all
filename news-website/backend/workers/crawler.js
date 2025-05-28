const axios = require("axios");
const cheerio = require("cheerio");
const Article = require("../models/Article");
const logger = require("../utils/logger");

/**
 * Crawl bài viết mới từ báo Tuổi Trẻ
 * @param {number} limit - Số lượng bài viết cần crawl
 * @returns {Promise<Array>} - Danh sách bài viết đã crawl
 */
async function crawlTuoitreNews(limit = 10) {
  try {
    const url = "https://tuoitre.vn/tin-moi-nhat.htm";
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(response.data);
    const articles = [];
    let count = 0;

    // Function to add article to the list
    const addArticle = (element) => {
      if (count >= limit) return false;

      const title = $(element).find("h3 a, h2 a, .box-title-news a, .title-news a").first().text().trim();
      let link = $(element).find("h3 a, h2 a, .box-title-news a, .title-news a").first().attr("href");
      
      if (!title || !link) return;

      // Handle link
      if (link && !link.startsWith('http')) {
        link = link.startsWith('/') ? `https://tuoitre.vn${link}` : `https://tuoitre.vn/${link}`;
      }

      const summary = $(element).find(".sapo, .box-desc-news, .box-content p, .box-description").first().text().trim();
      const image = $(element).find("img").first().attr("data-src") || 
                  $(element).find("img").first().attr("src") ||
                  $(element).find("[data-src]").first().attr("data-src") ||
                  $(element).find("img[src*='.jpg'], img[src*='.png']").first().attr("src");
      
      // Handle image if it's a relative path
      let imageUrl = image;
      if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('//')) {
        imageUrl = imageUrl.startsWith('/') ? `https://tuoitre.vn${imageUrl}` : `https://tuoitre.vn/${imageUrl}`;
      } else if (imageUrl && imageUrl.startsWith('//')) {
        imageUrl = `https:${imageUrl}`;
      }
      
      const category = link ? new URL(link).pathname.split('/')[1] : "unknown";
      
      // Get publication time
      const timeElement = $(element).find("time").first();
      let publishedAt = new Date();
      
      if (timeElement.length) {
        const datetime = timeElement.attr('datetime') || timeElement.text().trim();
        const parsedDate = new Date(datetime);
        if (!isNaN(parsedDate.getTime())) {
          publishedAt = parsedDate;
        }
      }

      articles.push({
        title,
        summary,
        imageUrl: imageUrl,
        sourceUrl: link,
        content: "", // Will be updated when crawling details
        publishedAt,
        category,
      });
      count++;
    };

    // Get list of articles from different positions on the page
    $("article.news-item, .box-category-item, .box-cate-news, .item-news, .box-category, .box-category li").each((index, element) => {
      if (count >= limit) return false;
      addArticle(element);
    });

    // Get more from featured news boxes
    if (count < limit) {
      $(".box-category-featured .box-category-item, .box-category-hot .box-category-item").each((index, element) => {
        if (count >= limit) return false;
        addArticle(element);
      });
    }

    logger.info(`Found ${articles.length} new articles from Tuoi Tre`);

    // Crawl detailed content and save to database
    const savedArticles = [];
    for (const article of articles) {
      try {
        // Check if the article already exists
        const exists = await Article.findOne({ where: { sourceUrl: article.sourceUrl } });
        if (exists) {
          logger.info(`Article already exists: ${article.title}`);
          continue; // Skip existing article
        }

        // Crawl detailed content
        const detailedArticle = await crawlArticleDetail(article.sourceUrl);
        if (detailedArticle) {
          // Update detailed information
          article.content = detailedArticle.content || article.summary;
          article.publishedAt = detailedArticle.publishedAt || article.publishedAt;
          
          // Add author information
          if (detailedArticle.author) {
            article.author = detailedArticle.author;
          }
          
          // Add list of images
          if (detailedArticle.images && detailedArticle.images.length > 0) {
            article.images = detailedArticle.images;
            
            // If no cover image, get the first image from the article
            if (!article.imageUrl && detailedArticle.images.length > 0) {
              article.imageUrl = detailedArticle.images[0];
            }
          }
          
          // Save to database
          const savedArticle = await Article.create(article);
          savedArticles.push(savedArticle);
          logger.info(`Added new article: ${article.title} with ${article.images ? article.images.length : 0} images`);
        }
      } catch (error) {
        logger.error(`Error processing article ${article.title}: ${error.message}`);
      }
    }

    logger.info(`Successfully saved ${savedArticles.length} new articles from Tuoi Tre`);
    return savedArticles;
  } catch (error) {
    logger.error(`Error crawling Tuoi Tre: ${error.message}`);
    throw error;
  }
}

/**
 * Crawl chi tiết bài viết từ URL
 * @param {string} url - URL bài viết
 * @returns {Promise<Object>} - Thông tin chi tiết bài viết
 */
async function crawlArticleDetail(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(response.data);
    
    // Get article content
    let content = "";
    $("article.content.fck, .detail-content, .detail-cate-main").find('p, h2, h3').each((index, element) => {
      const text = $(element).text().trim();
      if (text) {
        // Remove advertising or unnecessary sections
        if (!text.match(/đọc thêm|xem thêm|video|quảng cáo/i)) {
          content += text + "\n\n";
        }
      }
    });
    
    // If content is not retrieved, try another way
    if (!content) {
      $("#main-detail, .detail-content").find('p').each((index, element) => {
        const text = $(element).text().trim();
        if (text) {
          content += text + "\n\n";
        }
      });
    }
    
    // Get publication time
    const dateTimeStr = $(".detail-time, .date-time").first().text().trim();
    let publishedAt = new Date();
    
    // Try to parse time from string (e.g., "Saturday, 12/10/2024 - 08:30")
    if (dateTimeStr) {
      const dateMatch = dateTimeStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      const timeMatch = dateTimeStr.match(/(\d{1,2}):(\d{1,2})/);
      
      if (dateMatch && timeMatch) {
        const day = parseInt(dateMatch[1]);
        const month = parseInt(dateMatch[2]) - 1; // Month in JS starts from 0
        const year = parseInt(dateMatch[3]);
        const hour = parseInt(timeMatch[1]);
        const minute = parseInt(timeMatch[2]);
        
        publishedAt = new Date(year, month, day, hour, minute);
      }
    }
    
    // Get article author
    let author = "Tuổi Trẻ Online";
    const authorElement = $(".author-info, .author, .detail-author, [data-role='author']").first();
    if (authorElement.length) {
      const authorText = authorElement.text().trim();
      if (authorText) {
        // Process author string, remove unnecessary prefixes
        author = authorText.replace(/^(tác giả|author|by):\s*/i, '').trim();
      }
    }
    
    // Get all images in the article
    const images = [];
    $("article.content.fck img, .detail-content img, .detail-cate-main img").each((index, element) => {
      const imgSrc = $(element).attr("data-src") || $(element).attr("src");
      if (imgSrc) {
        let imageUrl = imgSrc;
        // Handle image URL
        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('//')) {
          imageUrl = imageUrl.startsWith('/') ? `https://tuoitre.vn${imageUrl}` : `https://tuoitre.vn/${imageUrl}`;
        } else if (imageUrl && imageUrl.startsWith('//')) {
          imageUrl = `https:${imageUrl}`;
        }
        
        // Only add images with valid extensions
        if (imageUrl.match(/\.(jpg|jpeg|png|gif)($|\?)/i)) {
          images.push(imageUrl);
        }
      }
    });
    
    return {
      content: content.trim(),
      publishedAt,
      author,
      images: images.filter((url, index, self) => self.indexOf(url) === index) // Remove duplicate URLs
    };
  } catch (error) {
    logger.error(`Error crawling article detail from ${url}: ${error.message}`);
    return null;
  }
}

module.exports = crawlTuoitreNews;
