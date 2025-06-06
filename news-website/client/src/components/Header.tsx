import React, { useState, useEffect } from 'react';
import { SearchOutlined, UserOutlined, LogoutOutlined, DownOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Layout, Space, Dropdown, Menu, Avatar, message, MenuProps, ConfigProvider } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import './Header.css';

type MenuItem = Required<MenuProps>['items'][number];

// Custom theme for the menu
const theme = {
  token: {
    colorPrimary: '#1890ff',
    colorBgContainer: '#ffffff',
    colorText: 'rgba(0, 0, 0, 0.88)',
    colorTextDescription: 'rgba(0, 0, 0, 0.45)',
    colorTextDisabled: 'rgba(0, 0, 0, 0.25)',
  },
  components: {
    Menu: {
      // Using CSS variables for better compatibility
      itemHoverColor: 'var(--ant-primary-color-hover, #40a9ff)',
      itemSelectedColor: 'var(--ant-primary-color, #1890ff)',
      itemSelectedBg: 'var(--ant-primary-1, #e6f7ff)',
      itemColor: 'var(--ant-text-color)',
      horizontalItemHoverColor: 'var(--ant-primary-color-hover, #40a9ff)',
      horizontalItemSelectedColor: 'var(--ant-primary-color, #1890ff)',
      horizontalItemSelectedBg: 'var(--ant-primary-1, #e6f7ff)',
      horizontalItemBorderRadius: 4
    },
  },
} as const; // Add 'as const' for better type inference

const { Header: AntHeader } = Layout;
const { Search } = Input;

const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [current, setCurrent] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Lấy từ khóa tìm kiếm từ URL khi component mount
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  // Xử lý sự kiện tìm kiếm
  const handleSearch = (value: string) => {
    if (value.trim()) {
      // Chuyển hướng đến trang kết quả tìm kiếm
      navigate(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  };

  // Xử lý sự kiện nhấn phím Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      handleSearch(searchQuery);
    }
  };

  // Xử lý thay đổi giá trị tìm kiếm
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const menuItems: MenuItem[] = [
    { key: 'home', label: <Link to="/">Trang chủ</Link> },
    { key: 'news', label: <Link to="/news">Thời sự</Link> },
    { key: 'world', label: <Link to="/world">Thế giới</Link> },
    { key: 'business', label: <Link to="/business">Kinh doanh</Link> },
    { key: 'tech', label: <Link to="/tech">Công nghệ</Link> },
    { key: 'car', label: <Link to="/car">Xe</Link> },
    { key: 'sport', label: <Link to="/sport">Thể thao</Link> },
    { key: 'entertainment', label: <Link to="/entertainment">Giải trí</Link> },
    { key: 'education', label: <Link to="/education">Giáo dục</Link> },
    { key: 'health', label: <Link to="/health">Sức khỏe</Link> },
    { key: 'life', label: <Link to="/life">Đời sống</Link> },
    { key: 'law', label: <Link to="/law">Pháp luật</Link> },
    { key: 'travel', label: <Link to="/travel">Du lịch</Link> },
    { key: 'science', label: <Link to="/science">Khoa học</Link> },
    { key: 'digital', label: <Link to="/digital">Số hóa</Link> },
    { key: 'carplus', label: <Link to="/carplus">Xe+</Link> },
    { key: 'relax', label: <Link to="/relax">Thư giãn</Link> },
    { key: 'iwrite', label: <Link to="/iwrite">Tôi viết</Link> },
    { key: 'share', label: <Link to="/share">Tâm sự</Link> },
    { key: 'funny', label: <Link to="/funny">Hài</Link> },
    { key: 'learn-english', label: <Link to="/learn-english">Học tiếng Anh</Link> },
    { key: 'more', label: <Link to="/more">Xem thêm</Link> }
  ];

  const onClick: MenuProps['onClick'] = (e) => {
    setCurrent(e.key);
    // Navigation is now handled by the Link components in menuItems
  };

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <ConfigProvider theme={theme}>
      <AntHeader className={`app-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          <div className="logo">
            <Link to="/">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#e31837', fontSize: '24px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>tuổi trẻ</span>
                <span style={{ color: '#0066cc', fontSize: '16px', marginLeft: '5px', fontWeight: 'bold' }}>online</span>
              </div>
            </Link>
          </div>
          
          <div className="search-bar">
            <Search
              placeholder="Tìm kiếm tin tức..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              style={{ width: '100%', maxWidth: '500px' }}
              value={searchQuery}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              onKeyDown={handleKeyDown}
            />
          </div>
        
          <div className="user-actions">
            {currentUser ? (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'profile',
                      icon: <UserOutlined />,
                      label: <Link to="/tai-khoan">Hồ sơ của tôi</Link>
                    },
                    {
                      type: 'divider',
                    },
                    {
                      key: 'logout',
                      icon: <LogoutOutlined />,
                      label: 'Đăng xuất',
                      onClick: async () => {
                        try {
                          await logout();
                          message.success('Đã đăng xuất thành công');
                          navigate('/');
                        } catch (error) {
                          message.error('Đăng xuất thất bại');
                        }
                      }
                    }
                  ]
                }}
                placement="bottomRight"
                arrow
              >
                <div className="user-avatar" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    src={currentUser.photoURL} 
                    icon={!currentUser.photoURL && <UserOutlined />} 
                    style={{ marginRight: 8 }}
                  />
                  <span className="user-name" style={{ color: '#fff', marginRight: 8 }}>
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </span>
                  <DownOutlined style={{ color: '#fff', fontSize: '12px' }} />
                </div>
              </Dropdown>
            ) : (
              <Space size="middle">
                <Link to="/dang-nhap" className="login-btn" style={{ color: '#fff' }}>
                  Đăng nhập
                </Link>
                <span style={{ color: '#999' }}>|</span>
                <Link 
                  to="/dang-ky" 
                  className="register-btn" 
                  style={{
                    color: '#fff',
                    backgroundColor: '#1890ff',
                    padding: '4px 12px',
                    borderRadius: '4px'
                  }}
                >
                  Đăng ký
                </Link>
              </Space>
            )}
          </div>
        </div>
      </AntHeader>
      
      {/* Navigation Menu */}
      <div className="main-navigation">
        <div className="nav-container">
          <div className="header-menu-container">
            <Menu 
              onClick={onClick} 
              selectedKeys={[current]} 
              mode="horizontal" 
              items={menuItems}
              className="header-menu"
              // Theme is now handled by ConfigProvider
              theme="light"
              style={{ 
                flex: 1, 
                minWidth: 0, 
                borderBottom: 'none',
              }}
            />
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default Header;
