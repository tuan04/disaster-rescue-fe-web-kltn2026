import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Polyline,
  CircleMarker,
  Marker,
  Tooltip,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { FaDrawPolygon, FaUndo, FaTrash, FaMapMarkerAlt } from "react-icons/fa";
import "leaflet/dist/leaflet.css";
import type { GeoJsonPolygon } from "@/types/location";
import type { PointType } from "@/types/mapPoint";

// Leaflet custom center pin icon (dùng khi xem chi tiết khu vực ở chế độ readOnly)
const centerIcon = L.divIcon({
  html: `
    <div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="none">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#10b4c0" stroke="#fff" stroke-width="1.5"/>
        <circle cx="12" cy="9" r="3" fill="#fff"/>
      </svg>
    </div>
  `,
  className: "zone-center-icon",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Cache icons để tối ưu hiệu năng render marker
const markerIconCache = new Map<string, L.DivIcon>();

/** Tạo Leaflet divIcon với màu sắc và biểu tượng đặc trưng theo từng loại điểm */
export const getStrategicMarkerIcon = (pointType?: PointType | string, subType?: string) => {
  const cacheKey = `${pointType || "DEFAULT"}_${subType || ""}`;
  const cached = markerIconCache.get(cacheKey);
  if (cached) return cached;

  let color = "#0891b2"; // cyan (mặc định / kho)
  let iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12"/><path d="M6 14h12"/></svg>`;

  if (pointType === "WARE_HOUSE") {
    color = "#0891b2"; // cyan
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12"/><path d="M6 14h12"/></svg>`;
  } else if (pointType === "SAFE_ZONE") {
    color = "#059669"; // emerald
    if (subType === "MEDICAL_STATION") {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 10.5h-5.5V5c0-.55-.45-1-1-1h-1c-.55 0-1 .45-1 1v5.5H5c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h5.5V19c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-5.5H19c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1z"/></svg>`;
    } else if (subType === "WATER_STATION") {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`;
    } else {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
    }
  } else if (pointType === "HAZARD") {
    color = "#e11d48"; // rose
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
  }

  const icon = L.divIcon({
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;width:34px;height:38px;cursor:pointer;">
        <div style="position:absolute;top:0;width:32px;height:32px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 3px 8px rgba(0,0,0,0.3);border:2px solid #fff;">
          ${iconSvg}
        </div>
        <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:7px solid ${color};"></div>
      </div>
    `,
    className: "strategic-marker-pin",
    iconSize: [34, 38],
    iconAnchor: [17, 36],
    popupAnchor: [0, -36],
  });

  markerIconCache.set(cacheKey, icon);
  return icon;
};

/** Component lắng nghe click trên bản đồ để thêm đỉnh đa giác (chế độ vẽ đa giác) */
function MapPolygonDrawer({
  onAddPoint,
  disabled,
}: {
  onAddPoint: (lat: number, lng: number) => void;
  disabled?: boolean;
}) {
  useMapEvents({
    click(e) {
      if (!disabled) {
        onAddPoint(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

/** Component lắng nghe click trên bản đồ để chọn 1 điểm tọa độ (chế độ chọn điểm / point picking) */
function MapPointPicker({
  onClick,
  disabled,
}: {
  onClick?: (lat: number, lng: number) => void;
  disabled?: boolean;
}) {
  useMapEvents({
    click(e) {
      if (!disabled && onClick) {
        onClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

/** Fly bản đồ đến tọa độ mới mượt mà khi tìm kiếm địa chỉ */
function FlyToController({ position }: { position?: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (position && position[0] && position[1]) {
      map.flyTo(position, Math.max(map.getZoom(), 15), { duration: 0.8 });
    }
  }, [map, position]);
  return null;
}

/** Component điều khiển map: tự động fix kích thước và fitBounds khi cần */
function MapController({
  positions,
  markers,
  autoFit,
}: {
  positions: [number, number][];
  markers?: GisMapMarker[];
  autoFit: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
      if (autoFit) {
        if (positions.length >= 3) {
          const bounds = L.latLngBounds(positions);
          map.fitBounds(bounds, { padding: [35, 35] });
        } else if (markers && markers.length > 0) {
          const markerPositions = markers.map(
            (m) => [m.latitude, m.longitude] as [number, number]
          );
          const bounds = L.latLngBounds(markerPositions);
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
        }
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [map, positions, markers, autoFit]);

  return null;
}

export interface GisMapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  subtitle?: string;
  pointType?: PointType | string;
  subType?: string;
  status?: string;
  statusTone?: "success" | "danger" | "warning" | "default";
  address?: string;
  phone?: string;
  onSelect?: () => void;
}

export interface GisBoundaryMapProps {
  /** Danh sách điểm tọa độ đa giác [lat, lng] (Leaflet format) */
  points?: [number, number][];
  /** Hoặc truyền trực tiếp đối tượng GeoJsonPolygon */
  boundary?: GeoJsonPolygon | null;
  /** Danh sách các điểm marker chiến lược (nếu có) */
  markers?: GisMapMarker[];
  /** Callback khi danh sách tọa độ đa giác thay đổi (chế độ vẽ đa giác) */
  onChange?: (points: [number, number][]) => void;
  /** Callback khi click lên bản đồ để chọn 1 vị trí (chế độ chọn điểm / ghim tọa độ) */
  onMapClick?: (lat: number, lng: number) => void;
  /** Tọa độ điểm ghim đơn lẻ khi chọn điểm */
  pinPosition?: [number, number] | null;
  /** Loại điểm của ghim đơn lẻ (để render màu và icon phù hợp) */
  pinType?: PointType | string;
  /** Tọa độ để flyTo tới khi tìm kiếm hoặc thay đổi vị trí */
  flyToCenter?: [number, number];
  /** Hiển thị badge tọa độ ở góc dưới bản đồ */
  showCoordinateBadge?: boolean;
  /** Nội dung thanh ghi chú / hướng dẫn dưới chân bản đồ */
  hintText?: React.ReactNode;
  /** Chế độ chỉ xem (không vẽ, không xóa) - Mặc định false */
  readOnly?: boolean;
  /** Tên khu vực để hiển thị tooltip/marker */
  zoneName?: string;
  /** Tiêu đề bản đồ */
  title?: string;
  /** Mô tả phụ bên dưới tiêu đề */
  description?: string;
  /** Chiều cao khung bản đồ (VD: 280, '280px', '520px') - Mặc định 280px */
  height?: string | number;
  /** Tự động zoom vừa vặn đa giác hoặc markers - Mặc định true khi readOnly, false khi vẽ */
  autoFit?: boolean;
  /** Tọa độ tâm mặc định nếu chưa có điểm */
  initialCenter?: [number, number];
  /** Mức zoom ban đầu - Mặc định 12 */
  initialZoom?: number;
  /** Tùy biến class bọc ngoài */
  className?: string;
  /** Ẩn phần header (tiêu đề + nút) */
  hideHeader?: boolean;
}

export default function GisBoundaryMap({
  points,
  boundary,
  markers,
  onChange,
  onMapClick,
  pinPosition,
  pinType,
  flyToCenter,
  showCoordinateBadge = false,
  hintText,
  readOnly = false,
  zoneName,
  title,
  description,
  height = 280,
  autoFit,
  initialCenter = [10.7769, 106.7009],
  initialZoom = 12,
  className = "",
  hideHeader = false,
}: GisBoundaryMapProps) {
  // Giải quyết danh sách điểm từ points hoặc GeoJsonPolygon
  const resolvedPoints = useMemo<[number, number][]>(() => {
    if (points !== undefined) return points;
    if (boundary?.coordinates?.length) {
      const exteriorRing = boundary.coordinates[0];
      if (Array.isArray(exteriorRing)) {
        // Chuyển GeoJSON [lng, lat] sang Leaflet [lat, lng]
        return exteriorRing.map(([lng, lat]) => [lat, lng] as [number, number]);
      }
    }
    return [];
  }, [points, boundary]);

  // Trọng tâm đa giác (dùng đặt marker ở chế độ xem nếu có boundary)
  const polygonCenter = useMemo<[number, number] | null>(() => {
    if (!resolvedPoints.length) return null;
    let sumLat = 0;
    let sumLng = 0;
    for (const [lat, lng] of resolvedPoints) {
      sumLat += lat;
      sumLng += lng;
    }
    return [sumLat / resolvedPoints.length, sumLng / resolvedPoints.length];
  }, [resolvedPoints]);

  const shouldAutoFit = autoFit !== undefined ? autoFit : readOnly;

  // Xử lý các thao tác vẽ đa giác
  const handleAddPoint = (lat: number, lng: number) => {
    if (readOnly || !onChange) return;
    onChange([...resolvedPoints, [lat, lng]]);
  };

  const handleUndoPoint = () => {
    if (readOnly || !onChange) return;
    onChange(resolvedPoints.slice(0, -1));
  };

  const handleClearPoints = () => {
    if (readOnly || !onChange) return;
    onChange([]);
  };

  const defaultTitle = readOnly ? "Bản đồ ranh giới GIS" : "Bản đồ vẽ ranh giới GIS";
  const defaultDescription = readOnly
    ? undefined
    : "Nhấp chuột trực tiếp lên bản đồ để chấm các đỉnh tạo ranh giới đa giác (tối thiểu 3 điểm).";

  const renderedTitle = title ?? defaultTitle;
  const renderedDescription = description ?? defaultDescription;

  // Kiểm tra có dữ liệu nội dung không (ở chế độ readOnly)
  const hasContent =
    resolvedPoints.length > 0 ||
    (markers && markers.length > 0) ||
    Boolean(pinPosition) ||
    Boolean(onMapClick);

  if (readOnly && !hasContent) {
    return (
      <div className={`space-y-2 ${className}`}>
        {!hideHeader && (
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <FaDrawPolygon className="text-secondary" />
              <span>{renderedTitle}</span>
            </label>
          </div>
        )}
        <div className="flex h-44 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center text-slate-400">
          <FaMapMarkerAlt size={28} className="text-slate-300" />
          <p className="mt-2 text-sm">Chưa có thông tin tọa độ hiển thị</p>
          <p className="text-xs text-slate-400">Hiện chưa có ranh giới GIS hoặc điểm chiến lược nào trong bộ lọc</p>
        </div>
      </div>
    );
  }

  const containerHeight = typeof height === "number" ? `${height}px` : height;

  // Tìm center ban đầu
  const effectiveCenter =
    flyToCenter ||
    pinPosition ||
    polygonCenter ||
    (markers && markers.length > 0
      ? ([markers[0].latitude, markers[0].longitude] as [number, number])
      : initialCenter);

  // Chế độ vẽ đa giác có đang hoạt động không
  const isPolygonDrawMode = Boolean(onChange) && !readOnly;
  // Chế độ click chọn 1 điểm
  const isPointPickerMode = Boolean(onMapClick) && !readOnly;

  return (
    <div className={`space-y-2 ${className}`}>
      {!hideHeader && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <FaDrawPolygon className="text-secondary" />
              <span>{renderedTitle}</span>
            </label>
            {renderedDescription && (
              <p className="text-[11px] text-slate-400">{renderedDescription}</p>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {readOnly ? (
              <div className="flex items-center gap-2">
                {resolvedPoints.length > 0 && (
                  <span className="text-xs font-medium text-secondary">
                    Đa giác gồm {resolvedPoints.length} đỉnh tọa độ
                  </span>
                )}
                {markers && markers.length > 0 && (
                  <span className="rounded bg-cyan-50 px-2 py-0.5 text-xs font-semibold text-cyan-700 border border-cyan-200">
                    {markers.length} điểm ghim
                  </span>
                )}
              </div>
            ) : isPolygonDrawMode ? (
              <>
                <span className="text-xs font-medium text-slate-500 mr-1">
                  {resolvedPoints.length} điểm
                </span>
                <button
                  type="button"
                  onClick={handleUndoPoint}
                  disabled={resolvedPoints.length === 0}
                  className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                >
                  <FaUndo size={10} />
                  <span>Hoàn tác</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearPoints}
                  disabled={resolvedPoints.length === 0}
                  className="inline-flex items-center gap-1 rounded border border-rose-200 bg-rose-50 px-2 py-1 text-xs text-danger hover:bg-rose-100 disabled:opacity-40 transition-colors"
                >
                  <FaTrash size={10} />
                  <span>Xóa hết</span>
                </button>
              </>
            ) : null}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm">
        <div
          className="relative w-full overflow-hidden"
          style={{ height: containerHeight }}
        >
          <MapContainer
            center={effectiveCenter}
            zoom={initialZoom}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapController
              positions={resolvedPoints}
              markers={markers}
              autoFit={shouldAutoFit}
            />

            {/* Fly to center khi cần (ví dụ chọn địa chỉ từ search) */}
            {flyToCenter && <FlyToController position={flyToCenter} />}

            {/* Listener cho chế độ vẽ đa giác */}
            {isPolygonDrawMode && <MapPolygonDrawer onAddPoint={handleAddPoint} />}

            {/* Listener cho chế độ click chọn 1 điểm */}
            {isPointPickerMode && <MapPointPicker onClick={onMapClick} />}

            {/* Đường vẽ khi mới có 2 điểm (vẽ đa giác) */}
            {resolvedPoints.length === 2 && (
              <Polyline
                positions={resolvedPoints}
                pathOptions={{ color: "#10b4c0", weight: 2, dashArray: "4, 4" }}
              />
            )}

            {/* Vẽ đa giác ranh giới GIS khi >= 3 điểm */}
            {resolvedPoints.length >= 3 && (
              <Polygon
                positions={resolvedPoints}
                pathOptions={{
                  color: "#10b4c0",
                  weight: 2.5,
                  fillColor: "#10b4c0",
                  fillOpacity: 0.2,
                }}
              >
                {zoneName && <Tooltip sticky>{zoneName}</Tooltip>}
              </Polygon>
            )}

            {/* Vẽ các đỉnh đa giác ở chế độ vẽ */}
            {isPolygonDrawMode &&
              resolvedPoints.map(([lat, lng], idx) => (
                <CircleMarker
                  key={idx}
                  center={[lat, lng]}
                  radius={5}
                  pathOptions={{
                    color: "#ffffff",
                    weight: 1.5,
                    fillColor: "#10b4c0",
                    fillOpacity: 1,
                  }}
                />
              ))}

            {/* Marker trọng tâm đa giác (nếu có boundary và không có markers) */}
            {readOnly && polygonCenter && (!markers || markers.length === 0) && !pinPosition && (
              <Marker position={polygonCenter} icon={centerIcon}>
                {zoneName && (
                  <Tooltip permanent direction="top">
                    {zoneName}
                  </Tooltip>
                )}
              </Marker>
            )}

            {/* Marker điểm ghim đơn lẻ (chế độ chọn điểm / xem 1 điểm) */}
            {pinPosition && (
              <Marker
                position={pinPosition}
                icon={getStrategicMarkerIcon(pinType)}
              />
            )}

            {/* Hiển thị danh sách Marker điểm chiến lược */}
            {markers?.map((marker) => (
              <Marker
                key={marker.id}
                position={[marker.latitude, marker.longitude]}
                icon={getStrategicMarkerIcon(marker.pointType, marker.subType)}
              >
                <Tooltip direction="top" offset={[0, -28]}>
                  <div className="font-semibold text-xs">{marker.title}</div>
                  {marker.subtitle && (
                    <div className="text-[10px] text-slate-500">{marker.subtitle}</div>
                  )}
                </Tooltip>

                <Popup className="strategic-point-popup">
                  <div className="p-1 min-w-[220px] max-w-[280px]">
                    <div className="font-bold text-sm text-slate-900 line-clamp-1 mb-1">
                      {marker.title}
                    </div>
                    {marker.subtitle && (
                      <div className="inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 mb-2">
                        {marker.subtitle}
                      </div>
                    )}
                    {marker.address && (
                      <div className="text-xs text-slate-600 mb-1.5 flex items-start gap-1">
                        <span className="text-slate-400 shrink-0">📍</span>
                        <span className="line-clamp-2">{marker.address}</span>
                      </div>
                    )}
                    {marker.phone && marker.phone !== "-" && (
                      <div className="text-xs text-slate-600 mb-2 font-mono">
                        📞 {marker.phone}
                      </div>
                    )}
                    {marker.status && (
                      <div className="text-xs mb-2">
                        Trạng thái: <strong className="text-slate-700">{marker.status}</strong>
                      </div>
                    )}
                    {marker.onSelect && (
                      <button
                        type="button"
                        onClick={marker.onSelect}
                        className="w-full mt-1 rounded bg-cyan-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-cyan-700 transition-colors"
                      >
                        Xem chi tiết
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Coordinate overlay badge khi có pin đơn lẻ */}
          {showCoordinateBadge && pinPosition && (
            <div className="absolute bottom-2 left-2 z-[1000] rounded-md bg-slate-900/80 px-2.5 py-1.5 font-mono text-xs text-white backdrop-blur-sm shadow">
              {pinPosition[0].toFixed(5)}, {pinPosition[1].toFixed(5)}
            </div>
          )}
        </div>

        {/* Hint bar phía dưới bản đồ */}
        {hintText && (
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 text-xs text-slate-500 border-t border-slate-200">
            <FaMapMarkerAlt size={11} className="shrink-0 text-cyan-600" />
            <div>{hintText}</div>
          </div>
        )}
      </div>
    </div>
  );
}
