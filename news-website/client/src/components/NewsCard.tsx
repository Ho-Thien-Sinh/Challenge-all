import React from 'react';
import { Link } from 'react-router-dom';
import { ClockCircleOutlined, ReadOutlined } from '@ant-design/icons';
import { Card, Typography, Image, Space, Tag } from 'antd';

const { Text, Title } = Typography;

export interface NewsCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  url: string;
  publishedAt: string | Date;
  source?: string;
  layout?: 'vertical' | 'horizontal';
  showFullContent?: boolean;
}

const formatDate = (dateValue: string | Date): string => {
  try {
    if (!dateValue) return '';
    
    const date = dateValue instanceof Date 
      ? dateValue 
      : new Date(dateValue);
      
    if (isNaN(date.getTime())) return '';
    
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

const NewsCard: React.FC<NewsCardProps> = ({
  // id is used as key in the parent component
  title,
  description,
  imageUrl,
  url,
  publishedAt,
  source,
  layout = 'vertical',
  showFullContent = false
}) => {
  const formattedDate = formatDate(publishedAt);
  const isExternal = url.startsWith('http');
  
  const cardContent = (
    <Card
      hoverable
      className="news-card"
      cover={
        <div style={{ height: layout === 'horizontal' ? '200px' : '180px', overflow: 'hidden' }}>
          <Image
            src={imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
            alt={title}
            preview={false}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/300x200?text=No+Image';
            }}
          />
        </div>
      }
    >
      <div className="news-card-body">
        {source && (
          <Tag color="red" style={{ marginBottom: '8px' }}>
            {source}
          </Tag>
        )}
        
        <Title 
          level={layout === 'horizontal' ? 4 : 5} 
          style={{ 
            marginBottom: '8px',
            minHeight: layout === 'horizontal' ? 'auto' : '72px',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as const
          }}
          className="news-title"
        >
          {title}
        </Title>
        
        {(showFullContent || layout === 'horizontal') && description && (
          <Text 
            type="secondary" 
            style={{
              display: '-webkit-box',
              WebkitLineClamp: layout === 'horizontal' ? 3 : 2,
              WebkitBoxOrient: 'vertical' as const,
              overflow: 'hidden',
              marginBottom: '12px',
              minHeight: layout === 'horizontal' ? '72px' : 'auto'
            }}
            className="news-description"
          >
            {description}
          </Text>
        )}
        
        <Space size="middle" style={{ marginTop: 'auto' }}>
          <Space>
            <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
            <Text type="secondary">{formattedDate}</Text>
          </Space>
          
          {layout === 'horizontal' && (
            <Space>
              <ReadOutlined style={{ color: '#8c8c8c' }} />
              <Text type="secondary">Đọc tiếp</Text>
            </Space>
          )}
        </Space>
      </div>
    </Card>
  );

  if (isExternal) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', height: '100%' }}>
        {cardContent}
      </a>
    );
  }

  return (
    <Link to={url} style={{ display: 'block', height: '100%' }}>
      {cardContent}
    </Link>
  );
};

export default NewsCard;
