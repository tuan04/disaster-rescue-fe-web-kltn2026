export type RoleEnum = 
  | 'CITIZEN'
  | 'COORDINATOR'
  | 'ADMIN'

export type LoginRequest = {
  phoneNumber: string;
  password: string;
};

export interface UserInfoReqonse {
  id: string;
  role: RoleEnum,
  fullName: string,
  phone: string
}

export interface LoginResponse {
  accessToken: string;
  userInfoResponse: UserInfoReqonse;
}
