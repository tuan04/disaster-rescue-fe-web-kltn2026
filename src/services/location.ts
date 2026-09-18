import { get, post, patch } from "@/services/axiosClient";
import type {
  CreateLocationRequest,
  Location,
  LocationFilterParams,
  LocationPageResponse,
  UpdateLocationRequest,
} from "@/types/location";
import type { SpringPageResponse } from "@/types/mapPoint";
import type { ApiResponse } from "@/types/response";

export const getAllLocations = async (): Promise<Location[]> => {
  const response = await get<ApiResponse<Location[]>>("/v1/locations");
  return response.data;
};

export const getLocationPages = async (
  params: LocationFilterParams = {}
): Promise<SpringPageResponse<LocationPageResponse>> => {
  const queryParams: Record<string, any> = {
    page: params.page ?? 0,
    size: params.size ?? 10,
  };

  if (params.isActive !== undefined) {
    queryParams.isActive = params.isActive;
  }
  if (params.userId) {
    queryParams.userId = params.userId;
  }
  if (params.status && params.status !== "ALL") {
    queryParams.status = params.status;
  }
  if (params.sort) {
    queryParams.sort = params.sort;
  }

  const response = await get<ApiResponse<SpringPageResponse<LocationPageResponse>>>(
    "/v1/locations/pages",
    { params: queryParams }
  );
  return response.data;
};

export const createLocation = async (
  data: CreateLocationRequest
): Promise<LocationPageResponse> => {
  const response = await post<ApiResponse<LocationPageResponse>>("/v1/locations", data);
  return response.data;
};

export const updateLocation = async (
  id: string,
  data: UpdateLocationRequest
): Promise<LocationPageResponse> => {
  const response = await patch<ApiResponse<LocationPageResponse>>(`/v1/locations/${id}`, data);
  return response.data;
};

