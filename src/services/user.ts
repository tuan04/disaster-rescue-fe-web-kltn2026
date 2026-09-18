import { get } from "@/services/axiosClient";
import type { ApiResponse } from "@/types/response";
import type { UserIDAndNameResponse } from "@/types/user";

export const getUserNames = async (): Promise<UserIDAndNameResponse[]> => {
  const response = await get<ApiResponse<UserIDAndNameResponse[]>>("/v1/users/names");
  return response.data;
};
