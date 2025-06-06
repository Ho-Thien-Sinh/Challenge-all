import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Result, Button, Spin } from 'antd';
import { CheckCircleFilled, CloseCircleFilled, LoadingOutlined } from '@ant-design/icons';
import { useSearchParams, useNavigate } from 'react-router-dom';

// const { Title, Paragraph } = Typography; // Chưa sử dụng, tạm ẩn để tránh cảnh báo

const VerifyEmail: React.FC = () => {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'already-verified'>('verifying');
  const [searchParams] = useSearchParams();
  const { currentUser, reloadUser } = useAuth();
  const navigate = useNavigate();
  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        if (!oobCode) {
          throw new Error('Mã xác thực không hợp lệ');
        }

        // Ở đây bạn cần gọi API xác thực email với oobCode
        // Đây là ví dụ giả lập
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Nếu người dùng đã đăng nhập, cập nhật trạng thái xác thực
        if (currentUser) {
          await reloadUser();
          if (currentUser.emailVerified) {
            setStatus('already-verified');
          } else {
            setStatus('success');
          }
        } else {
          setStatus('success');
        }
      } catch (error) {
        console.error('Lỗi xác thực email:', error);
        setStatus('error');
      }
    };

    verifyEmail();
  }, [oobCode, currentUser, reloadUser]);

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <Result
            icon={<Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />}
            title="Đang xác thực email..."
            subTitle="Vui lòng chờ trong giây lát"
          />
        );
      
      case 'success':
        return (
          <Result
            status="success"
            icon={<CheckCircleFilled style={{ color: '#52c41a', fontSize: 72 }} />}
            title="Xác thực email thành công!"
            subTitle="Bạn đã xác thực email thành công. Bây giờ bạn có thể đăng nhập vào tài khoản của mình."
            extra={[
              <Button type="primary" key="login" onClick={() => navigate('/login')}>
                Đăng nhập ngay
              </Button>,
            ]}
          />
        );
      
      case 'already-verified':
        return (
          <Result
            status="info"
            icon={<CheckCircleFilled style={{ color: '#1890ff', fontSize: 72 }} />}
            title="Email đã được xác thực"
            subTitle="Email của bạn đã được xác thực trước đó."
            extra={[
              <Button type="primary" key="home" onClick={() => navigate('/')}>
                Về trang chủ
              </Button>,
            ]}
          />
        );
      
      case 'error':
      default:
        return (
          <Result
            status="error"
            icon={<CloseCircleFilled style={{ color: '#ff4d4f', fontSize: 72 }} />}
            title="Xác thực thất bại"
            subTitle="Đã xảy ra lỗi khi xác thực email. Có thể liên kết đã hết hạn hoặc không hợp lệ."
            extra={[
              <Button type="primary" key="resend" onClick={() => window.location.reload()}>
                Thử lại
              </Button>,
              <Button key="home" onClick={() => navigate('/')}>
                Về trang chủ
              </Button>,
            ]}
          />
        );
    }
  };

  return (
    <div style={{ 
      maxWidth: 800, 
      margin: '40px auto', 
      padding: '0 20px',
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      {renderContent()}
    </div>
  );
};

export default VerifyEmail;
