import React from 'react';
import { Navbar, Nav, Container, NavDropdown, Button, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const currentDate = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="tuoitre-header">
      {/* Top header with logo and user info */}
      <Container className="py-2">
        <Row className="align-items-center">
          <Col md={4} className="d-flex align-items-center">
            <Link to="/" className="me-3">
              <img
                src={process.env.PUBLIC_URL + '/tuoitre-logo.svg'}
                height="40"
                className="tuoitre-logo"
                alt="Tuổi Trẻ Logo"
                style={{ objectFit: 'contain' }}
              />
            </Link>
          </Col>
          <Col md={4} className="text-center d-none d-md-block">
            <small className="text-muted">{currentDate}</small>
          </Col>
          <Col md={4} className="text-end">
            {isAuthenticated ? (
              <div className="d-flex align-items-center justify-content-end">
                <img 
                  src="https://static-tuoitre.tuoitre.vn/tuoitre/web_images/userdeffault.jpg" 
                  alt="User" 
                  className="rounded-circle me-2" 
                  width="30" 
                  height="30" 
                />
                <NavDropdown 
                  title={user?.name || 'Tài khoản'} 
                  id="user-dropdown"
                  align="end"
                >
                  <NavDropdown.Item as={Link} to="/profile">
                    <i className="bi bi-person me-2"></i>
                    Thông tin tài khoản
                  </NavDropdown.Item>
                  {isAdmin && (
                    <>
                      <NavDropdown.Item as={Link} to="/crawler">
                        <i className="bi bi-robot me-2"></i>
                        Quản lý Crawler
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/admin/articles">
                        <i className="bi bi-newspaper me-2"></i>
                        Quản lý bài viết
                      </NavDropdown.Item>
                    </>
                  )}
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Đăng xuất
                  </NavDropdown.Item>
                </NavDropdown>
              </div>
            ) : (
              <div>
                <Link to="/login" className="btn btn-sm btn-link text-decoration-none">Đăng nhập</Link>
                <Link to="/register" className="btn btn-sm btn-outline-primary ms-2">Đăng ký</Link>
              </div>
            )}
          </Col>
        </Row>
      </Container>
      
      {/* Main navigation menu */}
      <div className="tuoitre-menu border-top">
        <Container>
          <Navbar expand="lg" className="p-0">
            <Navbar.Toggle aria-controls="main-navbar" className="ms-auto my-2" />
            <Navbar.Collapse id="main-navbar">
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/" className="px-3">
                  <i className="bi bi-house-door"></i>
                </Nav.Link>
                <Nav.Link as={Link} to="/category/thoi-su">THỜI SỰ</Nav.Link>
                <Nav.Link as={Link} to="/category/the-gioi">THẾ GIỚI</Nav.Link>
                <Nav.Link as={Link} to="/category/phap-luat">PHÁP LUẬT</Nav.Link>
                <Nav.Link as={Link} to="/category/kinh-doanh">KINH DOANH</Nav.Link>
                <Nav.Link as={Link} to="/category/cong-nghe">CÔNG NGHỆ</Nav.Link>
                <Nav.Link as={Link} to="/category/xe">XE</Nav.Link>
                <Nav.Link as={Link} to="/category/du-lich">DU LỊCH</Nav.Link>
                <Nav.Link as={Link} to="/category/van-hoa">VĂN HÓA</Nav.Link>
                <Nav.Link as={Link} to="/category/giai-tri">GIẢI TRÍ</Nav.Link>
                <Nav.Link as={Link} to="/category/the-thao">THỂ THAO</Nav.Link>
                <Nav.Link as={Link} to="/category/giao-duc">GIÁO DỤC</Nav.Link>
                <Nav.Link as={Link} to="/category/suc-khoe">SỨC KHỎE</Nav.Link>
                {isAdmin && (
                  <Nav.Link as={Link} to="/crawler" className="text-danger">
                    <i className="bi bi-robot me-1"></i>
                    CRAWLER
                  </Nav.Link>
                )}
              </Nav>
            </Navbar.Collapse>
          </Navbar>
        </Container>
      </div>
    </header>
  );
};

export default Header;