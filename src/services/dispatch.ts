import { get, patch, post, request } from "@/services/axiosClient";
import type {
  CreateHazardReportRequest,
  CreateSafePointRequest,
  CreateWarehouseRequest,
  EmergencyLevel,
  HazardDetailRes,
  MapPointDetailRes,
  MapPointFilterRequest,
  MapPointRes,
  RequestSource,
  SafePointDetailRes,
  SpringPageResponse,
  StrategicPointsFilterRequest,
  UpdateHazardReportRequest,
  UpdateSafePointRequest,
  UpdateWarehouseRequest,
  WarehouseDetailRes,
} from "@/types/mapPoint";
import type { ApiResponse } from "@/types/response";

type MapPointArrayFilterKey = Exclude<
  keyof MapPointFilterRequest,
  "fromTime" | "toTime"
>;

const mapPointFilterKeys: MapPointArrayFilterKey[] = [
  "pointTypes",
  "rescueStatuses",
  "emergencyLevels",
  "hazardStatuses",
  "hazardTypes",
  "safePointTypes",
];

const createMapPointFilterParams = (filter: MapPointFilterRequest) => {
  const params = new URLSearchParams();

  mapPointFilterKeys.forEach((key) => {
    filter[key]?.forEach((value) => {
      params.append(key, value);
    });
  });

  if (filter.fromTime) {
    params.set("fromTime", filter.fromTime);
  }

  if (filter.toTime) {
    params.set("toTime", filter.toTime);
  }

  return params;
};

export const getAllMapPoints = async (
  filter: MapPointFilterRequest = {},
): Promise<MapPointRes[]> => {
  const response = await get<ApiResponse<MapPointRes[]>>("/v1/map-points", {
    params: createMapPointFilterParams(filter),
  });
  return response.data;
};

export const getMapPointDetail = async (
  id: string,
): Promise<MapPointDetailRes> => {
  const response = await get<ApiResponse<MapPointDetailRes>>(`/v1/map-points/${id}`);
  return response.data;
};

export const getStrategicPoints = async (
  filter: StrategicPointsFilterRequest = {},
  page = 0,
  size = 10,
): Promise<SpringPageResponse<MapPointDetailRes>> => {
  const params = new URLSearchParams();
  params.set("page", page.toString());
  params.set("size", size.toString());

  if (filter.pointType && filter.pointType !== "ALL") {
    params.set("pointType", filter.pointType);
  }
  if (filter.locationId) {
    params.set("locationId", filter.locationId);
  }
  if (filter.hazardType) {
    params.set("hazardType", filter.hazardType);
  }
  if (filter.safePointType) {
    params.set("safePointType", filter.safePointType);
  }
  if (filter.fromTime) {
    params.set("fromTime", filter.fromTime);
  }
  if (filter.toTime) {
    params.set("toTime", filter.toTime);
  }

  const response = await get<ApiResponse<SpringPageResponse<MapPointDetailRes>>>(
    "/v1/map-points/strategic-points",
    { params }
  );
  return response.data;
};

export const createWarehouse = async (
  data: CreateWarehouseRequest,
): Promise<MapPointDetailRes> => {
  const response = await post<ApiResponse<MapPointDetailRes>>(
    "/v1/map-points/warehouses",
    data,
  );
  return response.data;
};

export const createSafePoint = async (
  data: CreateSafePointRequest,
): Promise<MapPointDetailRes> => {
  const response = await post<ApiResponse<MapPointDetailRes>>(
    "/v1/map-points/safe-points",
    data,
  );
  return response.data;
};

export const createHazardReport = async (
  data: CreateHazardReportRequest,
  images?: File[],
): Promise<MapPointDetailRes> => {
  const formData = new FormData();
  formData.append("hazardType", data.hazardType);
  if (data.description) formData.append("description", data.description);
  formData.append("address", data.address);
  formData.append("latitude", data.latitude.toString());
  formData.append("longitude", data.longitude.toString());

  if (images) {
    images.forEach((img) => formData.append("images", img));
  }

  const response = await request<ApiResponse<MapPointDetailRes>>({
    url: "/v1/map-points/hazard-reports",
    method: "POST",
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateWarehouse = async (
  id: string,
  data: UpdateWarehouseRequest,
): Promise<WarehouseDetailRes> => {
  const response = await patch<ApiResponse<WarehouseDetailRes>>(
    `/v1/map-points/warehouses/${id}`,
    data,
  );
  return response.data;
};

export const updateSafePoint = async (
  id: string,
  data: UpdateSafePointRequest,
): Promise<SafePointDetailRes> => {
  const response = await patch<ApiResponse<SafePointDetailRes>>(
    `/v1/map-points/safe-points/${id}`,
    data,
  );
  return response.data;
};

export const updateHazardReport = async (
  id: string,
  data: UpdateHazardReportRequest,
  images?: File[],
): Promise<HazardDetailRes> => {
  if (images && images.length > 0) {
    const formData = new FormData();
    if (data.hazardType) formData.append("hazardType", data.hazardType);
    if (data.description !== undefined) formData.append("description", data.description);
    if (data.status) formData.append("status", data.status);
    if (data.imageUrls && data.imageUrls.length > 0) {
      data.imageUrls.forEach((url) => formData.append("imageUrls", url));
    }
    images.forEach((img) => formData.append("images", img));

    const response = await request<ApiResponse<HazardDetailRes>>({
      url: `/v1/map-points/hazard-reports/${id}`,
      method: "PATCH",
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }

  const response = await patch<ApiResponse<HazardDetailRes>>(
    `/v1/map-points/hazard-reports/${id}`,
    data,
  );
  return response.data;
};

export interface PendingRescueRequestsFilter {
  emergencyLevel?: EmergencyLevel;
  source?: RequestSource;
  page?: number;
  size?: number;
  sort?: string;
}

export const getPendingRescueRequests = async (
  filter: PendingRescueRequestsFilter = {},
): Promise<SpringPageResponse<MapPointDetailRes>> => {
  const params = new URLSearchParams();

  if (filter.page !== undefined) {
    params.set("page", filter.page.toString());
  }
  if (filter.size !== undefined) {
    params.set("size", filter.size.toString());
  }
  if (filter.sort) {
    params.set("sort", filter.sort);
  }
  if (filter.emergencyLevel) {
    params.set("emergencyLevel", filter.emergencyLevel);
  }
  if (filter.source) {
    params.set("source", filter.source);
  }

  const response = await get<ApiResponse<SpringPageResponse<MapPointDetailRes>>>(
    "/v1/map-points/rescue-requests-pending",
    { params }
  );
  return response.data;
};

