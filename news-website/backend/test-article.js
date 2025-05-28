const Article = require('./models/Article');
const sequelize = require('./config/database');

async function createTestArticle() {
  try {
    // Create a test article
    const article = await Article.create({
      title: 'Bài viết thử nghiệm',
      summary: 'Đây là bài viết thử nghiệm',
      content: 'Nội dung bài viết thử nghiệm',
      imageUrl: 'https://example.com/image.jpg',
      sourceUrl: 'https://example.com/article-' + Date.now(),
      publishedAt: new Date(),
      category: 'Thử nghiệm'
    });

    console.log('Test article created:', article.id);

    // Get all articles
    const articles = await Article.findAll();
    console.log('Total articles:', articles.length);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

createTestArticle();