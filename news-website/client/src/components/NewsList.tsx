import React, { useEffect, useState } from 'react';
import { tuoitreService } from '../services/tuoitreService';
import { Skeleton, Button, Empty, Row, Col, Card } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import NewsCard from './NewsCard';
import { Article } from '../types';
import { TuoiTreArticle } from '../services/tuoitreService';

const NewsList: React.FC = () => {
  const [news, setNews] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const mapToArticle = (tuoiTreArticle: TuoiTreArticle): Article => {
    return {
      ...tuoiTreArticle,
      id: tuoiTreArticle.id || '',
      title: tuoiTreArticle.title || 'Không có tiêu đề',
      slug: tuoiTreArticle.slug || tuoiTreArticle.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^\-|\-$)/g, '') || '',
      excerpt: tuoiTreArticle.excerpt || tuoiTreArticle.description || 'Không có mô tả',
      content: tuoiTreArticle.content || '',
      author: tuoiTreArticle.author || 'Không rõ tác giả',
      publishedAt: typeof tuoiTreArticle.publishedAt === 'string' ? tuoiTreArticle.publishedAt : tuoiTreArticle.publishedAt?.toISOString() || new Date().toISOString(),
      updatedAt: typeof tuoiTreArticle.updatedAt === 'string' ? tuoiTreArticle.updatedAt : tuoiTreArticle.updatedAt?.toISOString() || new Date().toISOString(),
      viewCount: tuoiTreArticle.viewCount || 0,
      tags: tuoiTreArticle.tags || [],
      status: tuoiTreArticle.status || 'published',
      featured: tuoiTreArticle.featured || false,
      description: tuoiTreArticle.description || '',
      category: tuoiTreArticle.category || 'other',
      imageUrl: tuoiTreArticle.imageUrl || '/placeholder-image.jpg',
      url: tuoiTreArticle.url || `/${tuoiTreArticle.id || ''}`,
    };
  };

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching news...');
      const response = await tuoitreService.fetchTuoitreNews();
      console.log('API Response:', response);
      if (response && response.articles) {
        console.log('Articles found:', response.articles.length);
        // Convert TuoiTreArticle[] to Article[]
        const articles = response.articles.map(mapToArticle);
        setNews(articles);
      } else {
        console.log('No articles found in response');
        setError('Không có dữ liệu tin tức');
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Không thể tải tin tức. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="news-list">
        <Row gutter={[16, 16]}>
          {[...Array(6)].map((_, index) => (
            <Col key={index} xs={24} sm={12} md={8} lg={8} xl={6}>
              <Card style={{ width: '100%' }}>
                <Skeleton active />
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <Empty
          description={
            <span className="error-message">
              {error}
            </span>
          }
        />
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={handleRetry}
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <Empty
        description="Không có tin tức nào"
        style={{ margin: '40px 0' }}
      />
    );
  }

  return (
    <div className="news-list">
      <Row gutter={[16, 16]}>
        {news.map((article) => (
          <Col key={article.id} xs={24} sm={12} md={8} lg={8} xl={6}>
            <NewsCard
              id={article.id}
              title={article.title}
              description={article.description || article.excerpt || 'Không có mô tả'}
              imageUrl={article.imageUrl || '/placeholder-image.jpg'}
              url={article.url || `/${article.id || ''}`}
              publishedAt={article.publishedAt}
              source={article.source || 'Nguồn không xác định'}
            />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default NewsList;
