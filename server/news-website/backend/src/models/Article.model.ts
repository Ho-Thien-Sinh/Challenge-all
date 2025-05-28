import { Model, DataTypes, ModelStatic, Optional } from 'sequelize';
import { Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User.model';

export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

// Interface cho các thuộc tính của Article
export interface ArticleAttributes {
  id: number;
  title: string;
  summary?: string | null;
  content: string;
  imageUrl?: string | null;
  images: string[];
  sourceUrl: string;
  publishedAt: Date;
  category?: string | null;
  authorName?: string | null;
  authorId?: number | null;
  status: ArticleStatus;
  views: number;
  isFeatured: boolean;
  metadata?: Record<string, any> | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface cho các thuộc tính tùy chọn khi tạo mới Article
export interface ArticleCreationAttributes extends Optional<ArticleAttributes, 'id' | 'views' | 'isFeatured' | 'status' | 'publishedAt' | 'images'> {}

// Định nghĩa model Article
@Table({
  tableName: 'articles',
  timestamps: true,
  underscored: true,
  paranoid: false,
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
})
export class Article extends Model<ArticleAttributes, ArticleCreationAttributes> implements ArticleAttributes {
  // Add associate method for model relationships
  public static associate(models: any): void {
    Article.belongsTo(models.User, {
      foreignKey: 'authorId',
      as: 'author'
    });
  }
  public id!: number;
  public title!: string;
  public summary?: string | null;
  public content!: string;
  public imageUrl?: string | null;
  public images!: string[];
  public sourceUrl!: string;
  public publishedAt!: Date;
  public category?: string | null;
  public authorName?: string | null;
  public authorId?: number | null;
  public status!: ArticleStatus;
  public views!: number;
  public isFeatured!: boolean;
  public metadata?: Record<string, any> | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Quan hệ với User sẽ được định nghĩa trong file index.ts
  public author?: any;
}

// Export type for the Article model
export type ArticleType = typeof Article;

// Hàm khởi tạo model Article
export function initArticleModel(sequelize: any): typeof Article {
  Article.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      summary: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      imageUrl: {
        type: DataTypes.STRING,
        field: 'image_url',
        allowNull: true,
      },
      images: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '[]',
        get(): string[] {
          const rawValue = this.getDataValue('images') as unknown;
          if (Array.isArray(rawValue)) {
            return rawValue as string[];
          }
          try {
            return rawValue ? JSON.parse(rawValue as string) : [];
          } catch (e) {
            return [];
          }
        },
        set(value: unknown): void {
          if (Array.isArray(value)) {
            this.setDataValue('images', JSON.stringify(value) as unknown as string[]);
          } else if (typeof value === 'string') {
            try {
              const parsed = JSON.parse(value);
              this.setDataValue('images', (Array.isArray(parsed) ? value : '[]') as unknown as string[]);
            } catch (e) {
              this.setDataValue('images', '[]' as unknown as string[]);
            }
          } else {
            this.setDataValue('images', '[]' as unknown as string[]);
          }
        },
      },
      sourceUrl: {
        type: DataTypes.STRING,
        field: 'source_url',
        allowNull: false,
        unique: true,
      },
      publishedAt: {
        type: DataTypes.DATE,
        field: 'published_at',
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      authorName: {
        type: DataTypes.STRING,
        field: 'author_name',
        allowNull: true,
      },
      authorId: {
        type: DataTypes.INTEGER,
        field: 'author_id',
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      status: {
        type: DataTypes.ENUM(...Object.values(ArticleStatus)),
        allowNull: false,
        defaultValue: ArticleStatus.DRAFT,
      },
      views: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      isFeatured: {
        type: DataTypes.BOOLEAN,
        field: 'is_featured',
        allowNull: false,
        defaultValue: false,
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Article',
      tableName: 'articles',
      timestamps: true,
      underscored: true,
    }
  );

  return Article;
}
