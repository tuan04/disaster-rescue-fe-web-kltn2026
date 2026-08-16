import { get } from "@/services/api";
import type {
  MapPointDetailRes,
  MapPointFilterRequest,
  MapPointRes,
} from "@/types/mapPoint";

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
  const response = await get<MapPointRes[]>("/v1/map-points", {
    params: createMapPointFilterParams(filter),
  });
  return response.data;
};

export const getMapPointDetail = async (
  id: string,
): Promise<MapPointDetailRes> => {
  const response = await get<MapPointDetailRes>(`/v1/map-points/${id}`);
  return response.data;
};
