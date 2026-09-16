import { get } from "@/services/axiosClient";
import type { Location } from "@/types/location";
import type { ApiResponse } from "@/types/response";

export const getAllLocations = async (): Promise<Location[]> => {
  const response = await get<ApiResponse<Location[]>>("/v1/locations");
  return response.data;
};
