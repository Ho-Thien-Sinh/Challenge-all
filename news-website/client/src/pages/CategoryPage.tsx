import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tuoitreService, NEWS_CATEGORIES, TuoiTreArticle } from '../services/tuoitreService';
import { Skeleton, Typography, Card, Row, Col, Button, Empty, Tabs, Divider } from 'antd';
import { 
  FireOutlined, 
  ReloadOutlined, 
  HomeOutlined,
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import NewsCard from '../components/NewsCard';
import { Article } from '../types';

const { Title, Text } = Typography;

// Helper function to map TuoiTreArticle to Article
const mapTuoiTreToArticle = (tuoiTreArticle: TuoiTreArticle): Article => {
  const defaultSlug = tuoiTreArticle.title 
    ? tuoiTreArticle.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^\-|\-$)/g, '') 
    : '';
    
  return {
    ...tuoiTreArticle,
    id: tuoiTreArticle.id || '',
    title: tuoiTreArticle.title || 'Không có tiêu đề',
    slug: tuoiTreArticle.slug || defaultSlug,
    excerpt: tuoiTreArticle.excerpt || tuoiTreArticle.description || 'Không có mô tả',
    content: tuoiTreArticle.content || '',
    author: tuoiTreArticle.author || 'Không rõ tác giả',
    publishedAt: typeof tuoiTreArticle.publishedAt === 'string' 
      ? tuoiTreArticle.publishedAt 
      : tuoiTreArticle.publishedAt?.toISOString() || new Date().toISOString(),
    updatedAt: typeof tuoiTreArticle.updatedAt === 'string' 
      ? tuoiTreArticle.updatedAt 
      : tuoiTreArticle.updatedAt?.toISOString() || new Date().toISOString(),
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

// Map URL slug to display name
const CATEGORY_NAMES: Record<string, string> = {
  'thoi-su': 'Thời sự',
  'the-gioi': 'Thế giới',
  'kinh-doanh': 'Kinh doanh',
  'giai-tri': 'Giải trí',
  'the-thao': 'Thể thao',
  'phap-luat': 'Pháp luật',
  'giao-duc': 'Giáo dục',
  'suc-khoe': 'Sức khỏe',
  'cong-nghe': 'Công nghệ',
  'doi-song': 'Đời sống',
  'du-lich': 'Du lịch',
  'khoa-hoc': 'Khoa học'
};

// Thêm kiểu dữ liệu cho danh mục
interface Category {
  id: string;
  name: string;
  articles: Article[];
  loading: boolean;
  error: string | null;
}

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  
  // State lưu trữ dữ liệu cho từng danh mục
  const [categoriesData, setCategoriesData] = useState<Record<string, Category>>({});
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [pageError, setPageError] = useState<string | null>(null);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
    total: 0,
    loading: false,
    hasMore: true
  });
  
  // Get current category from URL or default to 'all'
  const currentCategory = useMemo(() => {
    if (!slug) return 'all';
    
    // Check if slug exists in CATEGORY_NAMES
    if (slug && CATEGORY_NAMES[slug]) {
      return slug;
    }
    
    // Try to find by name (case insensitive)
    const found = Object.entries(CATEGORY_NAMES).find(
      ([_, name]) => name.toLowerCase() === slug.toLowerCase()
    );
    
    return found ? found[0] : 'all';
  }, [slug]);
  
  // Lấy thông tin danh mục hiện tại
  const currentCategoryData = useMemo(() => {
    const defaultCategoryData = {
      id: currentCategory,
      name: CATEGORY_NAMES[currentCategory] || currentCategory,
      articles: [] as Article[],
      loading: true,
      error: null as string | null
    };
    
    if (!categoriesData[currentCategory]) {
      return defaultCategoryData;
    }
    
    return {
      ...defaultCategoryData,
      ...categoriesData[currentCategory]
    };
  }, [currentCategory, categoriesData]);

  // Khởi tạo dữ liệu cho các danh mục
  useEffect(() => {
    const initialData: Record<string, Category> = {
      all: {
        id: 'all',
        name: 'Tất cả',
        articles: [],
        loading: true,
        error: null
      },
      ...NEWS_CATEGORIES.reduce<Record<string, Category>>((acc, cat) => ({
        ...acc,
        [cat.id]: {
          id: cat.id,
          name: cat.name,
          articles: [],
          loading: true,
          error: null
        }
      }), {})
    };
    setCategoriesData(initialData);
  }, []);
  

  // Handle tab change
  const handleTabChange = (categoryId: string) => {
    if (categoryId === 'all') {
      navigate('/');
    } else if (CATEGORY_NAMES[categoryId]) {
      navigate(`/danh-muc/${categoryId}`);
    } else {
      navigate('/');
    }
  };

  // Hàm lấy dữ liệu bài viết cho danh mục hiện tại
  const fetchCategoryNews = async (loadMore: boolean = false) => {
    if (!currentCategory) return;
    
    // Nếu không phải load more, reset về trang 1
    const currentPage = loadMore ? pagination.current : 1;
    
    try {
      // Cập nhật trạng thái loading
      if (loadMore) {
        setPagination(prev => ({ ...prev, loading: true }));
      } else {
        setCategoriesData(prev => ({
          ...prev,
          [currentCategory]: {
            ...(prev[currentCategory] || {
              id: currentCategory,
              name: CATEGORY_NAMES[currentCategory] || currentCategory,
              articles: [],
              loading: true,
              error: null
            }),
            loading: true,
            error: null
          }
        }));
      }

      let articles: Article[] = [];
      let total = 0;
      
      // Xử lý đặc biệt cho từng tab
      switch (currentCategory) {
        case 'all':
          // Trang chủ - lấy tất cả tin tức
          const homeResult = await tuoitreService.fetchTuoitreNews({ 
            page: currentPage,
            limit: pagination.pageSize,
            sortBy: '-publishedAt' // Mới nhất đầu tiên
          });
          articles = (homeResult?.articles || []).map(mapTuoiTreToArticle);
          total = homeResult?.total || 0;
          break;
          
        case 'thoi-su':
          // Trang thời sự - ưu tiên tin nóng
          if (currentPage === 1) {
            // Lấy 3 tin nóng đầu tiên
            const hotNews = await tuoitreService.fetchTuoitreNews({
              category: 'thoi-su',
              limit: 3,
              sortBy: '-viewCount' // Tin xem nhiều nhất
            });
            
            // Lấy tin mới nhất
            const latestNews = await tuoitreService.fetchNewsByCategory(
              'thoi-su',
              currentPage,
              pagination.pageSize - 3 // Trừ đi 3 tin nóng đã lấy
            );
            
            articles = [
              ...(hotNews?.articles || []).map(mapTuoiTreToArticle),
              ...(latestNews?.data || []).map(mapTuoiTreToArticle)
            ];
            total = (latestNews?.pagination?.total || 0) + (hotNews?.articles?.length || 0);
          } else {
            // Các trang tiếp theo chỉ lấy tin mới nhất
            const result = await tuoitreService.fetchNewsByCategory(
              'thoi-su',
              currentPage,
              pagination.pageSize
            );
            articles = (result?.data || []).map(mapTuoiTreToArticle);
            total = result?.pagination?.total || 0;
          }
          break;
          
        case 'the-gioi':
          // Trang thế giới - ưu tiên tin quốc tế
          const worldNews = await tuoitreService.fetchTuoitreNews({
            category: 'the-gioi',
            page: currentPage,
            limit: pagination.pageSize,
            sortBy: '-publishedAt'
          });
          articles = (worldNews?.articles || []).map(mapTuoiTreToArticle);
          total = worldNews?.total || 0;
          break;
          
        case 'kinh-doanh':
          // Trang kinh doanh - ưu tiên tin tài chính
          const businessNews = await tuoitreService.fetchTuoitreNews({
            category: 'kinh-doanh',
            page: currentPage,
            limit: pagination.pageSize,
            sortBy: '-publishedAt'
          });
          articles = (businessNews?.articles || []).map(mapTuoiTreToArticle);
          total = businessNews?.total || 0;
          break;
          
        case 'the-thao':
          // Trang thể thao - ưu tiên tin bóng đá
          const sportsNews = await tuoitreService.fetchTuoitreNews({
            category: 'the-thao',
            page: currentPage,
            limit: pagination.pageSize,
            sortBy: '-publishedAt'
          });
          articles = (sportsNews?.articles || []).map(mapTuoiTreToArticle);
          total = sportsNews?.total || 0;
          break;
          
        default:
          // Các danh mục khác
          const result = await tuoitreService.fetchNewsByCategory(
            currentCategory,
            currentPage,
            pagination.pageSize
          );
          articles = (result?.data || []).map(mapTuoiTreToArticle);
          total = result?.pagination?.total || 0;
      }
      
      if (articles.length === 0 && currentPage === 1) {
        throw new Error(`Không tìm thấy tin tức nào cho danh mục "${CATEGORY_NAMES[currentCategory] || currentCategory}".`);
      }
      
      // Cập nhật state với dữ liệu mới
      setCategoriesData(prev => {
        const currentArticles = loadMore 
          ? [...(prev[currentCategory]?.articles || []), ...articles]
          : articles;
          
        return {
          ...prev,
          [currentCategory]: {
            ...(prev[currentCategory] || {
              id: currentCategory,
              name: CATEGORY_NAMES[currentCategory] || currentCategory,
              articles: [],
              loading: false,
              error: null
            }),
            articles: currentArticles,
            loading: false,
            error: null
          }
        };
      });
      
      // Cập nhật phân trang
      setPagination(prev => ({
        ...prev,
        current: currentPage,
        total,
        loading: false,
        hasMore: articles.length >= pagination.pageSize
      }));
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải dữ liệu';
      setCategoriesData(prev => ({
        ...prev,
        [currentCategory]: {
          ...(prev[currentCategory] || {
            id: currentCategory,
            name: CATEGORY_NAMES[currentCategory] || currentCategory,
            articles: [],
            loading: false,
            error: null
          }),
          loading: false,
          error: errorMessage
        }
      }));
    }
  };

  // Gọi hàm fetchCategoryNews khi currentCategory thay đổi
  useEffect(() => {
    const init = async () => {
      try {
        // Reset pagination when category changes
        setPagination({
          current: 1,
          pageSize: 12,
          total: 0,
          loading: false,
          hasMore: true
        });
        
        await fetchCategoryNews(false);
        setIsInitialized(true);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu';
        setPageError(errorMessage);
      }
    };
    
    init();
  }, [currentCategory]);
  
  // Hàm tải thêm bài viết
  const loadMoreArticles = async () => {
    if (pagination.loading || !pagination.hasMore) return;
    
    try {
      await fetchCategoryNews(true);
    } catch (err) {
      console.error('Lỗi khi tải thêm bài viết:', err);
      // Không cần hiển thị lỗi toàn màn hình khi tải thêm thất bại
    }
  };

  // Lấy thông tin danh mục hiện tại (already defined above)

  // Hiển thị loading toàn bộ trang nếu chưa khởi tạo xong
  if (!isInitialized || currentCategoryData.loading) {
    return (
      <div style={{ padding: '24px' }}>
        <Skeleton active />
      </div>
    );
  }

  // Hiển thị lỗi trang nếu có
  if (pageError) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 16px' }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <div style={{ marginBottom: 16, color: '#ff4d4f' }}>
                <ExclamationCircleOutlined style={{ marginRight: 8 }} />
                {pageError}
              </div>
              <Button 
                type="primary" 
                onClick={() => window.location.reload()}
                icon={<ReloadOutlined />}
              >
                Tải lại trang
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  // Nếu không có slug, chuyển hướng về trang chủ
  if (!slug) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Card>
          <Title level={3}>Không tìm thấy danh mục</Title>
          <p>Đang chuyển hướng về trang chủ...</p>
          <Button 
            type="primary" 
            onClick={() => navigate('/')}
            style={{ marginTop: '16px' }}
          >
            Về trang chủ
          </Button>
        </Card>
      </div>
    );
  }

  // Main content render
  return (
    <div style={{ padding: '16px 24px' }}>
      <Tabs
        activeKey={currentCategory}
        onChange={handleTabChange}
        type="card"
        size="large"
        tabBarGutter={8}
        tabBarStyle={{ marginBottom: '24px' }}
        items={[
          {
            key: 'all',
            label: (
              <span>
                <FireOutlined /> Tất cả
              </span>
            ),
          },
          ...NEWS_CATEGORIES.map(category => ({
            key: category.id,
            label: category.name,
          }))
        ]}
      />
      
      <div className="article-list">
        {currentCategoryData.loading && !pagination.loading ? (
          <Row gutter={[16, 16]}>
            {[...Array(6)].map((_, i) => (
              <Col key={i} xs={24} sm={12} md={8} lg={8} xl={6}>
                <Card>
                  <Skeleton active paragraph={{ rows: 3 }} />
                </Card>
              </Col>
            ))}
          </Row>
        ) : currentCategoryData.error ? (
          <div style={{ textAlign: 'center', padding: '40px 16px' }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <div style={{ marginBottom: 16, color: '#ff4d4f' }}>
                    <ExclamationCircleOutlined style={{ marginRight: 8 }} />
                    {currentCategoryData.error}
                  </div>
                  <Button 
                    type="primary" 
                    onClick={() => fetchCategoryNews(false)}
                    icon={<ReloadOutlined />}
                  >
                    Thử lại
                  </Button>
                </div>
              }
            />
          </div>
        ) : currentCategoryData.articles.length > 0 ? (
          <>
            <Row gutter={[16, 24]}>
              {currentCategoryData.articles.map((article) => (
                <Col 
                  key={`${article.id}-${article.url}-${article.publishedAt}`} 
                  xs={24} 
                  sm={currentCategory === 'thoi-su' ? 24 : 12} 
                  md={currentCategory === 'thoi-su' ? 24 : 8} 
                  lg={currentCategory === 'thoi-su' ? 12 : 8} 
                  xl={currentCategory === 'thoi-su' ? 12 : 6}
                >
                  <NewsCard 
                    id={article.id}
                    title={article.title}
                    description={article.description || ''}
                    imageUrl={article.imageUrl || ''}
                    url={article.url || ''}
                    publishedAt={typeof article.publishedAt === 'string' 
                      ? article.publishedAt 
                      : article.publishedAt?.toISOString() || new Date().toISOString()}
                    source={article.source || ''}
                    layout={currentCategory === 'thoi-su' ? 'horizontal' : 'vertical'}
                    showFullContent={currentCategory === 'thoi-su'}
                  />
                </Col>
              ))}
            </Row>
            
            {/* Load More Button */}
            {pagination.hasMore && (
              <div style={{ textAlign: 'center', margin: '24px 0' }}>
                <Button 
                  type="primary" 
                  onClick={loadMoreArticles}
                  loading={pagination.loading}
                  disabled={pagination.loading}
                  size="large"
                >
                  {pagination.loading ? 'Đang tải...' : 'Tải thêm bài viết'}
                </Button>
              </div>
            )}
            
            {/* Show message when no more articles */}
            {!pagination.hasMore && currentCategoryData.articles.length > 0 && (
              <div style={{ textAlign: 'center', margin: '24px 0', color: '#666' }}>
                <Divider>Đã hiển thị tất cả bài viết</Divider>
              </div>
            )}
          </>
        ) : (
          <Empty
            description={
              <div>
                <p>Không có bài viết nào trong danh mục này</p>
                <Button 
                  type="primary" 
                  onClick={() => navigate('/')}
                  style={{ marginTop: 16 }}
                  icon={<HomeOutlined />}
                >
                  Về trang chủ
                </Button>
              </div>
            }
          />
        )}
      </div>
      
      {currentCategory === 'thoi-su' && (
        <div style={{ marginBottom: '24px' }}>
          <Text type="secondary">
            Cập nhật tin tức thời sự mới nhất, nóng nhất trong ngày. Tin tức thời sự Việt Nam và thế giới về xã hội, kinh tế, pháp luật, giáo dục, lao động việc làm, chính sách...
          </Text>
        </div>
      )}

      {currentCategoryData.loading ? (
        <Row gutter={[16, 16]}>
          {[...Array(6)].map((_, i) => (
            <Col 
              key={i} 
              xs={24} 
              sm={currentCategory === 'thoi-su' ? 24 : 12} 
              md={currentCategory === 'thoi-su' ? 24 : 8} 
              lg={currentCategory === 'thoi-su' ? 12 : 8} 
              xl={currentCategory === 'thoi-su' ? 12 : 6}
            >
              <Card>
                <Skeleton active paragraph={{ rows: currentCategory === 'thoi-su' ? 4 : 3 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : currentCategoryData.error ? (
        <div style={{ textAlign: 'center', padding: '40px 16px' }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <div style={{ marginBottom: 16, color: '#ff4d4f' }}>
                  <ExclamationCircleOutlined style={{ marginRight: 8 }} />
                  {currentCategoryData.error}
                </div>
                <Button 
                  type="primary" 
                  onClick={() => {
                    // Reset loading and error state
                    setCategoriesData(prev => ({
                      ...prev,
                      [currentCategory]: {
                        ...prev[currentCategory],
                        loading: true,
                        error: null
                      }
                    }));
                    // Refetch data
                    fetchCategoryNews();
                  }}
                  icon={<ReloadOutlined />}
                >
                  Thử lại
                </Button>
              </div>
            }
          />
        </div>
      ) : currentCategoryData.articles.length > 0 ? (
        <Row gutter={[16, 24]}>
          {currentCategoryData.articles.map((article) => (
            <Col 
              key={article.id || article.url} 
              xs={24} 
              sm={currentCategory === 'thoi-su' ? 24 : 12} 
              md={currentCategory === 'thoi-su' ? 24 : 8} 
              lg={currentCategory === 'thoi-su' ? 12 : 8} 
              xl={currentCategory === 'thoi-su' ? 12 : 6}
            >
              <NewsCard 
                id={article.id}
                title={article.title}
                description={article.description || ''}
                imageUrl={article.imageUrl || ''}
                url={article.url || ''}
                publishedAt={typeof article.publishedAt === 'string' 
                  ? article.publishedAt 
                  : article.publishedAt?.toISOString() || new Date().toISOString()}
                source={article.source || ''}
                layout={currentCategory === 'thoi-su' ? 'horizontal' : 'vertical'}
                showFullContent={currentCategory === 'thoi-su'}
              />
            </Col>
          ))}
        </Row>
      ) : (
        <Empty
          description={
            <div>
              <p>Không có bài viết nào trong danh mục này</p>
              <Button 
                type="primary" 
                onClick={() => navigate('/')}
                style={{ marginTop: 16 }}
                icon={<HomeOutlined />}
              >
                Về trang chủ
              </Button>
            </div>
          }
        />
      )}
    </div>
  );
};

export default CategoryPage; 