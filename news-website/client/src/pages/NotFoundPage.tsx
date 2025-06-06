import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="not-found-page">
      <Result
        status="404"
        title="404"
        subTitle="Xin lỗi, trang bạn truy cập không tồn tại hoặc đã bị xóa."
        extra={
          <Button 
            type="primary" 
            onClick={() => navigate('/')}
          >
            Về trang chủ
          </Button>
        }
      />
    </div>
  );
};

export default NotFoundPage;
