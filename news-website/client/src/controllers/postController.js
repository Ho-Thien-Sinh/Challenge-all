const Post = require('../models/Post');
const User = require('../models/User');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res, next) => {
  try {
    logger.info('Fetching all posts', { query: req.query });
    const {
      search,
      category,
      status,
      author,
      tags,
      sort = 'createdAt',
      page = 1,
      limit = 10
    } = req.query;
    const where = {};

    // Search
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Filter by category
    if (category) {
      where.category = category;
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by author
    if (author) {
      where.authorId = author;
    }

    // Filter by tags
    if (tags) {
      where.tags = { [Op.overlap]: tags.split(',') };
    }

    // Pagination
    const offset = (page - 1) * limit;

    // Query
    const { rows: posts, count: total } = await Post.findAndCountAll({
      where,
      include: [{ model: User, as: 'author', attributes: ['id', 'name', 'email'] }],
      order: [[sort.replace('-', ''), sort.startsWith('-') ? 'DESC' : 'ASC']],
      offset: parseInt(offset),
      limit: parseInt(limit)
    });

    logger.info(`Successfully fetched ${posts.length} posts`);
    res.status(200).json({
      success: true,
      data: {
        posts,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching posts', { error: error.message, stack: error.stack });
    next(error);
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
exports.getPost = async (req, res, next) => {
  try {
    logger.info(`Fetching post with ID: ${req.params.id}`);
    const post = await Post.findByPk(req.params.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'name', 'email'] }]
    });

    if (!post) {
      logger.warn(`Post not found with ID: ${req.params.id}`);
      return res.status(404).json({
        success: false,
        error: { message: 'Post not found' }
      });
    }

    logger.info(`Successfully fetched post with ID: ${req.params.id}`);
    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    logger.error(`Error fetching post with ID: ${req.params.id}`, { error: error.message, stack: error.stack });
    next(error);
  }
};

// @desc    Create post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res, next) => {
  try {
    logger.info(`Attempting to create new post by user ID: ${req.user.id}`, { body: req.body });
    req.body.authorId = req.user.id;
    const post = await Post.create(req.body);
    logger.info(`Post created successfully with ID: ${post.id}`);
    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    logger.error(`Error creating post by user ID: ${req.user.id}`, { error: error.message, stack: error.stack, body: req.body });
    next(error);
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res, next) => {
  try {
    logger.info(`Attempting to update post with ID: ${req.params.id} by user ID: ${req.user.id}`, { body: req.body });
    let post = await Post.findByPk(req.params.id);
    if (!post) {
      logger.warn(`Post not found for update with ID: ${req.params.id}`);
      return res.status(404).json({
        success: false,
        error: { message: 'Post not found' }
      });
    }
    // Make sure user is post author or admin
    if (post.authorId !== req.user.id && req.user.role !== 'admin') {
      logger.warn(`User ID: ${req.user.id} not authorized to update post with ID: ${req.params.id}`);
      return res.status(403).json({
        success: false,
        error: { message: 'Not authorized to update this post' }
      });
    }
    await post.update(req.body);
    post = await Post.findByPk(req.params.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'name', 'email'] }]
    });
    logger.info(`Post with ID: ${post.id} updated successfully`);
    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    logger.error(`Error updating post with ID: ${req.params.id} by user ID: ${req.user.id}`, { error: error.message, stack: error.stack, body: req.body });
    next(error);
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res, next) => {
  try {
    logger.info(`Attempting to delete post with ID: ${req.params.id} by user ID: ${req.user.id}`);
    const post = await Post.findByPk(req.params.id);
    if (!post) {
      logger.warn(`Post not found for deletion with ID: ${req.params.id}`);
      return res.status(404).json({
        success: false,
        error: { message: 'Post not found' }
      });
    }
    // Make sure user is post author or admin
    if (post.authorId !== req.user.id && req.user.role !== 'admin') {
      logger.warn(`User ID: ${req.user.id} not authorized to delete post with ID: ${req.params.id}`);
      return res.status(403).json({
        success: false,
        error: { message: 'Not authorized to delete this post' }
      });
    }
    await post.destroy();
    logger.info(`Post with ID: ${req.params.id} deleted successfully`);
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    logger.error(`Error deleting post with ID: ${req.params.id} by user ID: ${req.user.id}`, { error: error.message, stack: error.stack });
    next(error);
  }
}; 