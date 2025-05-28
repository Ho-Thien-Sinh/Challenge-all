import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Badge, Alert, Spinner, Button } from 'react-bootstrap';
import { getArticleById, getArticles } from '../services/api';
import { getFullImageUrl } from '../utils/imageUtils';
import ArticleCard from '../components/ArticleCard';

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

// Hàm chuyển đổi slug danh mục thành màu badge
const getCategoryColor = (categorySlug) => {
  const categoryColors = {
    'giao-duc': 'info',
    'kinh-doanh': 'success',
    'the-thao': 'danger',
    'thoi-su': 'primary',
    'giai-tri': 'warning',
    'cong-nghe': 'dark',
    'suc-khoe': 'secondary',
    'du-lich': 'light',
    'khoa-hoc': 'info',
    'am-thuc': 'success',
    'thoi-trang': 'warning',
    'van-hoa': 'info',
    'the-gioi': 'primary',
    'phap-luat': 'danger',
    'xe': 'secondary'
  };
  
  return categoryColors[categorySlug] || 'primary';
};

const ArticleDetailPage = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await getArticleById(id);
        setArticle(response.data);
        setError(null);
        
        // Fetch related articles
        try {
          const articlesResponse = await getArticles(1);
          // Filter out current article and get 5 random articles
          const filtered = articlesResponse.data
            .filter(a => a.id !== parseInt(id))
            .sort(() => 0.5 - Math.random())
            .slice(0, 5);
          setRelatedArticles(filtered);
        } catch (err) {
          console.error('Error fetching related articles:', err);
        }
      } catch (err) {
        setError('Không thể tải bài viết. Bài viết có thể không tồn tại hoặc đã bị xóa.');
        console.error(`Error fetching article ${id}:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
    // Scroll to top when article changes
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <Container>
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="danger">
          {error}
          <div className="mt-3">
            <Link to="/" className="btn btn-primary">
              Quay lại trang chủ
            </Link>
          </div>
        </Alert>
      </Container>
    );
  }

  if (!article) {
    return (
      <Container>
        <Alert variant="warning">
          Không tìm thấy bài viết.
          <div className="mt-3">
            <Link to="/" className="btn btn-primary">
              Quay lại trang chủ
            </Link>
          </div>
        </Alert>
      </Container>
    );
  }

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container>
      <Row className="mt-3 mb-4">
        <Col>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/">Trang chủ</Link>
              </li>
              <li className="breadcrumb-item">
                <Link to={`/category/${article.category}`}>{getCategoryName(article.category)}</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {article.title.length > 30 ? article.title.substring(0, 30) + '...' : article.title}
              </li>
            </ol>
          </nav>
        </Col>
      </Row>
      
      <Row>
        <Col lg={8}>
          <div className="article-detail">
            <h1 className="mb-3">{article.title}</h1>
            
            {article.summary && (
              <div className="lead mb-4 text-muted">
                <strong>{article.summary}</strong>
              </div>
            )}
            
            <div className="article-meta d-flex justify-content-between align-items-center mb-4">
              <div>
                {article.author && (
                  <span className="me-3">
                    <i className="bi bi-person-circle me-1"></i>
                    {article.author}
                  </span>
                )}
                <span>
                  <i className="bi bi-clock me-1"></i>
                  {formatDate(article.publishedAt)}
                </span>
              </div>
              <Link to={`/category/${article.category}`} className="text-decoration-none">
                <Badge bg={getCategoryColor(article.category)}>
                  {getCategoryName(article.category)}
                </Badge>
              </Link>
            </div>
            
            {/* Main image */}
            {article.imageUrl && (
              <figure className="figure mb-4">
                <img 
                  src={getFullImageUrl(article.imageUrl)}
                  alt={article.title}
                  className="figure-img img-fluid rounded article-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    const color = article.category ? getCategoryColor(article.category) : 'cccccc';
                    const categoryText = article.category ? article.category.replace(/-/g, '+') : 'Unknown';
                    e.target.src = `https://via.placeholder.com/800x450/${color}/ffffff?text=${categoryText}`;
                  }}
                />
                <figcaption className="figure-caption text-center">
                  {article.title}
                </figcaption>
              </figure>
            )}
            
            {/* Article content */}
            <div className="article-content">
              {article.content.split('\n').map((paragraph, index) => (
                paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />
              ))}
            </div>
            
            {/* Article images gallery */}
            {article.images && article.images.length > 1 && (
              <div className="mt-5">
                <h4 className="tuoitre-section-title">HÌNH ẢNH TRONG BÀI VIẾT</h4>
                <div className="row g-3">
                  {article.images.map((imageUrl, index) => (
                    <div className="col-md-4 col-sm-6" key={index}>
                      <figure className="figure">
                        <img 
                          src={getFullImageUrl(imageUrl)} 
                          alt={`Hình ảnh ${index + 1}`}
                          className="figure-img img-fluid rounded shadow-sm"
                          style={{ objectFit: 'cover', height: '200px', width: '100%' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://via.placeholder.com/400x300/cccccc/ffffff?text=Hình+ảnh+${index + 1}`;
                          }}
                        />
                        <figcaption className="figure-caption text-center">
                          Hình {index + 1}
                        </figcaption>
                      </figure>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Source link */}
            {article.sourceUrl && (
              <div className="mt-4 text-end">
                <Button 
                  variant="link" 
                  href={article.sourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-decoration-none"
                >
                  <i className="bi bi-link-45deg me-1"></i>
                  Xem bài viết gốc
                </Button>
              </div>
            )}
            
            {/* Share buttons */}
            <div className="d-flex justify-content-end mt-4">
              <Button variant="outline-primary" size="sm" className="me-2">
                <i className="bi bi-facebook me-1"></i> Chia sẻ
              </Button>
              <Button variant="outline-info" size="sm">
                <i className="bi bi-twitter me-1"></i> Tweet
              </Button>
            </div>
            
            {/* Related articles */}
            {relatedArticles.length > 0 && (
              <div className="mt-5">
                <h4 className="tuoitre-section-title">BÀI VIẾT LIÊN QUAN</h4>
                <Row>
                  {relatedArticles.slice(0, 3).map(article => (
                    <Col md={4} key={article.id} className="mb-4">
                      <ArticleCard article={article} />
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </div>
        </Col>
        
        {/* Sidebar */}
        <Col lg={4}>
          <div className="sidebar">
            <h3 className="tuoitre-section-title">TIN MỚI NHẤT</h3>
            {relatedArticles.map(article => (
              <ArticleCard key={article.id} article={article} small={true} />
            ))}
          </div>
          
          {/* Categories */}
          <div className="sidebar mt-4">
            <h3 className="tuoitre-section-title">DANH MỤC</h3>
            <div className="d-flex flex-wrap">
              <Link to="/category/thoi-su" className="btn btn-sm btn-outline-secondary m-1">Thời sự</Link>
              <Link to="/category/the-gioi" className="btn btn-sm btn-outline-secondary m-1">Thế giới</Link>
              <Link to="/category/phap-luat" className="btn btn-sm btn-outline-secondary m-1">Pháp luật</Link>
              <Link to="/category/kinh-doanh" className="btn btn-sm btn-outline-secondary m-1">Kinh doanh</Link>
              <Link to="/category/cong-nghe" className="btn btn-sm btn-outline-secondary m-1">Công nghệ</Link>
              <Link to="/category/xe" className="btn btn-sm btn-outline-secondary m-1">Xe</Link>
              <Link to="/category/du-lich" className="btn btn-sm btn-outline-secondary m-1">Du lịch</Link>
              <Link to="/category/van-hoa" className="btn btn-sm btn-outline-secondary m-1">Văn hóa</Link>
              <Link to="/category/giai-tri" className="btn btn-sm btn-outline-secondary m-1">Giải trí</Link>
              <Link to="/category/the-thao" className="btn btn-sm btn-outline-secondary m-1">Thể thao</Link>
              <Link to="/category/giao-duc" className="btn btn-sm btn-outline-secondary m-1">Giáo dục</Link>
              <Link to="/category/suc-khoe" className="btn btn-sm btn-outline-secondary m-1">Sức khỏe</Link>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ArticleDetailPage;