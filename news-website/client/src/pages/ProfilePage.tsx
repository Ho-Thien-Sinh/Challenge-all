import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import { auth, storage, ref, uploadBytes, getDownloadURL } from '../firebase';
import { 
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  message, 
  Tabs, 
  Upload, 
  Avatar, 
  Typography,
  Select,
  DatePicker,
  Space,
  type TabsProps,
  type UploadProps
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { 
  UserOutlined, 
  LockOutlined,
  CheckCircleOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  MailOutlined,
  CameraOutlined
} from '@ant-design/icons';
import './ProfilePage.css';

// Xóa dòng không sử dụng
interface ProfileFormValues {
  displayName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: Dayjs | null;
  gender?: 'male' | 'female' | 'other' | null;
  bio?: string;
}

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const { Title, Text } = Typography;

const ProfilePage: React.FC = () => {
  const { currentUser, updateUserProfile, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileForm] = Form.useForm<ProfileFormValues>();
  const [passwordForm] = Form.useForm<PasswordFormValues>();
  const [activeTab, setActiveTab] = useState('profile');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(currentUser?.photoURL || undefined);
  
  const handleBack = () => {
    navigate('/');
  };

  useEffect(() => {
    if (currentUser) {
      profileForm.setFieldsValue({
        displayName: currentUser.displayName || '',
        email: currentUser.email || '',
        phoneNumber: currentUser.phoneNumber || '',
        address: currentUser.address || '',
        dateOfBirth: currentUser.dateOfBirth ? dayjs(currentUser.dateOfBirth) : null,
        gender: currentUser.gender,
        bio: currentUser.bio || '',
      });
      if (currentUser.photoURL) {
        setAvatarUrl(currentUser.photoURL);
      }
    }
  }, [currentUser, profileForm]);

  const handleProfileUpdate = async (values: ProfileFormValues) => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      // Prepare the data to update
      const updateData = {
        displayName: values.displayName,
        phoneNumber: values.phoneNumber || '',
        address: values.address || '',
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : '',
        gender: values.gender || null,
        bio: values.bio || ''
      };
      
      await updateUserProfile(updateData);
      message.success('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Có lỗi xảy ra khi cập nhật thông tin!');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (values: PasswordFormValues) => {
    try {
      setLoading(true);
      
      // First, reauthenticate the user
      if (!auth.currentUser?.email) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }
      
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        values.currentPassword
      );
      
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Then update the password
      await updatePassword(values.newPassword);
      
      message.success('Đổi mật khẩu thành công');
      passwordForm.resetFields();
    } catch (error: unknown) {
      console.error('Error updating password:', error);
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi đổi mật khẩu';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // File upload validation is handled in the Upload component's beforeUpload prop

  const handleAvatarChange: UploadProps['onChange'] = async (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }

    if (info.file.status === 'done') {
      try {
        const file = info.file.originFileObj as File;
        
        // Create a unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const storageRef = ref(storage, `avatars/${fileName}`);
        
        // Upload the file to Firebase Storage
        const snapshot = await uploadBytes(storageRef, file);
        
        // Get the download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        // Update the avatar URL in the state
        setAvatarUrl(downloadURL);
        
        // Prepare the update data with all required fields
        const updateData = {
          photoURL: downloadURL, // Use the Firebase Storage URL
          displayName: currentUser?.displayName || '',
          phoneNumber: currentUser?.phoneNumber || '',
          address: currentUser?.address || '',
          dateOfBirth: currentUser?.dateOfBirth ? dayjs(currentUser.dateOfBirth).format('YYYY-MM-DD') : '',
          gender: currentUser?.gender || null,
          bio: currentUser?.bio || ''
        };
        
        // Update user's profile with the new photo URL
        await updateUserProfile(updateData);
        
        message.success('Cập nhật ảnh đại diện thành công');
      } catch (error) {
        console.error('Error updating avatar:', error);
        message.error('Có lỗi xảy ra khi cập nhật ảnh đại diện');
      } finally {
        setLoading(false);
      }
    } else if (info.file.status === 'error') {
      setLoading(false);
      message.error('Có lỗi xảy ra khi tải lên ảnh đại diện');
    }
  };

  if (!currentUser) {
    return <div>Vui lòng đăng nhập để xem trang này</div>;
  }

  const tabItems: TabsProps['items'] = [
    {
      key: 'profile',
      label: 'Thông tin cá nhân',
      children: (
        <Form
          form={profileForm}
          layout="vertical"
          onFinish={handleProfileUpdate}
          className="profile-form"
        >
          <div className="profile-section">
            <Title level={4} className="section-title">Thông tin cá nhân</Title>
            <div className="form-row">
              <Form.Item
                label="Họ và tên"
                name="displayName"
                className="form-item"
                rules={[
                  { required: true, message: 'Vui lòng nhập họ và tên!' },
                  { min: 3, message: 'Tên phải có ít nhất 3 ký tự!' },
                ]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="Nhập họ và tên"
                  disabled={loading}
                />
              </Form.Item>

              <Form.Item
                label="Giới tính"
                name="gender"
                className="form-item"
              >
                <Select
                  placeholder="Chọn giới tính"
                  disabled={loading}
                  options={[
                    { value: 'male', label: 'Nam' },
                    { value: 'female', label: 'Nữ' },
                    { value: 'other', label: 'Khác' },
                  ]}
                />
              </Form.Item>
            </div>

            <div className="form-row">
              <Form.Item
                label="Ngày sinh"
                name="dateOfBirth"
                className="form-item"
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày sinh"
                  disabled={loading}
                />
              </Form.Item>

              <Form.Item
                label="Số điện thoại"
                name="phoneNumber"
                className="form-item"
                rules={[
                  {
                    pattern: /^[0-9]{10,11}$/,
                    message: 'Số điện thoại không hợp lệ!',
                  },
                ]}
              >
                <Input 
                  prefix={<PhoneOutlined />} 
                  placeholder="Nhập số điện thoại"
                  disabled={loading}
                />
              </Form.Item>
            </div>

            <Form.Item
              label="Địa chỉ"
              name="address"
              className="form-item-full"
            >
              <Input 
                prefix={<EnvironmentOutlined />} 
                placeholder="Nhập địa chỉ"
                disabled={loading}
              />
            </Form.Item>
          </div>

          <div className="profile-section">
            <Title level={4} className="section-title">Thông tin tài khoản</Title>
            <Form.Item
              label="Email"
              name="email"
              className="form-item-full"
            >
              <Input 
                prefix={<MailOutlined />} 
                disabled 
              />
            </Form.Item>

            <Form.Item
              label="Giới thiệu bản thân"
              name="bio"
              className="form-item-full"
            >
              <Input.TextArea 
                rows={4} 
                placeholder="Giới thiệu đôi nét về bản thân..."
                disabled={loading}
                maxLength={500}
                showCount
              />
            </Form.Item>
          </div>

          <Form.Item className="form-actions">
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<CheckCircleOutlined />}
              size="large"
            >
              Lưu thay đổi
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'password',
      label: 'Đổi mật khẩu',
      children: (
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordUpdate}
          className="password-form"
        >
          <Form.Item
            label="Mật khẩu hiện tại"
            name="currentPassword"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Nhập mật khẩu hiện tại"
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Nhập mật khẩu mới"
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu mới"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Nhập lại mật khẩu mới"
              disabled={loading}
            />
          </Form.Item>

          <Form.Item className="form-actions">
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<LockOutlined />}
              size="large"
            >
              Đổi mật khẩu
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <div className="profile-container">
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={handleBack}
        className="back-button"
      >
        Quay lại
      </Button>

      <Card className="profile-card">
        <div className="profile-header">
          <Space direction="vertical" align="center" size={16}>
            <div className="avatar-container">
              <Upload
                name="avatar"
                listType="picture-circle"
                className="avatar-uploader"
                showUploadList={false}
                beforeUpload={(file) => {
                  // Check file type
                  const isImage = file.type.startsWith('image/');
                  if (!isImage) {
                    message.error('Chỉ chấp nhận file ảnh!');
                    return Upload.LIST_IGNORE;
                  }
                  
                  // Check file size (max 5MB)
                  const isLt5M = file.size / 1024 / 1024 < 5;
                  if (!isLt5M) {
                    message.error('Kích thước ảnh không được vượt quá 5MB!');
                    return Upload.LIST_IGNORE;
                  }
                  
                  // Show preview
                  const reader = new FileReader();
                  reader.readAsDataURL(file);
                  reader.onload = () => {
                    setAvatarUrl(reader.result as string);
                  };
                  
                  // Return false to prevent default upload
                  return false;
                }}
                onChange={handleAvatarChange}
                disabled={loading}
                customRequest={({ onSuccess }) => {
                  // This will be handled by our onChange handler
                  // We just need to call onSuccess to update the UI
                  const timer = setTimeout(() => {
                    onSuccess?.('ok');
                    clearTimeout(timer);
                  }, 100);
                  return {
                    abort() {
                      console.log('Upload aborted');
                    },
                  };
                }}
              >
                {avatarUrl ? (
                  <Avatar 
                    size={100} 
                    src={avatarUrl} 
                    icon={<UserOutlined />} 
                    className="profile-avatar"
                  />
                ) : (
                  <div className="avatar-upload-trigger">
                    <CameraOutlined style={{ fontSize: 24 }} />
                    <div>Tải ảnh lên</div>
                  </div>
                )}
              </Upload>
            </div>
            
            <div className="user-info">
              <Title level={3} className="user-name">
                {currentUser.displayName || 'Người dùng'}
              </Title>
              <div className="user-email">
                <Text>{currentUser.email}</Text>
                {currentUser.emailVerified && (
                  <span className="email-verified">
                    <CheckCircleOutlined style={{ marginRight: 4 }} />
                    Đã xác thực
                  </span>
                )}
              </div>
            </div>
          </Space>
        </div>

        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          className="profile-tabs"
          items={tabItems}
        />
      </Card>
    </div>
  );
};

export default ProfilePage;
