const Article = require('./models/Article');
const sequelize = require('./config/database');

async function updateArticleImages() {
  try {
    // Get all articles
    const articles = await Article.findAll();
    console.log(`Found ${articles.length} articles to update.`);

    // Map category to new image URL
    const categoryImageMap = {
      'giao-duc': '/static/images/giao-duc.jpg',
      'kinh-doanh': '/static/images/kinh-doanh.jpg',
      'the-thao': '/static/images/the-thao.jpg',
      'thoi-su': '/static/images/thoi-su.jpg',
      'giai-tri': '/static/images/giai-tri.jpg',
      'cong-nghe': '/static/images/cong-nghe.jpg',
      'suc-khoe': '/static/images/suc-khoe.jpg',
      'du-lich': '/static/images/du-lich.jpg',
      'khoa-hoc': '/static/images/khoa-hoc.jpg',
      'am-thuc': '/static/images/am-thuc.jpg',
      'thoi-trang': '/static/images/thoi-trang.jpg'
    };

    // Update image URL for each article
    for (const article of articles) {
      const newImageUrl = categoryImageMap[article.category] || '/static/images/giao-duc.jpg';
      
      await article.update({
        imageUrl: newImageUrl
      });
      
      console.log(`Updated article ID ${article.id}: ${article.title} - New image: ${newImageUrl}`);
    }

    console.log('Update complete!');
  } catch (error) {
    console.error('Error updating article images:', error);
  } finally {
    process.exit();
  }
}

updateArticleImages();