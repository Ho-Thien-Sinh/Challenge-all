import express, { Request, Response, NextFunction } from 'express';
import { scrapeTuoiTreNewsHandler, getNewsCategories } from '@/controllers/scraperController';
import { protect, authorize } from '@/middleware/auth';

const router = express.Router();

// Public routes
router.get('/categories', getNewsCategories);

// Protected routes (require authentication and admin role)
const adminAuth = [
  // Use type assertion to handle the request type
  (req: Request, res: Response, next: NextFunction) => {
    return protect(req as any, res, next);
  },
  (req: Request, res: Response, next: NextFunction) => {
    const authz = authorize('admin');
    return authz(req as any, res, next);
  }
];

router.get(
  '/tuoitre',
  adminAuth,
  (req: Request, res: Response, next: NextFunction) => {
    return scrapeTuoiTreNewsHandler(req, res, next);
  }
);

export default router;
