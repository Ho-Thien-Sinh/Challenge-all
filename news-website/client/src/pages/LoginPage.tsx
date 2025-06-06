import React, { useState } from 'react';
import { Form, Input, Button, Typography, message, Spin } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Title } = Typography;

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values: { usernameOrEmail: string; password: string }) => {
    try {
      setLoading(true);
      await login(values.usernameOrEmail, values.password);
      message.success('Đăng nhập thành công!');
      navigate('/');
    } catch (error: any) {
      console.error('Login failed:', error);
      const errorMessage = error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
    message.error('Vui lòng điền đầy đủ thông tin đăng nhập.');
  };

  return (
    <div className="login-page">
      <Title level={2}>Đăng nhập</Title>
      <Spin spinning={loading}>
        <Form
          name="basic"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            label="Email"
            name="usernameOrEmail"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input placeholder="Nhập email của bạn" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>


          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Đăng nhập
            </Button>
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              Chưa có tài khoản? <Link to="/dang-ky">Đăng ký ngay</Link>
            </div>
          </Form.Item>
        </Form>
      </Spin>
    </div>
  );
};

export default LoginPage; 