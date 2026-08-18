import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { store } from '@/store/store';
import { setAuth, logout } from '@/store/authSlice';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL ?? '';

const axiosClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// -------------------------------
// 1) Biến toàn cục cho refresh token
// -------------------------------
let isRefreshing = false;

type FailedRequest = {
  resolve: (token?: string | null) => void;
  reject: (error?: unknown) => void;
};

let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token ?? null);
    }
  });

  failedQueue = [];
};

// Axios instance riêng cho việc refresh token
// Không dùng axiosClient để tránh chạy lại interceptor và gây vòng lặp
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// -------------------------------
// 2) Request Interceptor
// Gắn Authorization Bearer từ Redux store
// -------------------------------
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

// -------------------------------
// 3) Response Interceptor
// Xử lý 401 Unauthorized bằng refresh token
// -------------------------------
axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    console.log(originalRequest);

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const url = originalRequest.url ?? '';

    // Bỏ qua request refresh-token để tránh loop vô hạn
    if ((status === 401 || status === 403) && !url.includes('auth/refresh-token')) {
      // Ngăn vòng lặp infinite nếu refresh token cũng 401
      originalRequest._retry = true;

      // Nếu đang refresh thì đưa request hiện tại vào hàng đợi
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (newToken) => {
              if (!originalRequest.headers) {
                originalRequest.headers = {};
              }

              if (newToken) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }

              // Retry lại request gốc sau khi refresh thành công
              resolve(
                axiosClient({
                  ...originalRequest,
                  headers: {
                    ...originalRequest.headers,
                    ...(newToken
                      ? { Authorization: `Bearer ${newToken}` }
                      : {}),
                  },
                }),
              );
            },
            reject,
          });
        });
      }

      // Không đang refresh -> bắt đầu flow refresh token
      isRefreshing = true;

      try {
        const refreshResponse = await refreshClient.post('/auth/refresh-token');

        console.log(refreshResponse);

        const newAccessToken = refreshResponse?.data?.accessToken;

        if (!newAccessToken) {
          throw new Error('Refresh token failed: accessToken is missing');
        }

        // Cập nhật Redux store với accessToken mới
        store.dispatch(
          setAuth({
            accessToken: newAccessToken,
            user: refreshResponse?.data?.userInfoResponse ?? null,
          }),
        );

        // Cập nhật Authorization cho request gốc và giải phóng hàng đợi
        if (!originalRequest.headers) {
          originalRequest.headers = {};
        }

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);

        return axiosClient({
          ...originalRequest,
          headers: {
            ...originalRequest.headers,
            Authorization: `Bearer ${newAccessToken}`,
          },
        });
      } catch (refreshError) {
        // Refresh token thất bại => logout + redirect login
        store.dispatch(logout());
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// -------------------------------
// 4) Các helper request
// -------------------------------
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