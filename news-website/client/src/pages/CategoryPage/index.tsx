import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Typography, Card, List, Pagination, Skeleton, Empty } from 'antd';
import { getArticlesByCategory } from '../../services/api';
import { Article } from '../../types';
import { formatDate } from '../../utils/date';
import './CategoryPage.less';

const { Title } = Typography;

const PAGE_SIZE = 10;

const CategoryPage: React.FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: PAGE_SIZE,
    total: 0,
  });
  
  // Lấy tên danh mục từ slug
  const categoryName = slug ? slug.split('-').join(' ') : 'Chuyên mục';
  
  // Lấy dữ liệu bài viết theo danh mục
  const fetchArticles = async (page: number = 1) => {
    try {
      setLoading(true);
      const result = await getArticlesByCategory(slug, { 
        page, 
        limit: PAGE_SIZE,
        sortBy: '-publishedAt'
      });
      
      setArticles(result.data);
      setPagination({
        ...pagination,
        current: page,
        total: result.pagination.total,
      });
    } catch (error) {
      console.error('Lỗi khi lấy danh sách bài viết:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Xử lý khi chuyển trang
  const handlePageChange = (page: number) => {
    fetchArticles(page);
    window.scrollTo(0, 0);
  };
  
  // Gọi API khi thay đổi slug hoặc trang
  useEffect(() => {
    if (slug) {
      fetchArticles(1);
    }
  }, [slug]);
  
  // Xử lý khi nhấn vào bài viết
  const handleArticleClick = (article: Article) => {
    if (article.slug) {
      navigate(`/bai-viet/${article.slug}`);
    } else if (article.id) {
      navigate(`/bai-viet/${article.id}`);
    }
  };
  
  return (
    <div className="category-page">
      <div className="page-header">
        <Title level={2} className="page-title">{categoryName}</Title>
      </div>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={18}>
          <div className="main-content">
            {loading ? (
              // Hiển thị skeleton khi đang tải
              <List
                itemLayout="vertical"
                dataSource={Array(5).fill(null)}
                renderItem={() => (
                  <List.Item>
                    <Skeleton active avatar paragraph={{ rows: 3 }} />
                  </List.Item>
                )}
              />
            ) : articles.length > 0 ? (
              // Hiển thị danh sách bài viết
              <>
                <List
                  itemLayout="vertical"
                  dataSource={articles}
                  renderItem={(article) => (
                    <List.Item 
                      key={article.id} 
                      className="article-item"
                      onClick={() => handleArticleClick(article)}
                    >
                      <Card
                        hoverable
                        cover={
                          <div className="article-image">
                            <img 
                              alt={article.title} 
                              src={article.imageUrl || '/placeholder-news.jpg'} 
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder-news.jpg';
                              }}
                            />
                          </div>
                        }
                      >
                        <Card.Meta
                          title={article.title}
                          description={
                            <>
                              <div className="article-meta">
                                <span className="publish-date">
                                  {formatDate(article.publishedAt)}
                                </span>
                                {article.category && (
                                  <span className="category">
                                    {article.category}
                                  </span>
                                )}
                              </div>
                              <div className="article-excerpt">
                                {article.excerpt || article.content?.substring(0, 150) + '...'}
                              </div>
                            </>
                          }
                        />
                      </Card>
                    </List.Item>
                  )}
                />
                
                {/* Phân trang */}
                {pagination.total > 0 && (
                  <div className="pagination-wrapper">
                    <Pagination
                      current={pagination.current}
                      pageSize={pagination.pageSize}
                      total={pagination.total}
                      onChange={handlePageChange}
                      showSizeChanger={false}
                      showQuickJumper
                    />
                  </div>
                )}
              </>
            ) : (
              // Hiển thị khi không có bài viết nào
              <Empty 
                description="Không có bài viết nào trong danh mục này"
                style={{ margin: '40px 0' }}
              />
            )}
          </div>
        </Col>
        
        <Col xs={24} lg={6}>
          <div className="sidebar">
            {/* Có thể thêm các thành phần sidebar ở đây */}
            <Card title="Danh mục khác" style={{ marginBottom: 24 }}>
              <p>Nội dung danh mục khác sẽ được thêm vào đây</p>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default CategoryPage;
