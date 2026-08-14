import type { PointType } from '@/types/dispatch';

export type PointTypeMeta = {
  label: string;
  color: 'danger' | 'success' | 'warning' | 'primary';
  markerClassName: string;
};

export const pointTypeMeta: Record<PointType, PointTypeMeta> = {
  SOS: {
    label: 'Khẩn Cấp (SOS)',
    color: 'danger',
    markerClassName: 'bg-red-600',
  },
  SAFE_ZONE: {
    label: 'Vùng An Toàn',
    color: 'success',
    markerClassName: 'bg-green-600',
  },
  HAZARD: {
    label: 'Vùng Nguy Hiểm',
    color: 'warning',
    markerClassName: 'bg-amber-500',
  },
  WARE_HOUSE: {
    label: 'Kho Cứu Trợ',
    color: 'primary',
    markerClassName: 'bg-blue-800',
  },
};

export const getPointTypeDetails = (type: PointType) => pointTypeMeta[type];
