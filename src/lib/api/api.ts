import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, AxiosError } from 'axios';
import { envConfig } from '../config/env';
import { navigateTo } from '@/app/routes/navigate';

export const AUTH_TOKEN_KEY = 'auth_token';

const api: AxiosInstance = axios.create({
  baseURL: envConfig.get('API_BASE_URL'),
  timeout: envConfig.get('API_TIMEOUT'),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        navigateTo("auth/login")
    }
    return Promise.reject(error);
  }
);

export default api;
