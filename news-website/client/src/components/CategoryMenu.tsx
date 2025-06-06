import React from 'react';
import { Menu } from 'antd';
import { useNavigate } from 'react-router-dom';
import { HomeOutlined, FireOutlined, StarOutlined, VideoCameraOutlined, 
  GlobalOutlined, DollarOutlined, CarOutlined, HeartOutlined, 
  TeamOutlined, TrophyOutlined, BookOutlined, HeartFilled } from '@ant-design/icons';
import type { MenuProps } from 'antd';

const CategoryMenu: React.FC = () => {
  const navigate = useNavigate();

  const categories = [
    { key: 'trang-chu', label: 'Trang chủ', icon: <HomeOutlined /> },
    { key: 'tin-moi-nhat', label: 'Tin mới nhất', icon: <FireOutlined /> },
    { key: 'tin-nong', label: 'Tin nóng', icon: <FireOutlined style={{ color: 'red' }} /> },
    { key: 'video', label: 'Video', icon: <VideoCameraOutlined /> },
    { key: 'thoi-su', label: 'Thời sự', icon: <GlobalOutlined /> },
    { key: 'kinh-doanh', label: 'Kinh doanh', icon: <DollarOutlined /> },
    { key: 'bat-dong-san', label: 'Bất động sản', icon: <HomeOutlined /> },
    { key: 'khoa-hoc', label: 'Khoa học', icon: <BookOutlined /> },
    { key: 'giai-tri', label: 'Giải trí', icon: <StarOutlined /> },
    { key: 'the-thao', label: 'Thể thao', icon: <TrophyOutlined /> },
    { key: 'phap-luat', label: 'Pháp luật', icon: <BookOutlined /> },
    { key: 'doi-song', label: 'Đời sống', icon: <HeartOutlined /> },
    { key: 'du-lich', label: 'Du lịch', icon: <CarOutlined /> },
    { key: 'xe', label: 'Xe', icon: <CarOutlined /> },
    { key: 'y-kien', label: 'Ý kiến', icon: <TeamOutlined /> },
    { key: 'tam-su', label: 'Tâm sự', icon: <HeartFilled style={{ color: 'red' }} /> },
  ];

  const onClick: MenuProps['onClick'] = (e) => {
    // Chuyển hướng đến route tương ứng với danh mục
    const route = e.key === 'trang-chu' ? '/' : `/danh-muc/${e.key}`;
    navigate(route);
  };

  return (
    <div className="category-menu" style={{ marginBottom: 16 }}>
      <Menu
        mode="horizontal"
        onClick={onClick}
        selectedKeys={[]}
        items={categories}
        style={{ 
          display: 'flex', 
          justifyContent: 'center',
          borderBottom: 'none',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          flexWrap: 'nowrap',
        }}
      />
    </div>
  );
};

export default CategoryMenu;
