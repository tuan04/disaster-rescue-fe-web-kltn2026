export type PointType = "SOS" | "SAFE_ZONE" | "HAZARD" | "WARE_HOUSE";
export type HazardType =
  | "FALLEN_TREE"
  | "LANDSLIDE"
  | "FLOOD_DEEP"
  | "POWER_LINE_DOWN";

export type EmergencyLevel = "LOW" | "MEDIUM" | "HIGH";
export type RequestStatus = "PENDING" | "ACCEPTED" | "COMPLETED";
export type RequestSource = "SOCIAL" | "APP" | "SMS";
export type HazardStatus = "ACTIVE" | "RESOLVED" | "REJECTED";
export type SafePointType =
  | "EVACUATION_CENTER"
  | "MEDICAL_STATION"
  | "TEMPORARY_CAMP"
  | "WATER_STATION";

export interface MapPointFilterRequest {
  pointTypes?: PointType[];
  rescueStatuses?: RequestStatus[];
  emergencyLevels?: EmergencyLevel[];
  hazardStatuses?: HazardStatus[];
  hazardTypes?: HazardType[];
  safePointTypes?: SafePointType[];
  fromTime?: string;
  toTime?: string;
}

export interface StrategicPointsFilterRequest {
  pointType?: string;
  locationId?: string;
  hazardType?: HazardType;
  safePointType?: SafePointType;
  fromTime?: string;
  toTime?: string;
}

export interface MapPointRequest {
  address: string;
  latitude: number;
  longitude: number;
}

export interface CreateWarehouseRequest {
  name: string;
  managerPhone?: string;
  mapPoint: MapPointRequest;
}

export interface CreateSafePointRequest {
  name: string;
  safePointType: SafePointType;
  contactPhone?: string;
  mapPoint: MapPointRequest;
}

export interface CreateHazardReportRequest {
  hazardType: HazardType;
  description?: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface UpdateWarehouseRequest {
  name?: string;
  managerPhone?: string;
  isActive?: boolean;
}

export interface UpdateSafePointRequest {
  name?: string;
  safePointType?: SafePointType;
  contactPhone?: string;
  isActive?: boolean;
}

export interface UpdateHazardReportRequest {
  hazardType?: HazardType;
  description?: string;
  status?: HazardStatus;
  imageUrls?: string[];
}

export interface SpringPageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface BaseMapPointRes {
  id: string; // UUID dạng chuỗi
  pointType: PointType;
  latitude: number;
  longitude: number;
  priority: string;
  subType: string;
  status: string;
}

export interface HazardMapPointRes extends BaseMapPointRes {
  pointType: "HAZARD";
  subType: HazardType;
}

export interface SosMapPointRes extends BaseMapPointRes {
  pointType: "SOS";
  subType: string;
}

export interface SafeZoneMapPointRes extends BaseMapPointRes {
  pointType: "SAFE_ZONE";
  subType: string;
}

export interface WarehouseMapPointRes extends BaseMapPointRes {
  pointType: "WARE_HOUSE";
  subType: string;
}

export type MapPointRes =
  | HazardMapPointRes
  | SosMapPointRes
  | SafeZoneMapPointRes
  | WarehouseMapPointRes;

export interface HazardDetailRes {
  id: string;
  hazardType: HazardType;
  description: string;
  imageUrls: string[] | null;
  status: HazardStatus;
}

export interface SosDetailRes {
  id: string;
  reporterPhone: string;
  content: string;
  emergencyLevel: EmergencyLevel;
  status: RequestStatus;
  source: RequestSource;
}

export interface SafePointDetailRes {
  id: string;
  name: string;
  contactPhone: string;
  safePointType: SafePointType;
  isActive: boolean;
}

export interface WarehouseDetailRes {
  id: string;
  name: string;
  managerPhone: string;
  isActive: boolean;
}

interface BaseMapPointDetailRes {
  id: string;
  latitude: number;
  longitude: number;
  address: string;
  createdAt: string;
}

export type MapPointDetailRes =
  | (BaseMapPointDetailRes & {
      pointType: "SOS";
      detail: SosDetailRes;
    })
  | (BaseMapPointDetailRes & {
      pointType: "HAZARD";
      detail: HazardDetailRes;
    })
  | (BaseMapPointDetailRes & {
      pointType: "SAFE_ZONE";
      detail: SafePointDetailRes;
    })
  | (BaseMapPointDetailRes & {
      pointType: "WARE_HOUSE";
      detail: WarehouseDetailRes;
    });
