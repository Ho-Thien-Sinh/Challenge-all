import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as apiLogin, logout as apiLogout, getCurrentUser, isAuthenticated } from '../services/api';

// Tạo context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Kiểm tra xem người dùng đã đăng nhập chưa khi component mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        if (isAuthenticated()) {
          const storedUser = JSON.parse(localStorage.getItem('user'));
          setUser(storedUser);
          
          // Cập nhật thông tin người dùng từ server
          try {
            const response = await getCurrentUser();
            if (response.success) {
              setUser(response.data);
            }
          } catch (error) {
            console.error('Failed to fetch current user:', error);
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Đăng nhập
  const login = async (credentials) => {
    try {
      setError(null);
      const response = await apiLogin(credentials);
      
      if (response.success) {
        setUser(response.data.user);
        return { success: true };
      } else {
        setError(response.message || 'Đăng nhập thất bại');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Đăng nhập thất bại';
      setError(message);
      return { success: false, message };
    }
  };

  // Đăng xuất
  const logout = () => {
    apiLogout();
    setUser(null);
  };

  // Kiểm tra xem người dùng có phải là admin không
  const isAdmin = user && user.role === 'admin';

  // Giá trị context
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook để sử dụng context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;