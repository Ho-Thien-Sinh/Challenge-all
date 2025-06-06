import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Typography, Alert, Spin, Button } from 'antd';
import { verifyEmail } from '../services/auth.service'; // We will create this function next

const { Title, Paragraph } = Typography;

const VerifyEmailPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    if (!token) {
      setVerificationStatus('error');
      setErrorMessage('Token xác minh không hợp lệ hoặc không tồn tại.');
      setIsVerifying(false);
      return;
    }

    const verifyEmailToken = async () => {
      try {
        await verifyEmail(token);
        setVerificationStatus('success');
      } catch (error: any) {
        console.error('Verification failed:', error);
        setVerificationStatus('error');
        // You can customize the error message based on the error response from the backend if available.
        setErrorMessage(error?.response?.data?.message || 'Xác minh email thất bại. Vui lòng thử lại hoặc liên hệ hỗ trợ.');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmailToken();
  }, [location]);

  const handleGoToLogin = () => {
    navigate('/login');
  };

  if (isVerifying) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <Spin size="large" />
        <Paragraph>Đang xác minh email của bạn...</Paragraph>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
      <Title level={2}>Xác minh Email</Title>
      {verificationStatus === 'success' && (
        <Alert
          message="Xác minh Email Thành Công"
          description="Email của bạn đã được xác minh thành công. Bạn có thể đăng nhập ngay bây giờ."
          type="success"
          showIcon
          action={
            <Button size="small" type="primary" onClick={handleGoToLogin}>
              Đi đến Đăng nhập
            </Button>
          }
        />
      )}
      {verificationStatus === 'error' && (
        <Alert
          message="Xác minh Email Thất Bại"
          description={errorMessage || 'Đã xảy ra lỗi trong quá trình xác minh. Vui lòng thử lại sau.'}
          type="error"
          showIcon
        />
      )}
    </div>
  );
};

export default VerifyEmailPage; 