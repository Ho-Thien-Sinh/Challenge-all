import api, { apiService } from './api';

export const login = async (usernameOrEmail: string, password: string) => {
  try {
    const response = await apiService.login(usernameOrEmail, password);
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const register = async (username: string, email: string, password: string) => {
  try {
    const response = await apiService.register({
      name: username,
      email,
      password
    });
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

export const verifyEmail = async (token: string) => {
  try {
    const response = await api.get(`/auth/verify-email/${token}`);
    return response.data;
  } catch (error) {
    console.error('Email verification failed:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await apiService.getMe();
    return response.data;
  } catch (error) {
    console.error('Failed to get current user:', error);
    throw error;
  }
};

export const logout = () => {
  apiService.logout();
};