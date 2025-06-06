import React, { useEffect, useState } from 'react';
import { Card, Typography, Image, Tag, Spin, Alert, Row, Col, Select } from 'antd';
import { NEWS_CATEGORIES } from '../services/tuoitreService';
import { TuoiTreArticle } from '../services/tuoitreService';
import { useNavigate } from 'react-router-dom';
import { ClockCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const TuoiTreNewsPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [articles, setArticles] = useState<TuoiTreArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchNews();
  }, [selectedCategory]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Sử dụng dữ liệu mẫu tạm thời
      const mockData = {
        data: [
          {
            _id: '1',
            title: 'Tin tức mẫu 1: Những xu hướng công nghệ mới nhất năm 2025',
            description: 'Công nghệ đang phát triển với tốc độ chóng mặt, đặc biệt là trong lĩnh vực trí tuệ nhân tạo và điện toán đám mây.',
            url: 'https://tuoitre.vn',
            urlToImage: 'https://via.placeholder.com/300x200?text=Tech+News',
            publishedAt: new Date().toISOString(),
            category: 'Công nghệ'
          },
          {
            _id: '2',
            title: 'Kinh tế Việt Nam tăng trưởng ấn tượng trong quý II/2025',
            description: 'Nền kinh tế Việt Nam tiếp tục đà tăng trưởng ổn định với nhiều dấu hiệu tích cực từ các ngành xuất khẩu chủ lực.',
            url: 'https://tuoitre.vn',
            urlToImage: 'https://via.placeholder.com/300x200?text=Economy',
            publishedAt: new Date(Date.now() - 86400000).toISOString(), // 1 ngày trước
            category: 'Kinh doanh'
          },
          {
            _id: '3',
            title: 'Giải bóng đá V-League 2025: Những bất ngờ trong vòng đấu mở màn',
            description: 'Vòng đấu đầu tiên của V-League 2025 đã chứng kiến nhiều bất ngờ thú vị với sự lên ngôi của các đội bóng được đánh giá thấp hơn.',
            url: 'https://tuoitre.vn',
            urlToImage: 'https://via.placeholder.com/300x200?text=Sports',
            publishedAt: new Date(Date.now() - 172800000).toISOString(), // 2 ngày trước
            category: 'Thể thao'
          },
          {
            _id: '4',
            title: 'Xu hướng du lịch xanh được ưa chuộng sau đại dịch',
            description: 'Du lịch xanh, du lịch bền vững đang trở thành xu hướng được nhiều du khách lựa chọn trong năm 2025.',
            url: 'https://tuoitre.vn',
            urlToImage: 'https://via.placeholder.com/300x200?text=Travel',
            publishedAt: new Date(Date.now() - 259200000).toISOString(), // 3 ngày trước
            category: 'Du lịch'
          },
          {
            _id: '5',
            title: 'Giáo dục 4.0: Xu hướng học tập cá nhân hóa',
            description: 'Công nghệ giáo dục đang thay đổi cách chúng ta học tập, tập trung vào trải nghiệm cá nhân hóa cho từng người học.',
            url: 'https://tuoitre.vn',
            urlToImage: 'https://via.placeholder.com/300x200?text=Education',
            publishedAt: new Date(Date.now() - 345600000).toISOString(), // 4 ngày trước
            category: 'Giáo dục'
          }
        ].filter(article => 
          !selectedCategory || 
          article.category.toLowerCase() === selectedCategory.toLowerCase()
        )
      };
      
      // Thêm độ trễ để mô phỏng gọi API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setArticles(mockData.data);
    } catch (err) {
      console.error('Lỗi khi lấy tin tức:', err);
      setError('Không thể tải tin tức. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | Date): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleArticleClick = (article: TuoiTreArticle) => {
    if (article.url) {
      window.open(article.url, '_blank');
    } else if (article._id) {
      navigate(`/news/${article._id}`);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px', textAlign: 'center' }}>
        Tin tức Tuổi Trẻ
      </Title>

      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <Select
          placeholder="Chọn danh mục"
          style={{ width: 300 }}
          onChange={(value: string) => setSelectedCategory(value)}
          allowClear
        >
          {NEWS_CATEGORIES.map((category) => (
            <Option key={category.id} value={category.id}>
              {category.name}
            </Option>
          ))}
        </Select>
      </div>

      {error && (
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {articles.map((article) => (
            <Col xs={24} sm={12} md={8} lg={6} key={article._id || article.url}>
              <Card
                hoverable
                onClick={() => handleArticleClick(article)}
                style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                cover={
                  article.urlToImage ? (
                    <div style={{ height: '160px', overflow: 'hidden' }}>
                      <Image
                        alt={article.title}
                        src={article.urlToImage}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        preview={false}
                        fallback="https://via.placeholder.com/300x160?text=No+Image"
                      />
                    </div>
                  ) : null
                }
              >
                <Card.Meta
                  title={
                    <Text
                      ellipsis={{ tooltip: article.title }}
                      style={{ 
                        marginBottom: '8px', 
                        minHeight: '48px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {article.title}
                    </Text>
                  }
                  description={
                    <>
                      <Text
                        type="secondary"
                        style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}
                      >
                        <ClockCircleOutlined style={{ marginRight: '4px' }} />
                        {formatDate(article.publishedAt || '')}
                      </Text>
                      {article.category && (
                        <Tag color="blue" style={{ marginTop: '8px' }}>
                          {article.category}
                        </Tag>
                      )}
                      <Text
                        ellipsis={{ tooltip: article.description }}
                        style={{ 
                          marginTop: '8px',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {article.description}
                      </Text>
                    </>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default TuoiTreNewsPage;
