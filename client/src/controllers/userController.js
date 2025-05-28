const User = require('../models/User');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    logger.info('Fetching all users', { query: req.query, requestedBy: req.user ? req.user.id : 'anonymous' });
    const { search, role, sort = 'createdAt', page = 1, limit = 10 } = req.query;
    const where = {};

    // Search
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Filter by role
    if (role) {
      where.role = role;
    }

    // Pagination
    const offset = (page - 1) * limit;

    // Query
    const { rows: users, count: total } = await User.findAndCountAll({
      where,
      order: [[sort.replace('-', ''), sort.startsWith('-') ? 'DESC' : 'ASC']],
      offset: parseInt(offset),
      limit: parseInt(limit),
      attributes: { exclude: ['password'] }
    });

    logger.info(`Successfully fetched ${users.length} users`);
    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching users', { error: error.message, stack: error.stack, requestedBy: req.user ? req.user.id : 'anonymous' });
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
  try {
    logger.info(`Fetching user with ID: ${req.params.id}, requested by user ID: ${req.user ? req.user.id : 'anonymous'}`);
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      logger.warn(`User not found with ID: ${req.params.id}`);
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    logger.info(`Successfully fetched user with ID: ${req.params.id}`);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error(`Error fetching user with ID: ${req.params.id}`, { error: error.message, stack: error.stack, requestedBy: req.user ? req.user.id : 'anonymous' });
    next(error);
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
  try {
    logger.info('Attempting to create new user', { body: req.body, createdBy: req.user ? req.user.id : 'anonymous' });
    const user = await User.create(req.body);
    logger.info(`User created successfully with ID: ${user.id}`);
    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Error creating user', { error: error.message, stack: error.stack, body: req.body, createdBy: req.user ? req.user.id : 'anonymous' });
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    logger.info(`Attempting to update user with ID: ${req.params.id} by user ID: ${req.user ? req.user.id : 'anonymous'}`, { body: req.body });
    const [affectedRows, [user]] = await User.update(req.body, {
      where: { id: req.params.id },
      returning: true,
      individualHooks: true
    });

    if (!user) {
      logger.warn(`User not found for update with ID: ${req.params.id}`);
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    logger.info(`User with ID: ${user.id} updated successfully`);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error(`Error updating user with ID: ${req.params.id} by user ID: ${req.user ? req.user.id : 'anonymous'}`, { error: error.message, stack: error.stack, body: req.body });
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    logger.info(`Attempting to delete user with ID: ${req.params.id} by user ID: ${req.user ? req.user.id : 'anonymous'}`);
    const user = await User.findByPk(req.params.id);
    if (!user) {
      logger.warn(`User not found for deletion with ID: ${req.params.id}`);
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }
    await user.destroy();
    logger.info(`User with ID: ${req.params.id} deleted successfully`);
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    logger.error(`Error deleting user with ID: ${req.params.id} by user ID: ${req.user ? req.user.id : 'anonymous'}`, { error: error.message, stack: error.stack });
    next(error);
  }
}; 