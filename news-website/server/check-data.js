const { sequelize } = require('./src/models');

async function checkData() {
  try {
    // Kiểm tra kết nối database
    await sequelize.authenticate();
    console.log('Kết nối database thành công!');

    // Kiểm tra dữ liệu trong bảng Users
    const users = await sequelize.query('SELECT * FROM "Users"', { type: sequelize.QueryTypes.SELECT });
    console.log('\nDữ liệu trong bảng Users:');
    console.log(users);

    // Kiểm tra dữ liệu trong bảng Categories
    const categories = await sequelize.query('SELECT * FROM "Categories"', { type: sequelize.QueryTypes.SELECT });
    console.log('\nDữ liệu trong bảng Categories:');
    console.log(categories);

    // Kiểm tra dữ liệu trong bảng Tags
    const tags = await sequelize.query('SELECT * FROM "Tags"', { type: sequelize.QueryTypes.SELECT });
    console.log('\nDữ liệu trong bảng Tags:');
    console.log(tags);

    // Kiểm tra dữ liệu trong bảng Articles
    const articles = await sequelize.query('SELECT * FROM "Articles"', { type: sequelize.QueryTypes.SELECT });
    console.log('\nDữ liệu trong bảng Articles:');
    console.log(articles);

    // Kiểm tra dữ liệu trong bảng ArticleTags
    const articleTags = await sequelize.query('SELECT * FROM "ArticleTags"', { type: sequelize.QueryTypes.SELECT });
    console.log('\nDữ liệu trong bảng ArticleTags:');
    console.log(articleTags);

  } catch (error) {
    console.error('Lỗi khi kiểm tra dữ liệu:', error);
  } finally {
    // Đóng kết nối database
    await sequelize.close();
  }
}

checkData();
