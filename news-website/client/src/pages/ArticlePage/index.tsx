import React from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Skeleton } from 'antd';

const { Title } = Typography;

const ArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  // TODO: Fetch article data based on slug
  const articleTitle = slug ? slug.split('-').join(' ') : 'Bài viết';
  
  return (
    <div className="article-page">
      <article className="article-content">
        <header className="article-header">
          <Title level={1} className="article-title">
            {articleTitle}
          </Title>
          <div className="article-meta">
            <Skeleton.Avatar active size="small" shape="circle" />
            <Skeleton.Input active size="small" style={{ width: 100, marginLeft: 8 }} />
            <Skeleton.Input active size="small" style={{ width: 150, marginLeft: 16 }} />
          </div>
        </header>
        
        <div className="article-body">
          <Skeleton active paragraph={{ rows: 10 }} />
        </div>
        
        <footer className="article-footer">
          <Skeleton active paragraph={{ rows: 1 }} />
        </footer>
      </article>
      
      <div className="article-sidebar">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    </div>
  );
};

export default ArticlePage;
