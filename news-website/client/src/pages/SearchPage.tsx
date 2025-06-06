import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { List, Typography, Card, Image, Tag, Skeleton, Empty, Input, Button, Space, message } from 'antd';
import { SearchOutlined, ClockCircleOutlined } from '@ant-design/icons';
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
  category?: string;
}

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(query);
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [totalResults, setTotalResults] = useState(0);

  // Hàm tìm kiếm bài viết
  const searchArticles = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setArticles([]);
      setTotalResults(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Gọi API tìm kiếm
      const response = await tuoitreService.searchArticles(searchTerm);
      
      if (response.data && response.data.length > 0) {
        // Nếu có dữ liệu trả về
        const articles = response.data.map(article => ({
          id: article.id || '',
          title: article.title || 'Không có tiêu đề',
          url: article.url || '#',
          description: article.description || 'Không có mô tả',
          publishedAt: article.publishedAt || new Date().toISOString(),
          imageUrl: article.imageUrl || '/placeholder-image.jpg',
          category: article.category || 'other',
        }));
        
        setArticles(articles);
        setTotalResults(response.pagination?.total || articles.length);
      } else {
        // Nếu không tìm thấy kết quả
        message.info(`Không tìm thấy kết quả nào phù hợp với "${searchTerm}"`);
        setArticles([]);
        setTotalResults(0);
      }
    } catch (error) {
      console.error('Lỗi khi tìm kiếm bài viết:', error);
      message.error('Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại sau.');
      setArticles([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi người dùng nhấn nút tìm kiếm
  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  // Xử lý khi người dùng nhấn phím Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      handleSearch();
    }
  };

  // Tìm kiếm khi query thay đổi
  useEffect(() => {
    setSearchQuery(query);
    searchArticles(query);
  }, [query]);

  return (
    <div className="search-page">
      <div className="search-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '20px' }}>
            Kết quả tìm kiếm cho: "{query}"
          </Title>
          
          <div style={{ display: 'flex', marginBottom: '20px' }}>
            <Input
              placeholder="Nhập từ khóa tìm kiếm..."
              size="large"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ flex: 1, marginRight: '10px' }}
            />
            <Button 
              type="primary" 
              icon={<SearchOutlined />} 
              size="large"
              onClick={handleSearch}
            >
              Tìm kiếm
            </Button>
          </div>
          
          <div style={{ color: '#666', textAlign: 'center' }}>
            Tìm thấy {totalResults} kết quả
          </div>
        </div>

        {loading ? (
          <div>
            {[...Array(5)].map((_, i) => (
              <Card key={i} style={{ marginBottom: '20px' }}>
                <Skeleton active />
              </Card>
            ))}
          </div>
        ) : articles.length > 0 ? (
          <List
            itemLayout="vertical"
            size="large"
            dataSource={articles}
            renderItem={(article) => (
              <List.Item
                key={article.id}
                className="news-item"
                style={{ padding: '20px 0', borderBottom: '1px solid #f0f0f0' }}
              >
                <div className="news-item-content">
                  <div className="news-details">
                    {article.category && (
                      <Tag color="red" style={{ marginBottom: '8px' }}>
                        {article.category.toUpperCase()}
                      </Tag>
                    )}
                    <Title level={4} className="news-title">
                      <Link to={article.url} target="_blank" rel="noopener noreferrer">
                        {article.title}
                      </Link>
                    </Title>
                    <Paragraph className="news-description" ellipsis={{ rows: 2 }}>
                      {article.description}
                    </Paragraph>
                    <div className="news-meta">
                      <Space>
                        <ClockCircleOutlined style={{ color: '#999' }} />
                        <span className="news-time">
                          {new Date(article.publishedAt).toLocaleString('vi-VN')}
                        </span>
                      </Space>
                    </div>
                  </div>
                  {article.imageUrl && article.imageUrl !== '/placeholder-image.jpg' && (
                    <div className="news-image">
                      <Image
                        src={article.imageUrl}
                        alt={article.title}
                        style={{ width: '200px', height: '120px', objectFit: 'cover' }}
                        preview={false}
                      />
                    </div>
                  )}
                </div>
              </List.Item>
            )}
          />
        ) : (
          <Empty 
            description={
              <span>
                Không tìm thấy kết quả nào phù hợp với "{query}"
              </span>
            }
            style={{ margin: '40px 0' }}
          >
            <Button type="primary" onClick={() => window.location.href = '/'}>Về trang chủ</Button>
          </Empty>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
