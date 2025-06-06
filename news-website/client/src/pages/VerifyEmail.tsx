import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { auth, firebaseSendEmailVerification } from '../firebase';
import { applyActionCode } from 'firebase/auth';
import { message, Result, Button, Spin } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Lấy thông tin từ URL
        const oobCode = searchParams.get('oobCode');
        
        if (!oobCode) {
          throw new Error('Mã xác thực không hợp lệ');
        }

        // Xác thực email
        await applyActionCode(auth, oobCode);
        
        // Cập nhật trạng thái xác thực
        if (auth.currentUser) {
          await auth.currentUser.reload();
        }
        
        setStatus('success');
        messageApi.success('Xác thực email thành công!');
      } catch (error) {
        console.error('Lỗi xác thực email:', error);
        setStatus('error');
        messageApi.error('Liên kết xác thực không hợp lệ hoặc đã hết hạn');
      }
    };

    verifyEmail();
  }, [searchParams, messageApi]);

  if (status === 'verifying') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large" tip="Đang xác thực email..." />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
      {contextHolder}
      <Result
        status={status === 'success' ? 'success' : 'error'}
        icon={status === 'success' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        title={
          status === 'success' 
            ? 'Xác thực email thành công!' 
            : 'Không thể xác thực email'
        }
        subTitle={
          status === 'success'
            ? 'Cảm ơn bạn đã xác thực email. Bây giờ bạn có thể đăng nhập vào tài khoản của mình.'
            : 'Liên kết xác thực không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.'
        }
        extra={[
          <Button 
            type="primary" 
            key="login" 
            onClick={() => navigate('/login')}
          >
            Đăng nhập
          </Button>,
          status === 'error' && (
            <Button 
              key="resend" 
              onClick={async () => {
                try {
                  if (auth.currentUser) {
                    await firebaseSendEmailVerification(auth.currentUser);
                    messageApi.success('Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư của bạn.');
                  }
                } catch (error) {
                  messageApi.error('Có lỗi xảy ra khi gửi lại email xác thực');
                }
              }}
            >
              Gửi lại email xác thực
            </Button>
          )
        ].filter(Boolean)}
      />
    </div>
  );
};

export default VerifyEmail;
