import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { login, logout } from '@/store/authSlice';
import { getAppStore } from '@/store/store';

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

let isRefreshing = false;
const requestsQueue: Array<{
  config: InternalAxiosRequestConfig;
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const mapUserResponse = (payload?: Record<string, unknown> | null) => {
  if (!payload) {
    return {
      id: null,
      role: 'USER',
      fullName: 'User',
      phone: null,
    };
  }

  return {
    id: (payload.id as string | number | null) ?? (payload.userId as string | number | null) ?? null,
    role: (payload.role as string) ?? (payload.roleName as string) ?? 'USER',
    fullName: (payload.fullName as string) ?? (payload.name as string) ?? 'User',
    phone: (payload.phone as string | null) ?? null,
  };
};

const refreshAccessToken = async () => {
  const refreshUrl = `${API_BASE_URL}/refresh-token`;

  try {
    const response = await axios.post(refreshUrl, null, {
      withCredentials: true,
      headers: {
        Accept: 'application/json',
      },
    });

    const payload = response.data ?? {};
    const directPayload = payload?.data ?? payload;
    const newAccessToken = directPayload.accessToken ?? null;

    if (!newAccessToken) {
      throw new Error('Refresh token response did not include accessToken');
    }

    const nextUser = mapUserResponse(directPayload.userInfoResponse ?? directPayload.user ?? null);

    getAppStore().dispatch(
      login({
        accessToken: newAccessToken,
        user: nextUser,
      }),
    );

    return newAccessToken;
  } catch (error) {
    getAppStore().dispatch(logout());

    if (typeof window !== 'undefined') {
      window.location.assign('/login');
    }

    throw error;
  }
};

axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAppStore().getState().auth.accessToken;

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (!originalRequest || !error.response) {
      return Promise.reject(error);
    }

    const endpoint = originalRequest.url ?? '';

    if (error.response.status === 401 && !endpoint.includes('/refresh-token')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          requestsQueue.push({
            config: originalRequest,
            resolve: (value) => resolve(value),
            reject: (reason) => reject(reason),
          });
        });
      }

      isRefreshing = true;

      try {
        const newAccessToken = await refreshAccessToken();
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        originalRequest._retry = true;

        requestsQueue.forEach(({ config, resolve, reject }) => {
          const retryConfig = {
            ...config,
            headers: {
              ...(config.headers ?? {}),
              Authorization: `Bearer ${newAccessToken}`,
            },
          };

          axiosClient
            .request(retryConfig)
            .then((response) => resolve(response))
            .catch((retryError) => reject(retryError));
        });

        requestsQueue.length = 0;

        return axiosClient.request(originalRequest);
      } catch (refreshError) {
        requestsQueue.forEach(({ reject }) => reject(refreshError));
        requestsQueue.length = 0;
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export const request = async <T>(config: AxiosRequestConfig) => {
  const response = await axiosClient.request<T>(config);
  return response.data;
};

export const get = async <T>(url: string, config?: AxiosRequestConfig) => {
  const response = await axiosClient.get<T>(url, config);
  return response.data;
};

export const post = async <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => {
  const response = await axiosClient.post<T>(url, data, config);
  return response.data;
};

export default axiosClient;
