import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Alert, Spinner, Breadcrumb } from 'react-bootstrap';
import ArticleCard from '../components/ArticleCard';
import Pagination from '../components/Pagination';
import { getArticles } from '../services/api';

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

const CategoryPage = () => {
  const { category } = useParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });

  const fetchArticles = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getArticles(page, 12, category);
      setArticles(response.data);
      setPagination(response.pagination);
      setError(null);
    } catch (err) {
      setError('Không thể tải bài viết. Vui lòng thử lại sau.');
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
    window.scrollTo(0, 0);
  }, [category]);

  const handlePageChange = (page) => {
    fetchArticles(page);
    window.scrollTo(0, 0);
  };

  if (loading && articles.length === 0) {
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
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  // Phân chia bài viết
  const featuredArticle = articles.length > 0 ? articles[0] : null;
  const mainArticles = articles.slice(1);

  return (
    <Container>
      <Row className="mt-3 mb-4">
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>Trang chủ</Breadcrumb.Item>
            <Breadcrumb.Item active>{getCategoryName(category)}</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>
      
      <h2 className="tuoitre-section-title mb-4">{getCategoryName(category).toUpperCase()}</h2>
      
      {articles.length === 0 ? (
        <Alert variant="info">Không có bài viết nào trong danh mục này.</Alert>
      ) : (
        <Row>
          <Col lg={8}>
            {/* Featured Article */}
            {featuredArticle && (
              <ArticleCard article={featuredArticle} featured={true} />
            )}
            
            {/* Main Articles */}
            <Row className="mt-4">
              {mainArticles.map(article => (
                <Col md={6} key={article.id} className="mb-4">
                  <ArticleCard article={article} />
                </Col>
              ))}
            </Row>
            
            {/* Pagination */}
            <div className="my-4">
              <Pagination 
                currentPage={pagination.page} 
                totalPages={pagination.totalPages} 
                onPageChange={handlePageChange} 
              />
            </div>
          </Col>
          
          {/* Sidebar */}
          <Col lg={4}>
            <div className="sidebar">
              <h3 className="tuoitre-section-title">DANH MỤC KHÁC</h3>
              <div className="d-flex flex-wrap">
                <Link to="/category/thoi-su" className={`btn btn-sm ${category === 'thoi-su' ? 'btn-primary' : 'btn-outline-secondary'} m-1`}>Thời sự</Link>
                <Link to="/category/the-gioi" className={`btn btn-sm ${category === 'the-gioi' ? 'btn-primary' : 'btn-outline-secondary'} m-1`}>Thế giới</Link>
                <Link to="/category/phap-luat" className={`btn btn-sm ${category === 'phap-luat' ? 'btn-primary' : 'btn-outline-secondary'} m-1`}>Pháp luật</Link>
                <Link to="/category/kinh-doanh" className={`btn btn-sm ${category === 'kinh-doanh' ? 'btn-primary' : 'btn-outline-secondary'} m-1`}>Kinh doanh</Link>
                <Link to="/category/cong-nghe" className={`btn btn-sm ${category === 'cong-nghe' ? 'btn-primary' : 'btn-outline-secondary'} m-1`}>Công nghệ</Link>
                <Link to="/category/xe" className={`btn btn-sm ${category === 'xe' ? 'btn-primary' : 'btn-outline-secondary'} m-1`}>Xe</Link>
                <Link to="/category/du-lich" className={`btn btn-sm ${category === 'du-lich' ? 'btn-primary' : 'btn-outline-secondary'} m-1`}>Du lịch</Link>
                <Link to="/category/van-hoa" className={`btn btn-sm ${category === 'van-hoa' ? 'btn-primary' : 'btn-outline-secondary'} m-1`}>Văn hóa</Link>
                <Link to="/category/giai-tri" className={`btn btn-sm ${category === 'giai-tri' ? 'btn-primary' : 'btn-outline-secondary'} m-1`}>Giải trí</Link>
                <Link to="/category/the-thao" className={`btn btn-sm ${category === 'the-thao' ? 'btn-primary' : 'btn-outline-secondary'} m-1`}>Thể thao</Link>
                <Link to="/category/giao-duc" className={`btn btn-sm ${category === 'giao-duc' ? 'btn-primary' : 'btn-outline-secondary'} m-1`}>Giáo dục</Link>
                <Link to="/category/suc-khoe" className={`btn btn-sm ${category === 'suc-khoe' ? 'btn-primary' : 'btn-outline-secondary'} m-1`}>Sức khỏe</Link>
              </div>
            </div>
            
            <div className="sidebar mt-4">
              <h3 className="tuoitre-section-title">THỐNG KÊ</h3>
              <div className="p-3">
                <p><strong>Tổng số bài viết:</strong> {pagination.total}</p>
                <p><strong>Số trang:</strong> {pagination.totalPages}</p>
                <p><strong>Trang hiện tại:</strong> {pagination.page}</p>
                <p><strong>Danh mục:</strong> {getCategoryName(category)}</p>
              </div>
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default CategoryPage;