import { DataTypes, Model, Sequelize, Optional } from 'sequelize';
import slugify from 'slugify';
import { IArticle } from '@/types';

// Attributes for Article creation (optional fields)
interface ArticleCreationAttributes extends Optional<IArticle, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

class Article extends Model<IArticle, ArticleCreationAttributes> implements IArticle {
  public id!: number;
  public title!: string;
  public slug!: string;
  public excerpt!: string;
  public content!: string;
  public featuredImage!: string;
  public viewCount!: number;
  public likeCount!: number;
  public commentCount!: number;
  public isPublished!: boolean;
  public isFeatured!: boolean;
  public isBreaking!: boolean;
  public publishedAt?: Date;
  public source?: string;
  public sourceUrl?: string;
  public readingTime?: number;
  public metaTitle?: string;
  public metaDescription?: string;
  public metaKeywords?: string;
  public ogTitle?: string;
  public ogDescription?: string;
  public ogImage?: string;
  public twitterCard?: string;
  public twitterTitle?: string;
  public twitterDescription?: string;
  public twitterImage?: string;
  public searchVector?: any;
  public authorId!: number;
  public userId!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
  public deletedAt?: Date;

    // Phương thức tạo slug từ tiêu đề
  public static createSlug(title: string): string {
    return slugify(title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
  }

  // Tạo trigger để cập nhật search_vector
  public static async createSearchVectorTrigger(sequelize: Sequelize): Promise<void> {
    const updateSearchVector = `
      CREATE OR REPLACE FUNCTION article_search_vector_update() RETURNS TRIGGER AS $$
      BEGIN
        NEW."searchVector" := 
          setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
          setweight(to_tsvector('english', COALESCE(NEW.excerpt, '')), 'B') ||
          setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'C');
        RETURN NEW;
      END
      $$ LANGUAGE plpgsql;`;

    await sequelize.query(updateSearchVector);

    await sequelize.query(`
      DROP TRIGGER IF EXISTS tsvector_update_articles ON "Articles";
      CREATE TRIGGER tsvector_update_articles BEFORE INSERT OR UPDATE
      ON "Articles" FOR EACH ROW EXECUTE FUNCTION article_search_vector_update();
    `);
  }

  // Thiết lập các mối quan hệ
  public static associate(models: any): void {
    // Quan hệ nhiều-một với User (tác giả)
    Article.belongsTo(models.User, {
      foreignKey: 'authorId',
      as: 'author',
      onDelete: 'CASCADE'
    });

    // Quan hệ nhiều-nhiều với Category
    Article.belongsToMany(models.Category, {
      through: models.ArticleCategory,
      foreignKey: 'articleId',
      otherKey: 'categoryId',
      as: 'categories',
      onDelete: 'CASCADE'
    });

    // Quan hệ một-nhiều với Comment (nếu có)
    // Article.hasMany(models.Comment, {
    //   foreignKey: 'articleId',
    //   as: 'comments',
    //   onDelete: 'CASCADE'
    // });
  }
}

// Hàm khởi tạo model
const initModel = (sequelize: Sequelize): typeof Article => {
  Article.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notNull: { msg: 'Vui lòng nhập tiêu đề bài viết' },
        notEmpty: { msg: 'Tiêu đề không được để trống' },
        len: {
          args: [1, 200],
          msg: 'Tiêu đề phải từ 1 đến 200 ký tự'
        }
      }
    },
    slug: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true, // Tạm thời cho phép null
      set(value: string | null) {
        // Tự động tạo slug từ tiêu đề nếu không cung cấp
        const title = this.getDataValue('title');
        const slugValue = value || (title ? Article.createSlug(title) : null);
        if (slugValue) {
          this.setDataValue('slug', slugValue);
        }
      }
    },
    excerpt: {
      type: DataTypes.STRING(500),
      allowNull: true, // Cho phép NULL
      defaultValue: '', // Giá trị mặc định là chuỗi rỗng
      validate: {
        len: {
          args: [0, 500],
          msg: 'Mô tả không được vượt quá 500 ký tự'
        }
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: { msg: 'Vui lòng nhập nội dung bài viết' },
        notEmpty: { msg: 'Nội dung không được để trống' }
      }
    },
    featuredImage: {
      type: DataTypes.STRING,
      defaultValue: '/images/default-article.jpg'
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    likeCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    commentCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isBreaking: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    source: {
      type: DataTypes.STRING,
      allowNull: true
    },
    sourceUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    readingTime: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    metaTitle: {
      type: DataTypes.STRING(100)
    },
    metaDescription: {
      type: DataTypes.STRING(300)
    },
    metaKeywords: {
      type: DataTypes.STRING
    },
    ogTitle: {
      type: DataTypes.STRING(100)
    },
    ogDescription: {
      type: DataTypes.STRING(300)
    },
    ogImage: {
      type: DataTypes.STRING
    },
    twitterCard: {
      type: DataTypes.STRING
    },
    twitterTitle: {
      type: DataTypes.STRING(100)
    },
    twitterDescription: {
      type: DataTypes.STRING(300)
    },
    twitterImage: {
      type: DataTypes.STRING
    },
    searchVector: {
      type: DataTypes.TSVECTOR
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Article',
    tableName: 'articles',
    timestamps: true,
    paranoid: true,
    underscored: true,
    hooks: {
      beforeValidate: (article: Article) => {
        if (article.title && !article.slug) {
          article.slug = Article.createSlug(article.title);
        }
      }
    },
    indexes: [
      {
        name: 'article_slug_idx',
        unique: true,
        fields: ['slug']
      },
      {
        name: 'article_published_idx',
        fields: ['is_published', 'published_at']
      },
      {
        name: 'article_search_idx',
        type: 'FULLTEXT',
        fields: ['title', 'excerpt', 'content']
      },
      {
        name: 'article_search_vector_idx',
        using: 'GIN',
        fields: ['searchVector']
      }
    ]
  });

  // Tạo trigger tìm kiếm
  Article.createSearchVectorTrigger(sequelize);

  return Article;
};

// Export model
const init = (sequelize: Sequelize) => {
  return initModel(sequelize);
};

export { Article, init as initModel };