// @ts-nocheck
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res) => {
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Xây dựng điều kiện where cho Sequelize
  const where = {};
  
  // Lọc theo role nếu có
  if (req.query.role) where.role = req.query.role;
  
  // Lọc theo trạng thái hoạt động nếu có
  if (req.query.isActive) where.is_active = req.query.isActive === 'true';

  // Tìm kiếm nếu có từ khóa
  if (req.query.search) {
    where[Op.or] = [
      { username: { [Op.iLike]: `%${req.query.search}%` } },
      { email: { [Op.iLike]: `%${req.query.search}%` } },
      { full_name: { [Op.iLike]: `%${req.query.search}%` } }
    ];
  }

  // Xử lý sắp xếp
  let order = [['created_at', 'DESC']]; // Mặc định sắp xếp theo ngày tạo mới nhất
  if (req.query.sortBy) {
    const sortBy = req.query.sortBy.split(':');
    order = [[sortBy[0], sortBy[1].toUpperCase()]];
  }

  // Thực hiện truy vấn phân trang
  const { count, rows: users } = await User.findAndCountAll({
    where,
    order,
    offset: skip,
    limit,
    attributes: { exclude: ['password', 'reset_password_token', 'reset_password_expire'] },
  });

  // Kết quả phân trang
  const pagination = {
    total: count,
    page,
    pages: Math.ceil(count / limit),
    limit
  };

  res.status(200).json({
    success: true,
    count: users.length,
    pagination,
    data: users
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['password', 'reset_password_token', 'reset_password_expire'] }
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json(user);
});

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = [
  // Validation
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('role').optional().isIn(['user', 'admin', 'editor']).withMessage('Invalid role'),
  
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const { username, email, password, fullName, role } = req.body;

    // Check if user exists
    let user = await User.findOne({ where: { email } });
    if (user) {
      throw new ApiError(400, 'User already exists');
    }

    // Create user
    user = await User.create({
      username,
      email,
      password,
      fullName,
      role: role || 'user'
    });

    const userData = user.get({ plain: true });
    delete userData.password;
    delete userData.reset_password_token;
    delete userData.reset_password_expire;

    res.status(201).json({
      success: true,
      data: userData
    });
  })
];

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = [
  // Validation
  body('email').optional().isEmail().withMessage('Please include a valid email'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role').optional().isIn(['user', 'admin', 'editor']).withMessage('Invalid role'),
  
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    let user = await User.findByPk(req.params.id);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Check if email is already taken by another user
    if (req.body.email) {
      const emailExists = await User.findOne({ 
        where: { email: req.body.email, id: { [Op.ne]: req.params.id } }
      });
      
      if (emailExists) {
        throw new ApiError(400, 'Email already in use by another account');
      }
    }

    // Update user
    const updateFields = { ...req.body };
    
    // Don't update password here if it's not provided
    if (!updateFields.password) {
      delete updateFields.password;
    }

    user = await User.update(updateFields, {
      where: { id: req.params.id },
      returning: true,
      plain: true
    });

    res.status(200).json({
      success: true,
      data: user[1]
    });
  })
];

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Prevent deleting own account
  if (user.id.toString() === req.user.id) {
    throw new ApiError(400, 'You cannot delete your own account');
  }

  // Xóa người dùng
  await user.destroy();

  res.status(200).json({
    success: true,
    data: {}
  });
});

