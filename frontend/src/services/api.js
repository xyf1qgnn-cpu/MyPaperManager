import axios from 'axios';
import { message } from 'antd';

// 创建 axios 实例
const api = axios.create({
  baseURL: '/api',
  timeout: 30000, // 30秒超时
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    // 直接返回 data
    return response.data;
  },
  (error) => {
    // 统一处理错误
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        // 未授权
        message.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (status === 500) {
        message.error(data.message || 'Server Internal Error');
      } else {
        message.error(data.message || `Error ${status}`);
      }
      
      return Promise.reject(data); 
    } else if (error.request) {
      message.error('Network Error: No response received');
      return Promise.reject({ message: 'Network error' });
    } else {
      message.error(error.message);
      return Promise.reject(error);
    }
  }
);

export default api;
