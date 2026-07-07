export type PointType = 'SOS' | 'SAFE_ZONE' | 'HAZARD' | 'WARE_HOUSE';

export interface MapPointRes {
    id: string; // UUID dạng chuỗi
    pointType: PointType;
    latitude: number;
    longitude: number;
    subType: string;
}
