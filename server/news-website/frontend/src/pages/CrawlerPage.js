import React, { useState, useEffect } from 'react';
import { Card, Container, Row, Col, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCrawlerStatus, runCrawler } from '../services/api';

const CrawlerPage = () => {
  const [crawlerStatus, setCrawlerStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [runningCrawl, setRunningCrawl] = useState(false);
  const [crawlSuccess, setCrawlSuccess] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Lấy thông tin trạng thái crawler
  const fetchCrawlerStatus = async () => {
    try {
      setLoading(true);
      const response = await getCrawlerStatus();
      if (response.success) {
        setCrawlerStatus(response.data);
      } else {
        setError('Không thể lấy thông tin crawler');
      }
    } catch (error) {
      setError('Lỗi kết nối đến server');
      console.error('Error fetching crawler status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Kích hoạt crawl thủ công
  const triggerCrawl = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setRunningCrawl(true);
      setCrawlSuccess(null);
      
      const response = await runCrawler(10);
      
      if (response.success) {
        setCrawlSuccess(response.message);
        // Cập nhật lại trạng thái sau 5 giây
        setTimeout(() => {
          fetchCrawlerStatus();
        }, 5000);
      } else {
        setError('Không thể kích hoạt crawl');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setError('Bạn cần đăng nhập để thực hiện chức năng này');
      } else {
        setError('Lỗi khi kích hoạt crawl');
      }
      console.error('Error triggering crawl:', error);
    } finally {
      setRunningCrawl(false);
    }
  };

  // Lấy thông tin khi component mount
  useEffect(() => {
    fetchCrawlerStatus();
    
    // Cập nhật trạng thái mỗi 30 giây
    const intervalId = setInterval(() => {
      fetchCrawlerStatus();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Format thời gian
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Tính thời gian còn lại đến lần crawl tiếp theo
  const getTimeRemaining = () => {
    if (!crawlerStatus?.nextCrawl) return 'N/A';
    
    const now = new Date();
    const nextCrawl = new Date(crawlerStatus.nextCrawl);
    const diffMs = nextCrawl - now;
    
    if (diffMs <= 0) return 'Sắp diễn ra';
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    
    return `${diffMins} phút ${diffSecs} giây`;
  };

  return (
    <Container className="py-5">
      <h2 className="mb-4">Quản lý Crawler</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {crawlSuccess && <Alert variant="success">{crawlSuccess}</Alert>}
      
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Đang tải thông tin...</p>
        </div>
      ) : (
        <>
          <Row className="mb-4">
            <Col md={4} className="mb-3">
              <Card className="h-100 shadow-sm">
                <Card.Body className="d-flex flex-column">
                  <Card.Title>Tổng số bài viết</Card.Title>
                  <div className="mt-3 text-center flex-grow-1 d-flex align-items-center justify-content-center">
                    <h1 className="display-4">{crawlerStatus?.totalArticles || 0}</h1>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="mb-3">
              <Card className="h-100 shadow-sm">
                <Card.Body className="d-flex flex-column">
                  <Card.Title>Bài viết trong 24h qua</Card.Title>
                  <div className="mt-3 text-center flex-grow-1 d-flex align-items-center justify-content-center">
                    <h1 className="display-4">{crawlerStatus?.articlesLast24h || 0}</h1>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="mb-3">
              <Card className="h-100 shadow-sm">
                <Card.Body className="d-flex flex-column">
                  <Card.Title>Lần crawl tiếp theo</Card.Title>
                  <div className="mt-3 text-center flex-grow-1 d-flex flex-column align-items-center justify-content-center">
                    <h4>{formatDateTime(crawlerStatus?.nextCrawl)}</h4>
                    <Badge bg="info" className="mt-2">Còn lại: {getTimeRemaining()}</Badge>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <Card.Title>Bài viết mới nhất</Card.Title>
              {crawlerStatus?.latestCrawl ? (
                <div className="mt-3">
                  <h5>{crawlerStatus.latestCrawl.title}</h5>
                  <p className="text-muted">
                    <small>
                      Thời gian đăng: {formatDateTime(crawlerStatus.latestCrawl.publishedAt)}
                      <br />
                      Thời gian crawl: {formatDateTime(crawlerStatus.latestCrawl.createdAt)}
                    </small>
                  </p>
                </div>
              ) : (
                <p className="text-muted mt-3">Chưa có bài viết nào</p>
              )}
            </Card.Body>
          </Card>
          
          <div className="text-center">
            <Button 
              variant="primary" 
              size="lg"
              onClick={triggerCrawl}
              disabled={runningCrawl || !isAuthenticated}
            >
              {runningCrawl ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Đang crawl...
                </>
              ) : (
                'Crawl ngay'
              )}
            </Button>
            
            {!isAuthenticated && (
              <p className="text-muted mt-2">
                <small>Bạn cần <a href="/login">đăng nhập</a> để sử dụng chức năng này</small>
              </p>
            )}
          </div>
        </>
      )}
    </Container>
  );
};

export default CrawlerPage;