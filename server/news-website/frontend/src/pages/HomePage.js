import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import ArticleCard from '../components/ArticleCard';
import Pagination from '../components/Pagination';
import { getArticles } from '../services/api';
import { Link } from 'react-router-dom';

const HomePage = () => {
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
      const response = await getArticles(page);
      setArticles(response.data);
      setPagination(response.pagination);
      setError(null);
    } catch (err) {
      setError('Failed to load articles. Please try again later.');
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handlePageChange = (page) => {
    fetchArticles(page);
    window.scrollTo(0, 0);
  };

  if (loading && articles.length === 0) {
    return (
      <Container>
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
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

  if (articles.length === 0) {
    return (
      <Container>
        <Alert variant="info">No articles found.</Alert>
      </Container>
    );
  }

  // Phân chia bài viết cho các phần khác nhau
  const featuredArticle = articles[0];
  const mainArticles = articles.slice(1, 4);
  const secondaryArticles = articles.slice(4, 7);
  const smallArticles = articles.slice(7);

  return (
    <>
      <Container>
        {/* Featured Article */}
        {featuredArticle && (
          <ArticleCard article={featuredArticle} featured={true} />
        )}

        {/* Main Content */}
        <Row>
          {/* Main Articles Column */}
          <Col lg={8}>
            <h3 className="tuoitre-section-title">TIN MỚI NHẤT</h3>
            <Row>
              {mainArticles.map(article => (
                <Col md={6} key={article.id} className="mb-4">
                  <ArticleCard article={article} />
                </Col>
              ))}
            </Row>

            {/* Secondary Articles */}
            <Row className="mt-4">
              {secondaryArticles.map(article => (
                <Col md={4} key={article.id} className="mb-4">
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
              <h3 className="tuoitre-section-title">TIN ĐỌC NHIỀU</h3>
              {smallArticles.map(article => (
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
    </>
  );
};

export default HomePage;