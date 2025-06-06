import { Request, Response, NextFunction, RequestHandler } from 'express';
import { fetchAndSaveTuoiTreNews } from '@/services/tuoitreScraper';
import asyncHandler from '@/middleware/asyncHandler';

/**
 * @desc    Lấy và lưu tin tức từ Tuổi Trẻ
 * @route   GET /api/v1/scrape/tuoitre
 * @access  Private/Admin
 */
const scrapeTuoiTreNews: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category = 'thoi-su' } = req.query;
    
    const result = await fetchAndSaveTuoiTreNews(category as string);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
        count: result.articles?.length || 0,
        articles: result.articles || []
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message || 'An error occurred while scraping news',
        error: result.error
      });
    }
  } catch (error) {
    next(error);
  }
};

// Export the handler wrapped with asyncHandler
export const scrapeTuoiTreNewsHandler = asyncHandler(scrapeTuoiTreNews);

/**
 * @desc    Lấy danh sách các chuyên mục tin tức
 * @route   GET /api/v1/scrape/categories
 * @access  Public
 */
export const getNewsCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = [
    { id: 'thoi-su', name: 'Thời sự' },
    { id: 'the-gioi', name: 'Thế giới' },
    { id: 'kinh-doanh', name: 'Kinh doanh' },
    { id: 'the-thao', name: 'Thể thao' },
    { id: 'giai-tri', name: 'Giải trí' },
    { id: 'giao-duc', name: 'Giáo dục' },
    { id: 'khoa-hoc', name: 'Khoa học' },
    { id: 'suc-khoe', name: 'Sức khỏe' },
    { id: 'doi-song', name: 'Đời sống' },
    { id: 'du-lich', name: 'Du lịch' },
  ];

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories
  });
});

export default {
  scrapeTuoiTreNews,
  getNewsCategories
};
