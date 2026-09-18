export interface Location {
  id: string;
  name: string;
}

export type LocationStatus = "ACTIVE" | "ISOLATE" | "OVERLOADED" | "DISABLED";

export interface GeoJsonPolygon {
  type: "Polygon";
  coordinates: [number, number][][];
}

export interface LocationPageResponse {
  id: string;
  userId: string | null;
  name: string;
  boundary: GeoJsonPolygon | null;
  radiusMeters: number;
  status: LocationStatus;
  isActive: boolean;
  createdAt: string;
  modifiedAt: string;
  userName: string | null;
  userPhone: string | null;
}

export interface LocationFilterParams {
  page?: number;
  size?: number;
  isActive?: boolean;
  userId?: string;
  status?: LocationStatus | "ALL";
  sort?: string;
}

export const locationStatusMeta: Record<
  LocationStatus,
  { label: string; tone: "success" | "danger" | "warning" | "default"; description: string }
> = {
  ACTIVE: {
    label: "Bình thường",
    tone: "success",
    description: "Khu vực vận hành ổn định và sẵn sàng tiếp nhận điều phối",
  },
  ISOLATE: {
    label: "Bị cô lập",
    tone: "danger",
    description: "Khu vực bị ngập sâu, chia cắt hoặc cô lập hoàn toàn",
  },
  OVERLOADED: {
    label: "Quá tải cứu hộ",
    tone: "warning",
    description: "Khối lượng yêu cầu cứu hộ vượt quá năng lực khu vực",
  },
  DISABLED: {
    label: "Tạm ngưng",
    tone: "default",
    description: "Khu vực đang tạm dừng tiếp nhận điều phối",
  },
};

export interface CreateLocationRequest {
  name: string;
  userId?: string | null;
  boundary?: GeoJsonPolygon | null;
  radiusMeters?: number;
  status?: LocationStatus;
  isActive?: boolean;
}

export interface UpdateLocationRequest {
  userId?: string | null;
  name?: string;
  radiusMeters?: number;
  status?: LocationStatus;
  isActive?: boolean;
}

