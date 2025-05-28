import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Container, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Kiểm tra xem có thông báo xác thực email thành công không
  const [emailVerified, setEmailVerified] = useState(false);
  
  useEffect(() => {
    // Kiểm tra query params
    const params = new URLSearchParams(location.search);
    if (params.get('verified') === 'true') {
      setEmailVerified(true);
    }
    
    // Nếu đã đăng nhập, chuyển hướng đến trang chủ
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate, location]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      const result = await login(formData);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      setError('Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-center">
        <Card className="shadow" style={{ maxWidth: '500px', width: '100%' }}>
          <Card.Body className="p-4">
            <h2 className="text-center mb-4">Đăng nhập</h2>
            
            {emailVerified && (
              <Alert variant="success" className="mb-4">
                Email của bạn đã được xác thực thành công! Bạn có thể đăng nhập ngay bây giờ.
              </Alert>
            )}
            
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Nhập địa chỉ email"
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Mật khẩu</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Nhập mật khẩu"
                />
              </Form.Group>

              <div className="d-grid">
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                </Button>
              </div>
            </Form>
            
            <div className="text-center mt-3">
              <p>
                Chưa có tài khoản?{' '}
                <Link to="/register" className="text-decoration-none">
                  Đăng ký
                </Link>
              </p>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default LoginPage;