import deepFloodIcon from '@/assets/map-icons/deep-flood.png';
import fallenTreeIcon from '@/assets/map-icons/fallen-tree.png';
import landslideIcon from '@/assets/map-icons/landslide.png';
import powerOutageIcon from '@/assets/map-icons/power-outage.png';
import type { HazardType, MapPointRes } from '@/types/dispatch';

export type HazardIconMeta = {
  label: string;
  iconUrl: string;
};

export const hazardIconMeta: Record<HazardType, HazardIconMeta> = {
  FALLEN_TREE: {
    label: 'Cay do',
    iconUrl: fallenTreeIcon,
  },
  LANDSLIDE: {
    label: 'Sat lo',
    iconUrl: landslideIcon,
  },
  FLOOD_DEEP: {
    label: 'Ngap sau',
    iconUrl: deepFloodIcon,
  },
  POWER_LINE_DOWN: {
    label: 'Mat dien',
    iconUrl: powerOutageIcon,
  },
};

export const getHazardIconDetails = (point: MapPointRes) => {
  const hazardType = point.subType as HazardType;
  return hazardType ? hazardIconMeta[hazardType] : undefined;
};
