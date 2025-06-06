import { Model, DataTypes } from 'sequelize';
import { sequelize } from '@/config/database';

class Category extends Model {
  public id!: number;
  public name!: string;
  public slug!: string;
  public description?: string;
  public isActive!: boolean;
  public isFeatured!: boolean;
  public metaTitle?: string;
  public metaDescription?: string;
  public metaKeywords?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Define associations
  public static associate(models: any) {
    Category.belongsToMany(models.Article, {
      through: models.ArticleCategory,
      as: 'articles',
      foreignKey: 'categoryId',
      otherKey: 'articleId'
    });
  }
}

// Hàm khởi tạo model
const initModel = () => {
  Category.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      isFeatured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      metaTitle: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      metaDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      metaKeywords: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: 'categories',
      sequelize,
    }
  );

  return Category;
};

// Initialize model with the imported sequelize instance
const init = () => {
  return initModel();
};

export { Category, init as initModel };
