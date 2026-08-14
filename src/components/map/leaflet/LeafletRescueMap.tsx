import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

import PointDetail from "@/components/ui/map/PointDetail";
import type { PointType } from "@/types/dispatch";
import type { RescueMapProps } from "../RescueMap";
import { getHazardIconDetails } from "../hazardIconMeta";
import { getPointTypeDetails } from "../mapPointMeta";

import "leaflet/dist/leaflet.css";

type IconPointType = Exclude<PointType, "SOS">;

const pointIconSvg: Record<IconPointType, string> = {
  SAFE_ZONE:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-white"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  HAZARD:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-white"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  WARE_HOUSE:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-white"><path d="M3 21h18"/><path d="M3 7v1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1"/><path d="M4 21V13m16 8V13"/><path d="M9 21h6v-4H9v4Z"/></svg>',
};

const createSosIcon = () =>
  L.divIcon({
    html: `
      <div class="relative flex h-12 w-12 items-center justify-center">
        <span class="absolute h-10 w-10 rounded-full border-[3px] border-red-500 opacity-70 animate-ping"></span>
        <div class="h-full w-full rounded-full border-[5px] border-white bg-red-500"></div>
      </div>
    `,
    className: "custom-div-icon",
    iconSize: [40, 40],
    iconAnchor: [24, 24],
    popupAnchor: [0, -22],
  });

const hazardImageIconCache = new Map<string, L.DivIcon>();

const createHazardImageIcon = (iconUrl: string, label: string) => {
  const cachedIcon = hazardImageIconCache.get(iconUrl);

  if (cachedIcon) {
    return cachedIcon;
  }

  const icon = L.divIcon({
    html: `
      <div style="display:flex;align-items:center;justify-content:center;width:56px;height:56px;">
        <img
          src="${iconUrl}"
          alt="${label}"
          style="width:30px;height:30px;object-fit:contain;filter:drop-shadow(0 4px 6px rgba(15, 23, 42, 0.35));"
        />
      </div>
    `,
    className: "custom-div-icon",
    iconSize: [54, 54],
    iconAnchor: [28, 28],
    popupAnchor: [0, -28],
  });

  hazardImageIconCache.set(iconUrl, icon);
  return icon;
};

const createCustomIcon = (point: RescueMapProps["points"][number]) => {
  if (point.pointType === "SOS") {
    return createSosIcon();
  }

  if (point.pointType === "HAZARD") {
    const hazardIconDetails = getHazardIconDetails(point);

    if (hazardIconDetails) {
      return createHazardImageIcon(
        hazardIconDetails.iconUrl,
        hazardIconDetails.label,
      );
    }
  }

  const type = point.pointType;
  const { markerClassName } = getPointTypeDetails(type);

  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center w-8 h-8">
        <div class="relative flex items-center justify-center w-8 h-8 rounded-full ${markerClassName} border-2 border-white shadow-lg text-white">
          ${pointIconSvg[type]}
        </div>
      </div>
    `,
    className: "custom-div-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

export default function LeafletRescueMap({
  center,
  points,
  zoom = 13,
  onPointDetailRequest,
  selectedPointDetail,
  detailLoading = false,
  detailError = null,
}: RescueMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {points.map((point) => {
        const pointDetail =
          selectedPointDetail?.id === point.id ? selectedPointDetail : null;

        return (
          <Marker
            key={point.id}
            position={[point.latitude, point.longitude]}
            icon={createCustomIcon(point)}
            eventHandlers={{
              click: () => onPointDetailRequest?.(point.id),
            }}
          >
            <Popup>
              <PointDetail
                point={pointDetail}
                loading={detailLoading && !pointDetail}
                error={detailError}
                className="min-w-[260px]"
              />
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
