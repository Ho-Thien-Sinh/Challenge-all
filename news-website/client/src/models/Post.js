const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const logger = require('../utils/logger');
const slugify = require('slugify');

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - category
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the post
 *         title:
 *           type: string
 *           description: The title of the post
 *           minLength: 1
 *           maxLength: 100
 *         content:
 *           type: string
 *           description: The content of the post
 *         slug:
 *           type: string
 *           description: The URL-friendly version of the title
 *         category:
 *           type: string
 *           enum: [product, article]
 *           description: The category of the post
 *         status:
 *           type: string
 *           enum: [draft, published]
 *           description: The publication status of the post
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of tags associated with the post
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of image URLs associated with the post
 *         authorId:
 *           type: integer
 *           description: The ID of the post author
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the post was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the post was last updated
 */
const Post = sequelize.define('Post', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  slug: {
    type: DataTypes.STRING,
    unique: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'article',
    validate: {
      isIn: [['product', 'article']]
    }
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'draft',
    validate: {
      isIn: [['draft', 'published']]
    }
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  }
}, {
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  hooks: {
    beforeValidate: async (post) => {
      // Generate slug from title if not provided
      if (post.title && !post.slug) {
        post.slug = slugify(post.title, { lower: true, strict: true });
      }
    },
    afterCreate: async (post) => {
      logger.info(`New post created: ${post.title} (ID: ${post.id})`);
    },
    afterUpdate: async (post) => {
      logger.info(`Post updated: ${post.title} (ID: ${post.id})`);
    },
    afterDestroy: async (post) => {
      logger.info(`Post deleted: ${post.title} (ID: ${post.id})`);
    }
  },
  validate: {
    validateContent() {
      if (this.content && this.content.length < 10) {
        throw new Error('Content must be at least 10 characters long');
      }
    },
    validateTags() {
      if (this.tags && !Array.isArray(this.tags)) {
        throw new Error('Tags must be an array');
      }
    }
  }
});

// Thiết lập quan hệ với User
Post.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
User.hasMany(Post, { foreignKey: 'authorId', as: 'posts' });

// Custom instance methods
Post.prototype.publish = async function() {
  this.status = 'published';
  await this.save();
  logger.info(`Post published: ${this.title} (ID: ${this.id})`);
  return this;
};

Post.prototype.addTag = async function(tag) {
  if (!this.tags) {
    this.tags = [];
  }
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
    await this.save();
    logger.info(`Tag "${tag}" added to post: ${this.title} (ID: ${this.id})`);
  }
  return this;
};

// Static methods
Post.findBySlug = async function(slug) {
  const post = await this.findOne({ where: { slug } });
  if (!post) {
    logger.warn(`Post not found with slug: ${slug}`);
    throw new Error('Post not found');
  }
  return post;
};

module.exports = Post; 