import React from 'react';
import { Card, Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <h2>Bạn chưa đăng nhập</h2>
          <Button 
            variant="primary" 
            onClick={() => navigate('/login')}
            className="mt-3"
          >
            Đăng nhập
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4">Thông tin tài khoản</h2>
      
      <Card className="shadow-sm">
        <Card.Body>
          <Row>
            <Col md={4} className="border-end">
              <div className="text-center py-3">
                <div className="mb-3">
                  <div 
                    className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                    style={{ width: '100px', height: '100px', fontSize: '2.5rem' }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <h4>{user.name}</h4>
                <p className="text-muted">{user.email}</p>
                <Button 
                  variant="outline-danger" 
                  onClick={handleLogout}
                  className="mt-2"
                >
                  Đăng xuất
                </Button>
              </div>
            </Col>
            
            <Col md={8}>
              <div className="p-3">
                <h5 className="mb-3">Thông tin chi tiết</h5>
                
                <div className="mb-3">
                  <p className="mb-1 text-muted">Họ tên</p>
                  <p className="fw-bold">{user.name}</p>
                </div>
                
                <div className="mb-3">
                  <p className="mb-1 text-muted">Email</p>
                  <p className="fw-bold">{user.email}</p>
                </div>
                
                <div className="mb-3">
                  <p className="mb-1 text-muted">Trạng thái</p>
                  <p className="fw-bold">
                    {user.isVerified ? (
                      <span className="text-success">Đã xác thực</span>
                    ) : (
                      <span className="text-warning">Chưa xác thực</span>
                    )}
                  </p>
                </div>
                
                <div className="mb-3">
                  <p className="mb-1 text-muted">Ngày tham gia</p>
                  <p className="fw-bold">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ProfilePage;