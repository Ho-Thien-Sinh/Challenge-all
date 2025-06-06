import { Model, DataTypes } from 'sequelize';
import { sequelize } from '@/config/database';

class ArticleCategory extends Model {
  public articleId!: number;
  public categoryId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // No associations needed here as this is a junction model
  // The associations are defined in the Article and Category models
}

// Hàm khởi tạo model
const initModel = () => {
  ArticleCategory.init(
    {
      articleId: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        references: {
          model: 'articles',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      categoryId: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        references: {
          model: 'categories',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
    },
    {
      tableName: 'article_categories',
      timestamps: true,
      sequelize,
    }
  );

  return ArticleCategory;
};

// Initialize model with the imported sequelize instance
const init = () => {
  return initModel();
};

export { ArticleCategory, init as initModel };
