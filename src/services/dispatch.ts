import { get } from "@/services/api";
import type { MapPointDetailRes, MapPointRes } from "@/types/dispatch";

export const getAllMapPoints = async (): Promise<MapPointRes[]> => {
  const response = await get<MapPointRes[]>("/v1/map-points");
  return response.data;
};

export const getMapPointDetail = async (
  id: string,
): Promise<MapPointDetailRes> => {
  const response = await get<MapPointDetailRes>(`/v1/map-points/${id}`);
  return response.data;
};
