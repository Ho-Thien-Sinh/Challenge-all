// @ts-nocheck
const asyncHandler = require('express-async-handler');
const { Category, Article } = require('../models');
const ApiError = require('../utils/ApiError');
const { Op } = require('sequelize');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      attributes: ['id', 'name', 'slug', 'description', 'image', 'parentId', 'isActive'],
      where: { isActive: true },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Category,
          as: 'children',
          attributes: ['id', 'name', 'slug'],
          where: { isActive: true },
          required: false
        },
        {
          model: Article,
          as: 'articles',
          attributes: ['id', 'title', 'slug', 'thumbnail', 'createdAt'],
          through: { attributes: [] },
          limit: 5,
          order: [['createdAt', 'DESC']],
          required: false
        }
      ]
    });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    next(new ApiError('Server error', 500));
  }
});

// @desc    Get single category by slug
// @route   GET /api/categories/:slug
// @access  Public
exports.getCategory = asyncHandler(async (req, res, next) => {
  try {
    const { slug } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const category = await Category.findOne({
      where: { slug, isActive: true },
      include: [
        {
          model: Category,
          as: 'parent',
          attributes: ['id', 'name', 'slug'],
          required: false
        },
        {
          model: Category,
          as: 'children',
          attributes: ['id', 'name', 'slug'],
          where: { isActive: true },
          required: false
        }
      ]
    });

    if (!category) {
      return next(new ApiError(`Category with slug ${slug} not found`, 404));
    }

    // Lấy danh sách bài viết thuộc category
    const { count, rows: articles } = await Article.findAndCountAll({
      include: [
        {
          model: Category,
          where: { id: category.id },
          attributes: [],
          through: { attributes: [] }
        }
      ],
      limit,
      offset,
      order: [['publishedAt', 'DESC']],
      attributes: ['id', 'title', 'slug', 'description', 'thumbnail', 'publishedAt']
    });

    res.status(200).json({
      success: true,
      data: {
        ...category.toJSON(),
        articles: {
          pagination: {
            total: count,
            page,
            pages: Math.ceil(count / limit)
          },
          data: articles
        }
      }
    });
  } catch (error) {
    console.error('Error getting category:', error);
    next(new ApiError('Server error', 500));
  }
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = asyncHandler(async (req, res, next) => {
  try {
    const { name, description, parentId, isActive = true } = req.body;

    // Kiểm tra category đã tồn tại chưa
    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      return next(new ApiError('Category already exists', 400));
    }

    // Nếu có parentId, kiểm tra parent có tồn tại không
    if (parentId) {
      const parent = await Category.findByPk(parentId);
      if (!parent) {
        return next(new ApiError('Parent category not found', 404));
      }
    }

    const category = await Category.create({
      name,
      description,
      parentId,
      isActive
    });

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    next(new ApiError('Server error', 500));
  }
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, parentId, isActive } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return next(new ApiError('Category not found', 404));
    }

    // Kiểm tra tên category đã tồn tại chưa (nếu có thay đổi)
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ where: { name } });
      if (existingCategory) {
        return next(new ApiError('Category name already in use', 400));
      }
    }

    // Kiểm tra parentId có hợp lệ không
    if (parentId && parentId !== category.parentId) {
      if (parentId === id) {
        return next(new ApiError('Category cannot be its own parent', 400));
      }

      const parent = await Category.findByPk(parentId);
      if (!parent) {
        return next(new ApiError('Parent category not found', 404));
      }

      // Kiểm tra vòng lặp cha-con
      let currentParentId = parentId;
      while (currentParentId) {
        if (currentParentId === id) {
          return next(new ApiError('Circular reference in category hierarchy', 400));
        }
        const currentParent = await Category.findByPk(currentParentId, {
          attributes: ['id', 'parentId']
        });
        currentParentId = currentParent ? currentParent.parentId : null;
      }
    }

    // Cập nhật category
    const updatedCategory = await category.update({
      name: name || category.name,
      description: description !== undefined ? description : category.description,
      parentId: parentId !== undefined ? parentId : category.parentId,
      isActive: isActive !== undefined ? isActive : category.isActive
    });

    res.status(200).json({
      success: true,
      data: updatedCategory
    });
  } catch (error) {
    console.error('Error updating category:', error);
    next(new ApiError('Server error', 500));
  }
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'children',
          attributes: ['id']
        }
      ]
    });

    if (!category) {
      return next(new ApiError('Category not found', 404));
    }

    // Kiểm tra xem category có bài viết nào không
    const articleCount = await category.countArticles();
    if (articleCount > 0) {
      return next(
        new ApiError(
          'Cannot delete category with articles. Please move or delete the articles first.',
          400
        )
      );
    }

    // Kiểm tra xem category có category con không
    if (category.children && category.children.length > 0) {
      return next(
        new ApiError(
          'Cannot delete category with subcategories. Please delete or move the subcategories first.',
          400
        )
      );
    }

    await category.destroy();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    next(new ApiError('Server error', 500));
  }
});

