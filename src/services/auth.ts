import axiosClient from '@/services/axiosClient';
import type { LoginRequest, LoginResponse } from '@/types/auth';
import type { ApiResponse } from '@/types/response';


export const loginApi = async (payload: LoginRequest) => {
  const response = await axiosClient.post<ApiResponse<LoginResponse>>('/v1/auth/login', payload, {
    headers: {
      'X-Client-Type': 'WEB',
    },
  });

  return response.data.data;
};



export const refreshToken = async () => {
  const response = await axiosClient.post<ApiResponse<LoginResponse>>('/v1/auth/refresh-token');
  return response.data.data;
};

export const logoutApi = async () => {
  const response = await axiosClient.post<ApiResponse<null>>('/v1/auth/logout');
  return response.data;
};
