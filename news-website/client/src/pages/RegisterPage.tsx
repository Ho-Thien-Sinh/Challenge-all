import React, { useState } from 'react';
import { Form, Input, Button, Typography, message, Spin } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const onFinish = async (values: {
    email: string;
    password: string;
    confirmPassword: string;
    displayName: string;
  }) => {
    if (values.password !== values.confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    try {
      setLoading(true);
      await signup(values.email, values.password, values.displayName);
      message.success('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.');
      navigate('/dang-nhap');
    } catch (error: any) {
      console.error('Registration failed:', error);
      const errorMessage = error.message || 'Đăng ký thất bại. Vui lòng thử lại sau.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Validation Failed:', errorInfo);
  };

  return (
    <div className="register-page" style={{ maxWidth: 500, margin: '0 auto', padding: '20px' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>Đăng ký tài khoản</Title>
      
      <Spin spinning={loading}>
        <Form
          name="register"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          layout="vertical"
          size="large"
        >
          <Form.Item
            label="Họ và tên"
            name="displayName"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên của bạn!' }]}
          >
            <Input placeholder="Nhập họ và tên đầy đủ" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
          >
            <Input placeholder="example@email.com" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
            ]}
            hasFeedback
          >
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
            hasFeedback
          >
            <Input.Password placeholder="Nhập lại mật khẩu" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Đăng ký
            </Button>
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              Đã có tài khoản? <Link to="/dang-nhap">Đăng nhập ngay</Link>
            </div>
          </Form.Item>
          
          <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 16 }}>
            Bằng việc đăng ký, bạn đã đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của chúng tôi.
          </Text>
        </Form>
      </Spin>
    </div>
  );
};

export default RegisterPage;