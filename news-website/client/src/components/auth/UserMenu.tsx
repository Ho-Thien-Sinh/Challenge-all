import React from 'react';
import { Dropdown, Avatar, Button, MenuProps } from 'antd';
import { UserOutlined, LogoutOutlined, UserSwitchOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const UserMenu: React.FC = () => {
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
    }
  };

  const items: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <a href="/profile">Hồ sơ của tôi</a>,
    },
    {
      key: 'account',
      icon: <UserSwitchOutlined />,
      label: <a href="/account">Tài khoản</a>,
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ];

  return currentUser ? (
    <Dropdown menu={{ items }} placement="bottomRight" trigger={['click']}>
      <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
        <Avatar 
          size="default" 
          icon={<UserOutlined />} 
          src={currentUser.photoURL} 
          style={{ marginRight: 8 }}
        />
        <span className="username">
          {currentUser.displayName || currentUser.email?.split('@')[0]}
        </span>
      </div>
    </Dropdown>
  ) : (
    <div className="auth-buttons">
      <Button type="text" href="/login">Đăng nhập</Button>
      <Button type="primary" href="/signup">Đăng ký</Button>
    </div>
  );
};

export default UserMenu;
