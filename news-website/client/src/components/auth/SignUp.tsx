import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Input, message } from 'antd';
import { useAuth } from '../../contexts/AuthContext';

const SignUp: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values: { email: string; password: string; confirm: string; displayName: string }): Promise<void> => {
    if (values.password !== values.confirm) {
      message.error('Mật khẩu xác nhận không khớp!');
      return;
    }
    
    try {
      setLoading(true);
      // Tạo tên hiển thị mặc định từ email nếu không nhập
      const displayName = values.displayName || values.email.split('@')[0];
      
      // Gọi hàm đăng ký
      await signup(values.email, values.password, displayName);
      
      // Hiển thị thông báo thành công
      message.success({
        content: (
          <div>
            <p>Đăng ký thành công!</p>
            <p>Vui lòng kiểm tra email <strong>{values.email}</strong> để xác thực tài khoản.</p>
            <p>Nếu không thấy email, vui lòng kiểm tra thư mục spam.</p>
          </div>
        ),
        duration: 10, // Hiển thị trong 10 giây
      });
      
      // Chuyển hướng về trang đăng nhập
      navigate('/login');
    } catch (error: any) {
      console.error('Lỗi đăng ký:', error);
      message.error({
        content: error.message || 'Có lỗi xảy ra khi đăng ký tài khoản',
        duration: 5,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Đăng ký tài khoản</h2>
      <Form
        name="signup"
        onFinish={onFinish}
        layout="vertical"
      >
        <Form.Item
          label="Tên hiển thị"
          name="displayName"
          rules={[
            { required: false, message: 'Vui lòng nhập tên hiển thị!' },
          ]}
        >
          <Input placeholder="Tùy chọn, mặc định sẽ lấy từ email" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Vui lòng nhập email!' },
            { type: 'email', message: 'Email không hợp lệ!' },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu!' },
            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="Xác nhận mật khẩu"
          name="confirm"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu không khớp!'));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Đăng ký
          </Button>
        </Form.Item>
      </Form>
      <div style={{ textAlign: 'center' }}>
        Đã có tài khoản? <a href="/login">Đăng nhập ngay</a>
      </div>
    </div>
  );
};

export default SignUp;
