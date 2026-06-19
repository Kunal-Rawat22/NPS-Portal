import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { isApiEnvelope, isApiResponseList } from '../types/api';
import { refreshAccessToken } from './tokenRefresh';
import { showToast } from '../utils/toast';
import { triggerSessionExpired } from '../utils/sessionExpired';
import { store } from '../store';
import { setCredentials } from '../store/authSlice';
import { AuthResponse } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

const AUTH_SKIP_REFRESH = ['/auth/login', '/auth/google', '/auth/refresh'];

const shouldSkipRefresh = (url?: string) =>
  !!url && AUTH_SKIP_REFRESH.some(path => url.includes(path));

const shouldToastSuccess = (method?: string, url?: string) => {
  const m = method?.toUpperCase();
  if (m !== 'POST' && m !== 'PUT' && m !== 'PATCH' && m !== 'DELETE') return false;
  if (url?.includes('/surveys/') && url.includes('/responses') && m === 'POST') return false;
  return true;
};

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
};

const persistSession = (data: AuthResponse) => {
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  localStorage.setItem('user', JSON.stringify(data.user));
  store.dispatch(setCredentials(data));
};

const attemptTokenRefresh = async (originalRequest: InternalAxiosRequestConfig) => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    triggerSessionExpired();
    throw new Error('No refresh token');
  }

  if (isRefreshing) {
    const token = await new Promise<string>((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
    originalRequest.headers.Authorization = `Bearer ${token}`;
    return api(originalRequest);
  }

  isRefreshing = true;
  originalRequest._retry = true;

  try {
    const data = await refreshAccessToken(refreshToken);
    persistSession(data);
    processQueue(null, data.accessToken);
    originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
    return api(originalRequest);
  } catch (refreshError) {
    processQueue(refreshError, null);
    triggerSessionExpired();
    throw refreshError;
  } finally {
    isRefreshing = false;
  }
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => {
    const body = res.data;
    if (isApiEnvelope(body)) {
      if (body.status) {
        if (shouldToastSuccess(res.config.method, res.config.url)) {
          showToast(body.message, 'success');
        }
      } else {
        showToast(body.message, 'error');
      }
      res.data = isApiResponseList(body) ? body.data : (body.data ?? null);
    }
    return res;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    if (
      status === 401 &&
      originalRequest &&
      !shouldSkipRefresh(originalRequest.url) &&
      !originalRequest._retry
    ) {
      try {
        return await attemptTokenRefresh(originalRequest);
      } catch {
        return Promise.reject(error);
      }
    }

    if (status === 401 && originalRequest && !shouldSkipRefresh(originalRequest.url)) {
      triggerSessionExpired();
      return Promise.reject(error);
    }

    const errorBody = error.response?.data;
    if (isApiEnvelope(errorBody)) {
      showToast(errorBody.message, 'error');
    } else if (typeof errorBody === 'object' && errorBody !== null && 'message' in errorBody) {
      showToast(String((errorBody as { message: string }).message), 'error');
    } else if (error.message && status !== 401) {
      showToast('Something went wrong. Please try again.', 'error');
    }

    return Promise.reject(error);
  }
);

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

export default api;
