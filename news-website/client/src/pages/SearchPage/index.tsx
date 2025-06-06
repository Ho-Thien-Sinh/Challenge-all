import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Typography, Input, Button, List, Skeleton, Empty, Pagination } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Article } from '../../types';
import { searchArticles } from '../../services/api';

const { Title } = Typography;
const { Search } = Input;

interface SearchPagination {
  current: number;
  pageSize: number;
  total: number;
}

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState<string>(searchParams.get('q') || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<SearchPagination>({
    current: parseInt(searchParams.get('page') || '1', 10),
    pageSize: 10,
    total: 0
  });
  const [results, setResults] = useState<Article[]>([]);
  
  const fetchSearchResults = useCallback(async (searchQuery: string, page: number = 1) => {
    if (!searchQuery) return;
    
    setLoading(true);
    try {
      console.log('Fetching search results for:', { searchQuery, page, limit: pagination.pageSize });
      
      const result = await searchArticles(searchQuery, { 
        page, 
        limit: pagination.pageSize,
        sort: '-publishedAt'
      });
      
      console.log('Search results:', result);
      
      if (result && result.data) {
        setResults(result.data);
        setPagination(prev => ({
          ...prev,
          total: result.pagination?.total || 0,
          current: page,
          pageSize: result.pagination?.limit || pagination.pageSize
        }));
      } else {
        console.warn('Unexpected API response format:', result);
        setResults([]);
      }
    } catch (error) {
      console.error('Error searching articles:', error);
      setResults([]);
      setPagination(prev => ({
        ...prev,
        total: 0,
        current: 1
      }));
    } finally {
      setLoading(false);
    }
  }, [pagination.pageSize]);

  const handleSearch = (value: string) => {
    if (value.trim()) {
      setSearchParams({ q: value.trim(), page: '1' });
      setPagination(prev => ({ ...prev, current: 1 }));
      fetchSearchResults(value.trim(), 1).catch(console.error);
    }
  };

  const handlePageChange = (page: number) => {
    console.log('Page changed to:', page);
    setPagination(prev => ({
      ...prev,
      current: page
    }));
    
    // Cập nhật URL với tham số trang mới
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    params.set('page', page.toString());
    setSearchParams(params);
    
    // Cuộn lên đầu trang
    window.scrollTo(0, 0);
  };
  
  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1', 10);
    const searchQuery = searchParams.get('q') || '';
    
    console.log('URL params changed:', { page, searchQuery });
    
    // Chỉ cập nhật state nếu có thay đổi
    if (searchQuery !== query) {
      setQuery(searchQuery);
    }
    
    if (page !== pagination.current) {
      setPagination(prev => ({
        ...prev,
        current: page
      }));
    }
    
    // Gọi API tìm kiếm nếu có từ khóa
    if (searchQuery) {
      fetchSearchResults(searchQuery, page).catch(console.error);
    } else {
      setResults([]);
    }
    
    // Chỉ chạy lại khi searchParams thay đổi
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  
  return (
    <div className="search-page" style={{ padding: '24px' }}>
      <div className="search-header" style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ marginBottom: '24px' }}>Tìm kiếm</Title>
        <div className="search-bar" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Search
            placeholder="Nhập từ khóa tìm kiếm..."
            allowClear
            enterButton={
              <Button type="primary" icon={<SearchOutlined />}>
                Tìm kiếm
              </Button>
            }
            size="large"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onSearch={handleSearch}
            loading={loading}
          />
        </div>
      </div>
      
      <div className="search-results">
        {loading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : results.length > 0 ? (
          <>
            <List
              itemLayout="vertical"
              dataSource={results}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={<a href={`/bai-viet/${item.id}`}>{item.title}</a>}
                    description={item.excerpt}
                  />
                </List.Item>
              )}
            />
            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onChange={handlePageChange}
                showSizeChanger={false}
                showTotal={(total, range) => `Hiển thị ${range[0]}-${range[1]} trong ${total} kết quả`}
                style={{ marginTop: '16px' }}
              />
            </div>
          </>
        ) : query ? (
          <div style={{ margin: '40px 0' }}>
          <Empty 
            description={
              <span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
                Không tìm thấy kết quả nào phù hợp với từ khóa "{query}"
              </span>
            } 
          />
        </div>
      ) : (
        <div style={{ margin: '40px 0' }}>
          <Empty 
            description={
              <span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
                Nhập từ khóa để tìm kiếm bài viết
              </span>
            } 
          />
        </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
