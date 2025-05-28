import { sequelize } from '../config/database';
import User from './User.model';
import { initArticleModel } from './Article.model';

// Initialize models
User.initialize(sequelize);
const Article = initArticleModel(sequelize);

// Setup associations
if (User.associate) {
  User.associate({ Article });
}

if (Article.associate) {
  Article.associate({ User });
}

export { User, Article };

// Export all types
export * from './User.model';
export * from './Article.model';
