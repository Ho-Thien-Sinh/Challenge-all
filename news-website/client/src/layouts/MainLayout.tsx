import React, { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import Header from '../components/Header';
import CategoryMenu from '../components/CategoryMenu';
import Footer from '../components/Footer';
import '../styles/MainLayout.css';
import '../styles/CategoryMenu.css';

const { Content } = Layout;

interface MainLayoutProps {
  children?: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <Layout className="main-layout" style={{ minHeight: '100vh' }}>
      <Header />
      <CategoryMenu />
      <Content 
        className="main-content" 
        style={{
          paddingTop: '20px',
          backgroundColor: '#f5f5f5',
          minHeight: 'calc(100vh - 130px)'
        }}
      >
        <div 
          className="container" 
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 15px',
            width: '100%'
          }}
        >
          {children || <Outlet />}
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default MainLayout;
