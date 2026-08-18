import type { UserInfoReqonse } from '@/types/auth';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type AuthState = {
  accessToken: string | null;
  user: UserInfoReqonse | null;
  isAuthenticated: boolean;
};

const initialState: AuthState = {
  accessToken: null,
  user: null,
  isAuthenticated: false,
};

const normalizeUser = (payload?: Partial<UserInfoReqonse> | null): UserInfoReqonse | null => {
  if (!payload) return null;

  return {
    id: payload.id ?? '',
    role: payload.role ?? 'CITIZEN',
    fullName: payload.fullName ?? '',
    phone: payload.phone ?? '',
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{ accessToken: string; user: Partial<UserInfoReqonse> | UserInfoReqonse | null }>,
    ) => {
      state.accessToken = action.payload.accessToken;
      state.user = normalizeUser(action.payload.user);
      state.isAuthenticated = Boolean(action.payload.accessToken);
    },
    updateAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      state.isAuthenticated = Boolean(action.payload);
    },
    logout: (state) => {
      state.accessToken = null;
      state.user = null;
      state.isAuthenticated = false;
    },
    setAuth: (
      state,
      action: PayloadAction<{
        accessToken: string | null;
        user: Partial<UserInfoReqonse> | UserInfoReqonse | null;
      }>,
    ) => {
      state.accessToken = action.payload.accessToken;
      state.user = normalizeUser(action.payload.user);
      state.isAuthenticated = Boolean(action.payload.accessToken);
    },
  },
});

export const { login, updateAccessToken, logout, setAuth } = authSlice.actions;
export default authSlice.reducer;
