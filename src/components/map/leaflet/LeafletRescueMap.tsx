import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useEffect } from "react";
import { FaAmbulance, FaPhoneAlt } from "react-icons/fa";

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

const createTeamIcon = (teamName?: string | null) =>
  L.divIcon({
    html: `
      <div class="relative flex flex-col items-center justify-center">
        <span class="absolute h-9 w-9 rounded-full bg-emerald-500/35 animate-ping"></span>
        <div class="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-emerald-600 text-white shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1 .4-1 1v10c0 .6.4 1 1 1h2"/>
            <circle cx="7" cy="17" r="2"/>
            <path d="M9 17h6"/>
            <circle cx="17" cy="17" r="2"/>
          </svg>
        </div>
        ${
          teamName
            ? `<div class="mt-1 whitespace-nowrap rounded-md bg-slate-900/85 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-md backdrop-blur-xs">${teamName}</div>`
            : ""
        }
      </div>
    `,
    className: "custom-div-icon",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });

export default function LeafletRescueMap({
  center,
  points,
  teamLocations = [],
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

      {teamLocations.map((team, index) => {
        const teamName =
          team.team_name || team.teamName || `Đội cứu hộ ${index + 1}`;
        const leaderPhone = team.leaderPhone;
        return (
          <Marker
            key={`team-${index}-${team.latitude}-${team.longitude}`}
            position={[team.latitude, team.longitude]}
            icon={createTeamIcon(teamName)}
          >
            <Popup minWidth={260} maxWidth={320}>
              <div className="p-1 font-sans text-slate-800">
                <div className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-base font-bold text-emerald-700">
                    <FaAmbulance size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold leading-tight text-slate-900">
                      {teamName}
                    </h3>
                    <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      Đội cứu hộ đang trực
                    </span>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-slate-600">
                  {leaderPhone ? (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Số điện thoại:</span>
                      <a
                        href={`tel:${leaderPhone}`}
                        className="flex items-center gap-1.5 font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                      >
                        <FaPhoneAlt size={12} />
                        <span>{leaderPhone}</span>
                      </a>
                    </div>
                  ) : null}
                  {team.speed !== undefined && team.speed !== null ? (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Tốc độ:</span>
                      <span className="font-medium text-slate-700">
                        {team.speed} km/h
                      </span>
                    </div>
                  ) : null}
                  {team.recordedAt ? (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Cập nhật:</span>
                      <span className="font-medium text-slate-700">
                        {new Date(team.recordedAt).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}

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
