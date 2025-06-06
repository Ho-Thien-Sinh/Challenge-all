import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Image, 
  Space, 
  Tag, 
  Row, 
  Col, 
  Button, 
  Empty, 
  Alert,
  List,
  Skeleton,
  Spin
} from 'antd';
import { 
  ClockCircleOutlined, 
  FireOutlined, 
  ReloadOutlined
} from '@ant-design/icons';
import tuoitreService from '../services/tuoitreService';
import '../styles/news.css';

const { Title, Paragraph } = Typography;

interface Article {
  id?: string;
  title: string;
  url: string;
  description: string;
  publishedAt: string;
  imageUrl: string;
}

// NewsResponse interface is not used in this file

const HomePage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [refreshTime, setRefreshTime] = useState<Date>(new Date());
  const [error, setError] = useState<{
    message: string;
    code?: string;
  } | null>(null);
  const [stats, setStats] = useState<{
    totalArticles: number;
    articlesWithoutImage: number;
    articlesWithoutDescription: number;
    articlesWithoutBoth: number;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadNews = async (isRefreshing = false) => {
    try {
      setError(null);
      
      if (!isRefreshing) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      
      const response = await tuoitreService.fetchTuoitreNews({
        limit: 20
      });
      
      // Xử lý bài viết
      const processedArticles = (response?.articles || []).map(article => ({
        id: article.id || article.url?.split('/').pop() || Math.random().toString(),
        title: article.title || 'Không có tiêu đề',
        url: article.url || '#',
        description: article.description || 'Không có mô tả',
        publishedAt: article.publishedAt || new Date().toISOString(),
        imageUrl: article.imageUrl || '/placeholder-image.jpg',
        category: article.category || 'other',
      }));
      
      // Lấy 5 bài viết đầu tiên làm tin nổi bật
      const featured = [...processedArticles].slice(0, 5);
      
      // Các bài viết còn lại
      const regularArticles = processedArticles.slice(5);
      
      setFeaturedArticles(featured as Article[]);
      setArticles(regularArticles as Article[]);
      setStats(response?.stats || null);
      setRefreshTime(new Date());
      
      if (response.error) {
        // Handle both string and object error types
        const errorMessage = typeof response.error === 'string' 
          ? response.error 
          : response.error.message || 'Có lỗi xảy ra khi tải dữ liệu';
        
        const errorCode = typeof response.error === 'object' && response.error.code 
          ? response.error.code 
          : 'UNKNOWN_ERROR';
          
        setError({
          message: errorMessage,
          code: errorCode
        });
      }
    } catch (error) {
      console.error('Lỗi khi tải tin tức:', error);
      setError({
        message: 'Không thể tải tin tức. Vui lòng kiểm tra kết nối mạng và thử lại.',
        code: 'LOAD_ERROR'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNews();
    
    // Tự động làm mới tin tức mỗi 5 phút
    const intervalId = setInterval(loadNews, 5 * 60 * 1000);
    
    // Dọn dẹp interval khi component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleRefresh = () => {
    loadNews();
  };

  // Hiển thị loading khi tải lần đầu
  if (loading && !refreshing && articles.length === 0) {
    return (
      <div className="news-container" style={{ padding: '20px' }}>
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }
  
  // Hiển thị thông báo lỗi nếu có
  if (error) {
    return (
      <div className="news-container" style={{ padding: '20px' }}>
        <Alert
          message="Có lỗi xảy ra"
          description={
            <div>
              <p>{error.message}</p>
              <Button 
                type="primary" 
                icon={<ReloadOutlined />} 
                onClick={() => loadNews()}
                loading={refreshing}
              >
                Thử lại
              </Button>
            </div>
          }
          type="error"
          showIcon
          style={{ marginBottom: '20px' }}
        />
      </div>
    );
  }
  
  // Hiển thị thông báo khi không có bài viết
  if (!loading && articles.length === 0 && featuredArticles.length === 0) {
    return (
      <div className="news-container" style={{ padding: '20px', textAlign: 'center' }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span>
              Không tìm thấy bài viết nào
            </span>
          }
        >
          <Button 
            type="primary" 
            onClick={() => loadNews()}
            loading={refreshing}
            icon={<ReloadOutlined />}
          >
            Tải lại
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div className="news-container">
      <div className="refresh-info" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px',
        padding: '8px 16px',
        backgroundColor: '#f0f2f5',
        borderRadius: '4px'
      }}>
        <div>
          <ClockCircleOutlined style={{ marginRight: '8px' }} />
          <span>Cập nhật lần cuối: {refreshTime.toLocaleTimeString()}</span>
        </div>
        <Button 
          type="text" 
          icon={<ReloadOutlined spin={refreshing} />} 
          onClick={handleRefresh}
          loading={refreshing}
          disabled={refreshing}
        >
          {refreshing ? 'Đang tải...' : 'Làm mới'}
        </Button>
      </div>
      
      {refreshing && (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <Spin tip="Đang tải dữ liệu mới..." />
        </div>
      )}
      
      <div className="news-header">
        <Title level={2} style={{ color: '#e31837' }}>Tin tức mới nhất từ Tuổi Trẻ Online</Title>
      </div>

      {/* Tin nổi bật */}
      {featuredArticles.length > 0 && (
        <div className="featured-news" style={{ margin: '24px 0' }}>
          <Title level={3} style={{ 
            display: 'flex', 
            alignItems: 'center',
            color: '#e31837',
            borderBottom: '2px solid #e31837',
            paddingBottom: '8px',
            marginBottom: '16px'
          }}>
            <FireOutlined style={{ marginRight: '8px' }} />
            Tin nổi bật
          </Title>
          
          <Row gutter={[24, 24]}>
            {/* Bài viết chính */}
            {featuredArticles[0] && (
              <Col xs={24} lg={24} style={{ marginBottom: '16px' }}>
                <Card
                  hoverable
                  onClick={() => window.open(featuredArticles[0].url, '_blank')}
                  cover={
                    <div style={{ height: '400px', overflow: 'hidden' }}>
                      <Image
                        src={featuredArticles[0].imageUrl}
                        alt={featuredArticles[0].title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        preview={false}
                      />
                    </div>
                  }
                >
                  <Tag color="red" style={{ marginBottom: '12px' }}>NỔI BẬT</Tag>
                  <Title level={3} style={{ marginBottom: '12px' }}>{featuredArticles[0].title}</Title>
                  <Paragraph style={{ color: '#444', fontSize: '16px' }}>
                    {featuredArticles[0].description}
                  </Paragraph>
                  <div style={{ color: '#666', marginTop: '12px' }}>
                    {new Date(featuredArticles[0].publishedAt).toLocaleString('vi-VN')}
                  </div>
                </Card>
              </Col>
            )}
            
            {/* 4 bài viết phụ */}
            <Row gutter={[16, 16]} style={{ width: '100%', margin: 0 }}>
              {featuredArticles.slice(1).map((article: Article, index: number) => {
                // Create a more unique key by combining article.id, url, and index
                const uniqueKey = `${article.id || ''}-${article.url || ''}-${index}`.replace(/[^a-zA-Z0-9-]/g, '');
                return (
                <Col key={uniqueKey} xs={24} sm={12} md={12} lg={6}>
                  <Card
                    hoverable
                    onClick={() => window.open(article.url, '_blank')}
                    cover={
                      <div style={{ height: '180px', overflow: 'hidden' }}>
                        <Image
                          src={article.imageUrl}
                          alt={article.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          preview={false}
                        />
                      </div>
                    }
                  >
                    <Title level={5} style={{ marginBottom: '8px' }}>{article.title}</Title>
                    <div style={{ color: '#666', fontSize: '14px' }}>
                      {new Date(article.publishedAt).toLocaleString('vi-VN')}
                    </div>
                  </Card>
                </Col>
                );
              })}
            </Row>
          </Row>
        </div>
      )}
      
      <Title level={3} style={{ marginTop: '32px', marginBottom: '16px', color: '#222' }}>
        Tin mới nhất
      </Title>

      {loading ? (
        <Skeleton active paragraph={{ rows: 10 }} />
      ) : (
        <>
          {stats && (
            <div className="news-stats">
              <Space size="large">
                <div>
                  <div className="stat-value">{stats.totalArticles}</div>
                  <div className="stat-label">Tổng số bài viết</div>
                </div>
                <div>
                  <div className="stat-value">{stats.articlesWithoutImage}</div>
                  <div className="stat-label">Bài thiếu ảnh</div>
                </div>
                <div>
                  <div className="stat-value">{stats.articlesWithoutDescription}</div>
                  <div className="stat-label">Bài thiếu mô tả</div>
                </div>
                <div>
                  <div className="stat-value">{stats.articlesWithoutBoth}</div>
                  <div className="stat-label">Bài thiếu cả hai</div>
                </div>
              </Space>
            </div>
          )}

          <List
            itemLayout="vertical"
            size="large"
            dataSource={articles}
            renderItem={(article: Article) => (
              <List.Item
                key={`${article.id}-${article.url}`}
                className="news-item"
                onClick={() => window.open(article.url, '_blank')}
              >
                <div className="news-item-content">
                  <div className="news-image">
                    <Image
                      src={article.imageUrl}
                      alt={article.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      preview={false}
                    />
                  </div>
                  <div className="news-details">
                    <Title level={4} className="news-title">{article.title}</Title>
                    <Paragraph className="news-description" ellipsis={{ rows: 2 }}>
                      {article.description}
                    </Paragraph>
                    <div className="news-meta">
                      <span className="news-time">
                        {new Date(article.publishedAt).toLocaleString('vi-VN')}
                      </span>
                      <Tag color="red" className="news-tag">Mới nhất</Tag>
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
          />
        </>
      )}

      <div className="refresh-button">
        <button onClick={handleRefresh} disabled={loading}>
          {loading ? 'Đang tải...' : 'Tải lại tin tức'}
        </button>
      </div>
    </div>
  );
};

export default HomePage;
