import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { store } from '@/store/store';
import { login, logout } from '@/store/authSlice';
import type { RoleEnum, UserInfoReqonse } from '@/types/auth';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL ?? '';

// -------------------------------------------------------------
// 1) Khởi tạo Axios Instance chính và Refresh Client riêng biệt
// -------------------------------------------------------------
const axiosClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Client riêng cho refresh token để tránh chạy lại interceptor gây lặp vô hạn
const refreshClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// -------------------------------------------------------------
// 2) Quản lý hàng đợi khi refresh token
// -------------------------------------------------------------
let isRefreshing = false;

type QueuedRequest = {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
};

let failedQueue: QueuedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

const mapUserResponse = (payload?: Record<string, unknown> | null): UserInfoReqonse | null => {
  if (!payload) {
    return null;
  }

  return {
    id: String(payload.id ?? payload.userId ?? ''),
    role: ((payload.role as string) ?? (payload.roleName as string) ?? 'CITIZEN') as RoleEnum,
    fullName: String(payload.fullName ?? payload.name ?? 'User'),
    phone: String(payload.phone ?? ''),
  };
};

const refreshAccessToken = async (): Promise<string> => {
  try {
    const response = await refreshClient.post('/v1/auth/refresh-token');

    const payload = response.data ?? {};
    const directPayload = payload?.data ?? payload;
    const newAccessToken = directPayload.accessToken ?? null;

    if (!newAccessToken) {
      throw new Error('Refresh token response did not include accessToken');
    }

    const nextUser = mapUserResponse(directPayload.userInfoResponse ?? directPayload.user ?? null);

    store.dispatch(
      login({
        accessToken: newAccessToken,
        user: nextUser,
      }),
    );

    return newAccessToken;
  } catch (error) {
    store.dispatch(logout());
    throw error;
  }
};

// -------------------------------------------------------------
// 3) Request Interceptor: Gắn Bearer Token từ Redux Store
// -------------------------------------------------------------
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = store.getState().auth.accessToken;

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// -------------------------------------------------------------
// 4) Response Interceptor: Tự động refresh token khi 401
// -------------------------------------------------------------
axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (!originalRequest || !error.response) {
      return Promise.reject(error);
    }

    const endpoint = originalRequest.url ?? '';

    // Bỏ qua không refresh token đối với các API đăng nhập hoặc chính refresh-token
    const isExcludedFromRefresh =
      endpoint.includes('/login') ||
      endpoint.includes('/refresh-token');

    if (error.response.status === 401 && !isExcludedFromRefresh) {
      if (originalRequest._retry) {
        return Promise.reject(error);
      }
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              if (token) {
                originalRequest.headers = originalRequest.headers ?? {};
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(axiosClient.request(originalRequest));
            },
            reject: (err) => reject(err),
          });
        });
      }

      isRefreshing = true;

      try {
        const newAccessToken = await refreshAccessToken();

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);

        return axiosClient.request(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// -------------------------------------------------------------
// 5) Helper Request Methods
// -------------------------------------------------------------
export const request = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const response = await axiosClient.request<T>(config);
  return response.data;
};

export const get = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response = await axiosClient.get<T>(url, config);
  return response.data;
};

export const post = async <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const response = await axiosClient.post<T>(url, data, config);
  return response.data;
};

export const put = async <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const response = await axiosClient.put<T>(url, data, config);
  return response.data;
};

export const patch = async <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const response = await axiosClient.patch<T>(url, data, config);
  return response.data;
};

export const del = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response = await axiosClient.delete<T>(url, config);
  return response.data;
};

export default axiosClient;
