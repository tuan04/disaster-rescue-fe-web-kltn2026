import deepFloodIcon from "@/assets/map-icons/deep-flood.png";
import evacuationCenterIcon from "@/assets/map-icons/evacution-center.jpg";
import fallenTreeIcon from "@/assets/map-icons/fallen-tree.png";
import landslideIcon from "@/assets/map-icons/landslide.png";
import medicalStationIcon from "@/assets/map-icons/medical-station.png";
import powerOutageIcon from "@/assets/map-icons/power-outage.png";
import temporaryCampIcon from "@/assets/map-icons/temporary-camp.png";
import warehouseIcon from "@/assets/map-icons/warehouse.jpg";
import waterStationIcon from "@/assets/map-icons/water-station.png";
import type {
  HazardType,
  MapPointRes,
  SafePointType,
  SafeZoneMapPointRes,
} from "@/types/mapPoint";

export type MapImageIconDetails = {
  label: string;
  iconUrl: string;
};

export type PointTypeMeta = {
  label: string;
  color: "danger" | "success" | "warning" | "primary";
  markerClassName: string;
};

export const sosCompletedIconSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M20 6 9 17l-5-5"/></svg>';

export const hazardIconMeta: Record<HazardType, MapImageIconDetails> = {
  FALLEN_TREE: {
    label: "Cay do",
    iconUrl: fallenTreeIcon,
  },
  LANDSLIDE: {
    label: "Sat lo",
    iconUrl: landslideIcon,
  },
  FLOOD_DEEP: {
    label: "Ngap sau",
    iconUrl: deepFloodIcon,
  },
  POWER_LINE_DOWN: {
    label: "Mat dien",
    iconUrl: powerOutageIcon,
  },
};

export const safePointIconMeta: Record<SafePointType, MapImageIconDetails> = {
  EVACUATION_CENTER: {
    label: "Trung tam so tan",
    iconUrl: evacuationCenterIcon,
  },
  MEDICAL_STATION: {
    label: "Tram y te",
    iconUrl: medicalStationIcon,
  },
  TEMPORARY_CAMP: {
    label: "Trai tam",
    iconUrl: temporaryCampIcon,
  },
  WATER_STATION: {
    label: "Diem nuoc",
    iconUrl: waterStationIcon,
  },
};

export const warehouseIconDetails: MapImageIconDetails = {
  label: "Kho cuu tro",
  iconUrl: warehouseIcon,
};

export const getHazardIconDetails = (point: MapPointRes) => {
  const hazardType = point.subType as HazardType;
  return hazardType ? hazardIconMeta[hazardType] : undefined;
};

export const getSafePointIconDetails = (point: SafeZoneMapPointRes) => {
  const safePointType = point.subType as SafePointType;
  return safePointIconMeta[safePointType];
};

export const getWarehouseIconDetails = () => warehouseIconDetails;
