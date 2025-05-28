import React, { useState } from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getFullImageUrl } from '../utils/imageUtils';

// Hàm chuyển đổi slug danh mục thành tên hiển thị
const getCategoryName = (categorySlug) => {
  const categories = {
    'giao-duc': 'Giáo dục',
    'kinh-doanh': 'Kinh doanh',
    'the-thao': 'Thể thao',
    'thoi-su': 'Thời sự',
    'giai-tri': 'Giải trí',
    'cong-nghe': 'Công nghệ',
    'suc-khoe': 'Sức khỏe',
    'du-lich': 'Du lịch',
    'khoa-hoc': 'Khoa học',
    'am-thuc': 'Ẩm thực',
    'thoi-trang': 'Thời trang',
    'van-hoa': 'Văn hóa',
    'the-gioi': 'Thế giới',
    'phap-luat': 'Pháp luật',
    'xe': 'Xe'
  };
  
  return categories[categorySlug] || categorySlug;
};

// Hàm lấy màu cho danh mục
const getCategoryColor = (categorySlug) => {
  const categoryColors = {
    'giao-duc': '3498db',
    'kinh-doanh': '2ecc71',
    'the-thao': 'e74c3c',
    'thoi-su': '3498db',
    'giai-tri': 'f39c12',
    'cong-nghe': '34495e',
    'suc-khoe': '95a5a6',
    'du-lich': '1abc9c',
    'khoa-hoc': '9b59b6',
    'am-thuc': 'e67e22',
    'thoi-trang': 'f1c40f',
    'van-hoa': '8e44ad',
    'the-gioi': '2980b9',
    'phap-luat': 'c0392b',
    'xe': '7f8c8d'
  };
  
  return categoryColors[categorySlug] || 'cccccc';
};

const ArticleCard = ({ article, featured = false, small = false }) => {
  const [imgError, setImgError] = useState(false);
  
  // Tạo URL hình ảnh dự phòng dựa trên danh mục
  const getFallbackImage = () => {
    const color = getCategoryColor(article.category);
    const categoryText = article.category ? article.category.replace(/-/g, '+') : 'Unknown';
    return `https://via.placeholder.com/800x450/${color}/ffffff?text=${categoryText}`;
  };

  // Định dạng ngày tháng
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Hiển thị dạng bài viết nhỏ (small)
  if (small) {
    return (
      <div className="tuoitre-small-article mb-3">
        <Link to={`/article/${article.id}`}>
          <img 
            src={imgError ? getFallbackImage() : getFullImageUrl(article.imageUrl) || getFallbackImage()}
            alt={article.title}
            onError={() => setImgError(true)}
          />
        </Link>
        <div>
          <h4>
            <Link to={`/article/${article.id}`} className="text-decoration-none text-dark">
              {article.title}
            </Link>
          </h4>
          <div className="d-flex align-items-center mt-1">
            <small className="text-muted me-2">
              {formatDate(article.publishedAt)}
            </small>
            <span className="comment-count">
              <i className="bi bi-chat-dots"></i> 0
            </span>
          </div>
        </div>
      </div>
    );
  }
  
  // Hiển thị dạng bài viết nổi bật (featured)
  if (featured) {
    return (
      <div className="tuoitre-featured mb-4">
        <Link to={`/article/${article.id}`}>
          <img 
            src={imgError ? getFallbackImage() : getFullImageUrl(article.imageUrl) || getFallbackImage()}
            alt={article.title}
            className="w-100"
            style={{ height: '400px', objectFit: 'cover' }}
            onError={() => setImgError(true)}
          />
          <div className="overlay">
            <h2>{article.title}</h2>
            <p className="d-none d-md-block">{article.summary}</p>
            <div className="d-flex align-items-center mt-2">
              <span className="tuoitre-category-badge me-2">
                {getCategoryName(article.category)}
              </span>
              <small className="text-white me-2">
                {formatDate(article.publishedAt)}
              </small>
              <span className="comment-count text-white">
                <i className="bi bi-chat-dots"></i> 0
              </span>
            </div>
          </div>
        </Link>
      </div>
    );
  }
  
  // Hiển thị dạng bài viết thông thường
  return (
    <div className="tuoitre-article-card">
      <Link to={`/article/${article.id}`}>
        <img 
          src={imgError ? getFallbackImage() : getFullImageUrl(article.imageUrl) || getFallbackImage()}
          alt={article.title}
          className="w-100 mb-2"
          style={{ height: '180px', objectFit: 'cover' }}
          onError={() => setImgError(true)}
        />
      </Link>
      <h3 className="mb-1">
        <Link to={`/article/${article.id}`} className="text-decoration-none text-dark">
          {article.title}
        </Link>
      </h3>
      <div className="d-flex align-items-center mb-2">
        <Link to={`/category/${article.category}`} className="tuoitre-category-badge me-2">
          {getCategoryName(article.category)}
        </Link>
        <small className="text-muted me-2">
          {formatDate(article.publishedAt)}
        </small>
        <span className="comment-count">
          <i className="bi bi-chat-dots"></i> 0
        </span>
      </div>
      {article.summary && (
        <p className="small text-muted mb-0">
          {article.summary.length > 120 ? `${article.summary.substring(0, 120)}...` : article.summary}
        </p>
      )}
    </div>
  );
};

export default ArticleCard;