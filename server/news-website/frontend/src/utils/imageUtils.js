/**
 * Hàm chuyển đổi URL hình ảnh tương đối thành URL đầy đủ
 * @param {string} relativeUrl - URL tương đối của hình ảnh (ví dụ: /static/images/cong-nghe.jpg)
 * @returns {string} URL đầy đủ của hình ảnh
 */
export const getFullImageUrl = (relativeUrl) => {
  // Nếu không có URL, trả về URL dự phòng
  if (!relativeUrl) {
    return 'https://via.placeholder.com/800x450/cccccc/333333?text=No+Image';
  }

  // Nếu URL đã là URL đầy đủ (bắt đầu bằng http:// hoặc https://), trả về nguyên bản
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    return relativeUrl;
  }

  // Lấy URL cơ sở từ biến môi trường hoặc sử dụng localhost nếu không có
  const baseUrl = process.env.REACT_APP_STATIC_URL || 'http://localhost:5000';
  
  // Đảm bảo URL tương đối bắt đầu bằng /
  const normalizedRelativeUrl = relativeUrl.startsWith('/') 
    ? relativeUrl 
    : `/${relativeUrl}`;
  
  // Kết hợp URL cơ sở và URL tương đối
  return `${baseUrl}${normalizedRelativeUrl}`;
};

// Hàm kiểm tra URL hình ảnh có hợp lệ không
export const isValidImageUrl = (url) => {
  if (!url) return false;
  
  // Kiểm tra xem URL có phải là URL hợp lệ không
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

// Hàm lấy URL hình ảnh dự phòng nếu URL chính không hợp lệ
export const getFallbackImageUrl = (category) => {
  // Sử dụng placeholder.com thay vì Unsplash để tránh lỗi timeout
  const fallbackImages = {
    'giao-duc': 'https://via.placeholder.com/800x450/3498db/ffffff?text=Giao+Duc',
    'kinh-doanh': 'https://via.placeholder.com/800x450/2ecc71/ffffff?text=Kinh+Doanh',
    'the-thao': 'https://via.placeholder.com/800x450/e74c3c/ffffff?text=The+Thao',
    'thoi-su': 'https://via.placeholder.com/800x450/3498db/ffffff?text=Thoi+Su',
    'giai-tri': 'https://via.placeholder.com/800x450/f39c12/ffffff?text=Giai+Tri',
    'cong-nghe': 'https://via.placeholder.com/800x450/34495e/ffffff?text=Cong+Nghe',
    'suc-khoe': 'https://via.placeholder.com/800x450/95a5a6/ffffff?text=Suc+Khoe',
    'du-lich': 'https://via.placeholder.com/800x450/1abc9c/ffffff?text=Du+Lich',
    'khoa-hoc': 'https://via.placeholder.com/800x450/9b59b6/ffffff?text=Khoa+Hoc',
    'am-thuc': 'https://via.placeholder.com/800x450/e67e22/ffffff?text=Am+Thuc',
    'thoi-trang': 'https://via.placeholder.com/800x450/f1c40f/ffffff?text=Thoi+Trang'
  };
  
  return fallbackImages[category] || 'https://via.placeholder.com/800x450/cccccc/333333?text=No+Image';
};

// Hàm lấy URL hình ảnh an toàn
export const getSafeImageUrl = (article) => {
  // Nếu không có article hoặc article không có thuộc tính cần thiết
  if (!article || !article.category) {
    return 'https://via.placeholder.com/800x450/cccccc/333333?text=No+Image';
  }
  
  // Kiểm tra URL hình ảnh
  if (isValidImageUrl(article.imageUrl)) {
    // Nếu URL hình ảnh là từ Unsplash, thay thế bằng placeholder để tránh timeout
    if (article.imageUrl.includes('unsplash.com')) {
      return getFallbackImageUrl(article.category);
    }
    return getFullImageUrl(article.imageUrl);
  }
  
  return getFallbackImageUrl(article.category);
};