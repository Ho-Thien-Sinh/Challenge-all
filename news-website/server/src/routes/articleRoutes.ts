import express from 'express';
import {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  getArticlesByCategory,
  getArticlesByAuthor,
  searchArticles
} from '../controllers/articleController';
// Tạm thời bỏ middleware xác thực để kiểm tra
// import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Public routes
router.route('/')
  .get(getArticles)  // GET /api/v1/articles
  .post(createArticle);  // POST /api/v1/articles

router.route('/search').get(searchArticles);  // GET /api/v1/articles/search
router.route('/category/:categoryId').get(getArticlesByCategory);  // GET /api/v1/articles/category/:categoryId
router.route('/author/:authorId').get(getArticlesByAuthor);  // GET /api/v1/articles/author/:authorId
router.route('/tuoitre/search').get(searchArticles);  // GET /api/v1/articles/tuoitre/search

// Routes for specific article
router.route('/:id')
  .get(getArticle)  // GET /api/v1/articles/:id
  .put(updateArticle)  // PUT /api/v1/articles/:id
  .delete(deleteArticle);  // DELETE /api/v1/articles/:id

export default router;
