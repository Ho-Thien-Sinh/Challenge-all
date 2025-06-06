const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getCategories);
router.get('/:slug', getCategory);

// Protected routes (require authentication and authorization)
router.use(protect);
router.use(authorize('admin', 'editor'));

// Admin/Editor routes
router.post('/', createCategory);
router.route('/:id')
  .put(updateCategory)
  .delete(deleteCategory);

module.exports = router;
