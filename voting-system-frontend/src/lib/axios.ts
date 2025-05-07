import axios, { isAxiosError } from 'axios';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
  withCredentials: true, // 允许跨域请求携带 cookie
});

// 添加请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 添加响应拦截器
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 未授权，清除token并跳转到登录页
      localStorage.removeItem('token');
      // 使用 router 进行导航，而不是直接修改 window.location
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (currentPath !== '/login') {
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
      }
    } else if (error.response?.status === 403) {
      // 权限不足
      console.error('权限不足');
    } else if (error.response?.status === 404) {
      // 资源不存在
      console.error('请求的资源不存在');
    } else if (error.response?.status === 500) {
      // 服务器错误
      console.error('服务器错误');
    } else if (error.code === 'ECONNABORTED') {
      // 请求超时
      console.error('请求超时，请稍后重试');
    } else {
      // 其他错误
      console.error('请求失败:', error.message);
    }
    return Promise.reject(error);
  }
);

export { isAxiosError };
export default instance;
