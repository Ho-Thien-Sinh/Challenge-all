import axios from 'axios';
import { getApiBaseUrl } from './api';
import { getLatestNews, getPopularNews } from './api';

// Danh sách các danh mục hợp lệ
const VALID_CATEGORIES = [
  'thoi-su', 'the-gioi', 'kinh-doanh', 'giai-tri', 
  'the-thao', 'phap-luat', 'giao-duc', 'suc-khoe'
];

// Tạo dữ liệu mẫu cho danh mục
const generateMockCategoryNews = (category, limit) => {
  const categoryNames = {
    'thoi-su': 'Thời sự',
    'the-gioi': 'Thế giới',
    'kinh-doanh': 'Kinh doanh',
    'giai-tri': 'Giải trí',
    'the-thao': 'Thể thao',
    'phap-luat': 'Pháp luật',
    'giao-duc': 'Giáo dục',
    'suc-khoe': 'Sức khỏe'
  };

  const displayName = categoryNames[category] || 'Tin tức';
  
  return Array.from({ length: limit }, (_, i) => ({
    id: `${category}-${i + 1}`,
    title: `Tin ${displayName} mẫu ${i + 1}`,
    excerpt: `Đây là mô tả ngắn cho tin ${displayName.toLowerCase()} mẫu ${i + 1}`,
    imageUrl: `https://picsum.photos/600/400?${category}-${i}`,
    url: `/tin-tuc/${category}-${i + 1}`,
    publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    category: displayName,
    views: Math.floor(Math.random() * 1000)
  }));
};

export const getNews = async (limit = 10, categorySlug) => {
  try {
    if (categorySlug && VALID_CATEGORIES.includes(categorySlug)) {
      // Trả về tin tức theo danh mục
      return generateMockCategoryNews(categorySlug, limit);
    } else if (!categorySlug) {
      // Trả về tin tức mới nhất nếu không có danh mục
      return await getLatestNews(limit);
    }
    return [];
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
};

export const getLogoUrl = () => {
  return 'https://static.tuoitre.vn/tto/i/svg/logo-tttm.svg';
};
