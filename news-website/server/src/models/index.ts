import { Sequelize, DataTypes } from 'sequelize';
import dbConnection from '../config/db';

// Import model initializers
import { initModel as initUser, User } from './User';
import { initModel as initArticle, Article } from './Article';
import { initModel as initCategory, Category } from './Category';
import { initModel as initArticleCategory, ArticleCategory } from './ArticleCategory';

// Định nghĩa interface cho models
interface Models {
  User: typeof User;
  Article: typeof Article;
  Category: typeof Category;
  ArticleCategory: typeof ArticleCategory;
  [key: string]: any;
}

// Biến lưu trữ models và sequelize instance
let modelsInstance: Models | null = null;
let sequelizeInstance: Sequelize | null = null;

// Khởi tạo models và thiết lập quan hệ
const initializeModels = (sequelize: Sequelize): Models => {
  // Khởi tạo models
  const models: Models = {
    User: initUser(sequelize),
    Article: initArticle(sequelize),
    Category: initCategory(sequelize),
    ArticleCategory: initArticleCategory(sequelize)
  };

  // Thiết lập quan hệ giữa các model
  // User - Article (1:N)
  models.User.hasMany(models.Article, { foreignKey: 'authorId' });
  models.Article.belongsTo(models.User, { foreignKey: 'authorId' });
  
  // Article - Category (N:M)
  models.Article.belongsToMany(models.Category, { 
    through: models.ArticleCategory,
    foreignKey: 'articleId',
    otherKey: 'categoryId',
    as: 'categories'
  });
  
  models.Category.belongsToMany(models.Article, {
    through: models.ArticleCategory,
    foreignKey: 'categoryId',
    otherKey: 'articleId',
    as: 'articles'
  });

  return models;
};

// Hàm kết nối cơ sở dữ liệu
export const connectDB = async (): Promise<{ models: Models; sequelize: Sequelize }> => {
  try {
    if (modelsInstance && sequelizeInstance) {
      return { models: modelsInstance, sequelize: sequelizeInstance };
    }
    
    // Xác thực kết nối
    await dbConnection.authenticate();
    
    // Khởi tạo models
    const models = initializeModels(dbConnection);
    
    // Lưu lại instance để tái sử dụng
    modelsInstance = models;
    sequelizeInstance = dbConnection;
    
    // Đồng bộ hóa database (chỉ trong môi trường development)
    if (process.env.NODE_ENV === 'development') {
      await syncDatabase({ alter: true });
    }
    
    return { models, sequelize: dbConnection };
  } catch (error) {
    console.error('❌ Lỗi khi kết nối cơ sở dữ liệu:', error);
    throw error;
  }
};

// Hàm lấy models (sẽ throw error nếu chưa được khởi tạo)
export const getModels = (): { models: Models; sequelize: Sequelize } => {
  if (!modelsInstance || !sequelizeInstance) {
    throw new Error('Models chưa được khởi tạo. Vui lòng gọi connectDB() trước.');
  }
  return { models: modelsInstance, sequelize: sequelizeInstance };
};

// Hàm đồng bộ hóa database
export const syncDatabase = async (options: { force?: boolean; alter?: boolean } = { force: false, alter: true }): Promise<boolean> => {
  try {
    const { sequelize } = getModels();
    await sequelize.sync(options);
    console.log('✅ Database synchronized successfully');
    return true;
  } catch (error) {
    console.error('❌ Lỗi khi đồng bộ hóa database:', error);
    return false;
  }
};

// Khởi tạo models nếu chưa được khởi tạo
let initialized = false;
if (!initialized) {
  try {
    const result = getModels();
    modelsInstance = result.models;
    sequelizeInstance = result.sequelize;
    initialized = true;
  } catch (error) {
    // Ignore error if models are not initialized yet
  }
}

// Export các models và utilities
export { DataTypes, User, Article, Category, ArticleCategory };
