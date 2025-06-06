import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp, FloatButton } from 'antd';
import { ArrowUpOutlined, CustomerServiceOutlined, CommentOutlined } from '@ant-design/icons';
import viVN from 'antd/locale/vi_VN';
import 'antd/dist/reset.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './index.css';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ArticlePage from './pages/ArticlePage';
import SearchPage from './pages/SearchPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';

// Context
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import theme from './theme';
import PrivateRoute from './components/auth/PrivateRoute';
import ProfilePage from './pages/ProfilePage';
import TuoiTreNewsPage from './pages/TuoiTreNewsPage';
import Chatbot from './components/Chatbot';

const App: React.FC = () => {
  // Thêm class cho body khi component mount
  useEffect(() => {
    document.body.classList.add('tuoitre-theme');
    
    return () => {
      document.body.classList.remove('tuoitre-theme');
    };
  }, []);

  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        ...theme,
        hashed: false, // Tắt hash cho className để dễ dàng ghi đè style
      }}
    >
      <AuthProvider>
        <AppProvider>
          <AntdApp>
          <Router>
            <div className="app">
              <Routes>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/danh-muc/:slug" element={<CategoryPage />} />
                  <Route path="/bai-viet/:slug" element={<ArticlePage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/tim-kiem" element={<Navigate to="/search" replace />} />
                  <Route path="/dang-nhap" element={<LoginPage />} />
                  <Route path="/dang-ky" element={<RegisterPage />} />
                  <Route path="/xac-thuc-email" element={<VerifyEmailPage />} />
                  <Route 
                    path="/tai-khoan" 
                    element={
                      <PrivateRoute>
                        <ProfilePage />
                      </PrivateRoute>
                    } 
                  />
                  <Route path="/tin-tuc-tuoi-tre" element={<TuoiTreNewsPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>

              {/* Floating Action Buttons */}
              <FloatButton.Group
                trigger="hover"
                type="primary"
                style={{ right: 24, bottom: 24 }}
                icon={<CustomerServiceOutlined />}
              >
                <FloatButton
                  icon={<ArrowUpOutlined />}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  tooltip="Lên đầu trang"
                />
                <FloatButton
                  icon={<CommentOutlined />}
                  onClick={() => {}}
                  tooltip="Góp ý"
                />
              </FloatButton.Group>
              <FloatButton.BackTop visibilityHeight={300} />
            </div>
            <Chatbot />
          </Router>
          </AntdApp>
        </AppProvider>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;
