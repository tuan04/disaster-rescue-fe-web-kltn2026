import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useEffect } from "react";

import PointDetail from "@/components/ui/map/PointDetail";
import {
  getHazardIconDetails,
  getSafePointIconDetails,
  getWarehouseIconDetails,
  sosCompletedIconSvg,
} from "@/contants/mapPointMeta";
import type { PointType, SosMapPointRes } from "@/types/mapPoint";
import type { RescueMapProps } from "../RescueMap";

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

const clusteredPointTypes: PointType[] = [
  "SOS",
  "HAZARD",
  "SAFE_ZONE",
  "WARE_HOUSE",
];

const clusterColors: Record<PointType, string> = {
  SOS: "var(--danger)",
  HAZARD: "var(--warning)",
  SAFE_ZONE: "var(--success)",
  WARE_HOUSE: "var(--secondary)",
};

const createSosIcon = (point: SosMapPointRes) => {
  const status = point.status.toUpperCase();
  const priority = point.priority.toUpperCase();

  if (status === "COMPLETED") {
    return L.divIcon({
      html: `
        <div class="relative flex h-8 w-8 items-center justify-center">
          <div class="relative flex h-6 w-6 items-center justify-center rounded-full border-[3px] border-white bg-success text-white shadow-lg">
            ${sosCompletedIconSvg}
          </div>
        </div>
      `,
      className: "custom-div-icon",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  }

  const color = priority === "HIGH" ? "var(--danger)" : "var(--warning)";
  const pingElement =
    status === "PENDING"
      ? `<span class="absolute h-10 w-10 rounded-full border-[3px] opacity-70 animate-ping" style="border-color:${color};"></span>`
      : "";

  return L.divIcon({
    html: `
      <div class="relative flex h-10 w-10 items-center justify-center">
        ${pingElement}
        <div class="h-full w-full rounded-full border-[5px] border-white shadow-lg" style="background-color:${color};"></div>
      </div>
    `,
    className: "custom-div-icon",
    iconSize: [40, 40],
    iconAnchor: [24, 24],
    popupAnchor: [0, -22],
  });
};

const userLocationIcon = L.divIcon({
  html: `
    <div class="relative flex h-8 w-8 items-center justify-center">
      <span class="absolute h-8 w-8 rounded-full bg-blue-500/25 animate-ping"></span>
      <div class="relative h-4 w-4 rounded-full border-[3px] border-white bg-blue-600 shadow-lg"></div>
    </div>
  `,
  className: "custom-div-icon",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const mapImageIconCache = new Map<string, L.DivIcon>();

const createMapImageIcon = (iconUrl: string, label: string) => {
  const cachedIcon = mapImageIconCache.get(iconUrl);

  if (cachedIcon) {
    return cachedIcon;
  }

  const icon = L.divIcon({
    html: `
      <div style="display:flex;align-items:center;justify-content:center;width:56px;height:56px;">
        <img
          src="${iconUrl}"
          alt="${label}"
          style="width:28px;height:28px;object-fit:contain;filter:drop-shadow(0 4px 6px rgba(15, 23, 42, 0.35));"
        />
      </div>
    `,
    className: "custom-div-icon",
    iconSize: [54, 54],
    iconAnchor: [28, 28],
    popupAnchor: [0, -28],
  });

  mapImageIconCache.set(iconUrl, icon);
  return icon;
};

const createCustomIcon = (point: RescueMapProps["points"][number]) => {
  if (point.pointType === "SOS") {
    return createSosIcon(point);
  }

  if (point.pointType === "HAZARD") {
    const hazardIconDetails = getHazardIconDetails(point)!;

    return createMapImageIcon(
      hazardIconDetails.iconUrl,
      hazardIconDetails.label,
    );
  }

  if (point.pointType === "SAFE_ZONE") {
    const safePointIconDetails = getSafePointIconDetails(point);

    return createMapImageIcon(
      safePointIconDetails.iconUrl,
      safePointIconDetails.label,
    );
  }

  if (point.pointType === "WARE_HOUSE") {
    const warehouseIconDetails = getWarehouseIconDetails();

    return createMapImageIcon(
      warehouseIconDetails.iconUrl,
      warehouseIconDetails.label,
    );
  }
};

const createClusterIcon =
  (color: string) => (cluster: { getChildCount: () => number }) =>
    L.divIcon({
      html: `
        <div style="
          display:flex;
          align-items:center;
          justify-content:center;
          width:42px;
          height:42px;
          border-radius:9999px;
          border:4px solid #ffffff;
          background:${color};
          color:#ffffff;
          font-size:14px;
          font-weight:800;
          box-shadow:0 8px 18px rgba(15, 23, 42, 0.3);
        ">
          ${cluster.getChildCount()}
        </div>
      `,
      className: "map-point-cluster-icon",
      iconSize: [42, 42],
      iconAnchor: [21, 21],
    });

export default function LeafletRescueMap({
  center,
  points,
  zoom = 13,
  userLocation,
  onPointDetailRequest,
  selectedPointDetail,
  detailLoading = false,
  detailError = null,
}: RescueMapProps) {
  const renderPointMarker = (point: RescueMapProps["points"][number]) => {
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
        <Popup minWidth={360} maxWidth={500}>
          <PointDetail
            className="w-96"
            point={pointDetail}
            loading={detailLoading && !pointDetail}
            error={detailError}
          />
        </Popup>
      </Marker>
    );
  };

  return (
    <MapContainer
      zoomControl={false}
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {userLocation ? (
        <>
          <FlyToLocation position={userLocation} zoom={16} />
          <Marker position={userLocation} icon={userLocationIcon} />
        </>
      ) : null}

      {clusteredPointTypes.map((pointType) => {
        const typedPoints = points.filter(
          (point) => point.pointType === pointType,
        );

        if (typedPoints.length === 0) {
          return null;
        }

        return (
          <MarkerClusterGroup
            key={pointType}
            chunkedLoading
            iconCreateFunction={createClusterIcon(clusterColors[pointType])}
          >
            {typedPoints.map(renderPointMarker)}
          </MarkerClusterGroup>
        );
      })}
    </MapContainer>
  );
}

function FlyToLocation({
  position,
  zoom,
}: {
  position: [number, number];
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(position, Math.max(map.getZoom(), zoom), {
      duration: 0.8,
    });
  }, [map, position, zoom]);

  return null;
}
