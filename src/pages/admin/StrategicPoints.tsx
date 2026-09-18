import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FaEdit,
  FaExclamationTriangle,
  FaEye,
  FaFilter,
  FaMapMarkerAlt,
  FaMapMarkedAlt,
  FaPhoneAlt,
  FaPlus,
  FaRedo,
  FaThList,
} from "react-icons/fa";

import {
  AdminButton,
  AdminCard,
  DataTable,
  type DataTableColumn,
  StatusTag,
} from "@/components/ui/admin/AdminUi";
import CreateStrategicPointModal from "@/components/admin/CreateStrategicPointModal";
import EditStrategicPointModal from "@/components/admin/EditStrategicPointModal";
import StrategicPointDetailModal, {
  getPointTypeIcon,
  type StrategicPointRow,
} from "@/components/admin/StrategicPointDetailModal";
import GisBoundaryMap, { type GisMapMarker } from "@/components/admin/GisBoundaryMap";
import {
  hazardTypeLabel,
  pointTypeLabel,
  safePointTypeLabel,
} from "@/contants/mapPointLables";
import { getStrategicPoints } from "@/services/dispatch";
import { getAllLocations, getLocationPages } from "@/services/location";
import type {
  HazardType,
  MapPointDetailRes,
  SafePointType,
  StrategicPointsFilterRequest,
} from "@/types/mapPoint";

const mapDetailToRow = (point: MapPointDetailRes): StrategicPointRow => {
  let name = "";
  let phone = "-";
  let status = "Đang hoạt động";
  let statusTone: "success" | "danger" | "warning" | "default" = "success";
  let subTypeLabel: string | undefined = undefined;

  if (point.pointType === "SAFE_ZONE") {
    name = point.detail.name || "Điểm an toàn";
    phone = point.detail.contactPhone || "-";
    subTypeLabel = safePointTypeLabel[point.detail.safePointType] || point.detail.safePointType;
    if (!point.detail.isActive) {
      status = "Tạm dừng";
      statusTone = "default";
    } else {
      status = "Đang hoạt động";
      statusTone = "success";
    }
  } else if (point.pointType === "WARE_HOUSE") {
    name = point.detail.name || "Kho cứu trợ";
    phone = point.detail.managerPhone || "-";
    subTypeLabel = "Kho cứu trợ";
    if (!point.detail.isActive) {
      status = "Tạm dừng";
      statusTone = "default";
    } else {
      status = "Đang hoạt động";
      statusTone = "success";
    }
  } else if (point.pointType === "HAZARD") {
    name = hazardTypeLabel[point.detail.hazardType] || "Hiểm họa";
    phone = "-";
    subTypeLabel = "Điểm hiểm họa";
    if (point.detail.status === "RESOLVED") {
      status = "Đã xử lý";
      statusTone = "success";
    } else if (point.detail.status === "REJECTED") {
      status = "Đã từ chối";
      statusTone = "default";
    } else {
      status = "Đang cảnh báo";
      statusTone = "danger";
    }
  }

  return {
    key: point.id,
    id: point.id,
    name,
    address: point.address || "Chưa cập nhật địa chỉ",
    phone,
    pointType: point.pointType,
    subTypeLabel,
    status,
    statusTone,
    raw: point,
  };
};

export default function StrategicPoints() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(5);

  // Filters matching StrategicPointsFilter
  const [filter, setFilter] = useState<StrategicPointsFilterRequest>({
    pointType: "ALL",
    locationId: undefined,
    safePointType: undefined,
    hazardType: undefined,
    fromTime: "",
    toTime: "",
  });

  // Selected point for detail modal
  const [selectedPoint, setSelectedPoint] = useState<StrategicPointRow | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editPoint, setEditPoint] = useState<MapPointDetailRes | null>(null);

  // View mode: table or map
  const [viewMode, setViewMode] = useState<"table" | "map">("table");

  // Fetch locations for filter dropdown
  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: getAllLocations,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch full location list (with boundary polygon for GIS map)
  const { data: locationPagesData } = useQuery({
    queryKey: ["locations-pages-all"],
    queryFn: () => getLocationPages({ size: 100 }),
    staleTime: 5 * 60 * 1000,
  });

  const locationList = locationPagesData?.content ?? [];
  const selectedLocation = locationList.find((loc) => loc.id === filter.locationId);

  // Query API
  const {
    data: pageData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["strategic-points", filter, page, size],
    queryFn: () => getStrategicPoints(filter, page, size),
  });

  const content = pageData?.content ?? [];
  const totalElements = pageData?.totalElements ?? 0;
  const totalPages = pageData?.totalPages ?? 1;

  const rows: StrategicPointRow[] = content.map(mapDetailToRow);

  // Map markers for GisBoundaryMap
  const mapMarkers: GisMapMarker[] = useMemo(() => {
    return rows.map((row) => ({
      id: row.id,
      latitude: row.raw.latitude,
      longitude: row.raw.longitude,
      title: row.name,
      subtitle: row.subTypeLabel || pointTypeLabel[row.pointType],
      pointType: row.pointType,
      subType: row.raw.pointType === "SAFE_ZONE" ? row.raw.detail.safePointType : undefined,
      status: row.status,
      statusTone: row.statusTone,
      address: row.address,
      phone: row.phone,
      onSelect: () => setSelectedPoint(row),
    }));
  }, [rows]);

  const handleResetFilter = () => {
    setFilter({
      pointType: "ALL",
      locationId: undefined,
      safePointType: undefined,
      hazardType: undefined,
      fromTime: "",
      toTime: "",
    });
    setPage(0);
  };

  const columns: DataTableColumn<StrategicPointRow>[] = [
    {
      key: "name",
      title: "Tên cơ sở / Điểm",
      render: (record) => {
        const subType =
          record.raw.pointType === "SAFE_ZONE"
            ? record.raw.detail.safePointType
            : undefined;

        return (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
              {getPointTypeIcon(record.pointType, subType)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">{record.name}</span>
                {record.subTypeLabel && (
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
                    {record.subTypeLabel}
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400">
                {pointTypeLabel[record.pointType] || record.pointType}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "address",
      title: "Địa chỉ",
      render: (record) => (
        <div className="max-w-md">
          <div className="flex items-start gap-1.5 text-sm text-slate-700">
            <FaMapMarkerAlt className="mt-1 shrink-0 text-slate-400" size={12} />
            <span>{record.address}</span>
          </div>
          <div className="mt-0.5 pl-4 font-mono text-xs text-slate-400">
            {record.raw.latitude.toFixed(5)}, {record.raw.longitude.toFixed(5)}
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      title: "Số điện thoại",
      render: (record) => {
        if (record.phone === "-") {
          return <span className="text-slate-400">-</span>;
        }
        return (
          <a
            href={`tel:${record.phone}`}
            className="inline-flex items-center gap-1.5 font-mono text-sm font-medium text-cyan-700 hover:underline"
          >
            <FaPhoneAlt size={11} className="text-cyan-600" />
            <span>{record.phone}</span>
          </a>
        );
      },
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (record) => (
        <StatusTag tone={record.statusTone}>{record.status}</StatusTag>
      ),
    },
    {
      key: "actions",
      title: "Hành động",
      className: "text-right",
      render: (record) => (
        <div className="flex items-center justify-end gap-1">
          <AdminButton
            variant="link"
            size="sm"
            icon={<FaEye size={12} />}
            onClick={() => setSelectedPoint(record)}
          >
            Chi tiết
          </AdminButton>
          {record.raw.pointType !== "SOS" && (
            <AdminButton
              variant="link"
              size="sm"
              icon={<FaEdit size={12} />}
              onClick={() => setEditPoint(record.raw)}
            >
              Chỉnh sửa
            </AdminButton>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-title font-bold text-slate-900">
            Quản lý Điểm Chiến Lược
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Danh sách các Kho cứu trợ, Trung tâm sơ tán, Trạm y tế và Điểm hiểm họa trên hệ thống.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                viewMode === "table"
                  ? "bg-cyan-700 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FaThList size={11} />
              <span>Bảng danh sách</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("map")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                viewMode === "map"
                  ? "bg-cyan-700 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FaMapMarkedAlt size={11} />
              <span>Bản đồ trực quan</span>
            </button>
          </div>

          <AdminButton
            variant="outline"
            size="sm"
            icon={<FaRedo className={isFetching ? "animate-spin" : ""} size={12} />}
            onClick={() => refetch()}
          >
            Làm mới
          </AdminButton>
          <AdminButton
            variant="primary"
            size="sm"
            icon={<FaPlus size={12} />}
            onClick={() => setCreateModalOpen(true)}
          >
            Tạo điểm mới
          </AdminButton>
        </div>
      </div>

      {/* Filters Card */}
      <AdminCard>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <FaFilter size={12} />
            <span>Bộ lọc điểm chiến lược</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Filter: pointType */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Loại điểm
              </label>
              <select
                value={filter.pointType || "ALL"}
                onChange={(e) => {
                  setFilter((prev) => ({
                    ...prev,
                    pointType: e.target.value,
                    safePointType: undefined,
                    hazardType: undefined,
                  }));
                  setPage(0);
                }}
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600"
              >
                <option value="ALL">Tất cả loại điểm</option>
                <option value="SAFE_ZONE">Điểm an toàn</option>
                <option value="WARE_HOUSE">Kho cứu trợ</option>
                <option value="HAZARD">Điểm nguy hiểm</option>
              </select>
            </div>

            {/* Filter: locationId */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Khu vực quản lý
              </label>
              <select
                value={filter.locationId || ""}
                onChange={(e) => {
                  const val = e.target.value || undefined;
                  setFilter((prev) => ({ ...prev, locationId: val }));
                  setPage(0);
                }}
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600"
              >
                <option value="">Tất cả khu vực</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter: safePointType (if SAFE_ZONE or ALL) */}
            {(!filter.pointType || filter.pointType === "ALL" || filter.pointType === "SAFE_ZONE") && (
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Phân loại điểm an toàn
                </label>
                <select
                  value={filter.safePointType || ""}
                  onChange={(e) => {
                    const val = e.target.value as SafePointType || undefined;
                    setFilter((prev) => ({ ...prev, safePointType: val }));
                    setPage(0);
                  }}
                  className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600"
                >
                  <option value="">Tất cả điểm an toàn</option>
                  <option value="EVACUATION_CENTER">Trung tâm sơ tán</option>
                  <option value="MEDICAL_STATION">Trạm y tế</option>
                  <option value="TEMPORARY_CAMP">Trại tạm</option>
                  <option value="WATER_STATION">Trạm cấp nước</option>
                </select>
              </div>
            )}

            {/* Filter: hazardType (if HAZARD or ALL) */}
            {(!filter.pointType || filter.pointType === "ALL" || filter.pointType === "HAZARD") && (
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Loại hiểm họa
                </label>
                <select
                  value={filter.hazardType || ""}
                  onChange={(e) => {
                    const val = e.target.value as HazardType || undefined;
                    setFilter((prev) => ({ ...prev, hazardType: val }));
                    setPage(0);
                  }}
                  className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600"
                >
                  <option value="">Tất cả hiểm họa</option>
                  <option value="FALLEN_TREE">Cây đổ</option>
                  <option value="LANDSLIDE">Sạt lở</option>
                  <option value="FLOOD_DEEP">Ngập sâu</option>
                  <option value="POWER_LINE_DOWN">Đứt đường điện</option>
                </select>
              </div>
            )}

            {/* Filter: fromTime */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Từ thời gian
              </label>
              <input
                type="datetime-local"
                value={filter.fromTime || ""}
                onChange={(e) => {
                  setFilter((prev) => ({ ...prev, fromTime: e.target.value }));
                  setPage(0);
                }}
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600"
              />
            </div>

            {/* Filter: toTime */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Đến thời gian
              </label>
              <input
                type="datetime-local"
                value={filter.toTime || ""}
                onChange={(e) => {
                  setFilter((prev) => ({ ...prev, toTime: e.target.value }));
                  setPage(0);
                }}
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-400">
              Tổng số bản ghi: <strong className="text-slate-700">{totalElements}</strong> điểm
            </span>

            {(filter.pointType !== "ALL" ||
              filter.locationId ||
              filter.safePointType ||
              filter.hazardType ||
              filter.fromTime ||
              filter.toTime) && (
              <button
                type="button"
                onClick={handleResetFilter}
                className="text-xs font-medium text-rose-600 hover:underline"
              >
                Đặt lại bộ lọc
              </button>
            )}
          </div>
        </div>
      </AdminCard>

      {/* Map View Card */}
      {viewMode === "map" && (
        <AdminCard>
          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FaMapMarkedAlt className="text-cyan-700" size={16} />
                <span className="text-sm font-bold text-slate-900">
                  Bản đồ trực quan điểm chiến lược
                </span>
                <span className="rounded bg-cyan-50 px-2 py-0.5 text-xs font-semibold text-cyan-700 border border-cyan-200">
                  {mapMarkers.length} điểm hiển thị
                </span>
                {selectedLocation && (
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                    Khu vực: {selectedLocation.name}
                  </span>
                )}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-600"></span>
                  <span>Kho cứu trợ</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-600"></span>
                  <span>Điểm an toàn</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-600"></span>
                  <span>Điểm hiểm họa</span>
                </div>
                {selectedLocation?.boundary && (
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-[#10b4c0]/30 border border-[#10b4c0]"></span>
                    <span>Ranh giới khu vực</span>
                  </div>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <FaRedo className="animate-spin text-2xl text-cyan-700" />
                <p className="mt-3 text-sm">Đang tải dữ liệu điểm chiến lược lên bản đồ...</p>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FaExclamationTriangle className="text-3xl text-rose-500" />
                <h3 className="mt-3 text-base font-semibold text-slate-800">
                  Lỗi khi tải dữ liệu bản đồ
                </h3>
                <AdminButton
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => refetch()}
                >
                  Thử lại
                </AdminButton>
              </div>
            ) : mapMarkers.length === 0 && !selectedLocation?.boundary ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <FaMapMarkerAlt className="text-3xl text-slate-300" />
                <h3 className="mt-3 text-base font-semibold text-slate-700">
                  Không có điểm chiến lược nào trên bản đồ
                </h3>
                <p className="mt-1 text-sm text-slate-400 max-w-sm">
                  Không tìm thấy điểm nào khớp với điều kiện lọc hiện tại.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilter}
                  className="mt-3 text-xs font-semibold text-cyan-700 hover:underline"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <GisBoundaryMap
                boundary={selectedLocation?.boundary}
                zoneName={selectedLocation?.name}
                markers={mapMarkers}
                readOnly={true}
                autoFit={true}
                height={550}
                hideHeader={true}
              />
            )}
          </div>
        </AdminCard>
      )}

      {/* Main Table Card */}
      {viewMode === "table" && (
        <AdminCard>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <FaRedo className="animate-spin text-2xl" />
              <p className="mt-3 text-sm">Đang tải dữ liệu điểm chiến lược...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FaExclamationTriangle className="text-3xl text-rose-500" />
              <h3 className="mt-3 text-base font-semibold text-slate-800">
                Lỗi khi tải dữ liệu điểm chiến lược
              </h3>
              <p className="mt-1 text-sm text-slate-500 max-w-sm">
                {error instanceof Error ? error.message : "Vui lòng kiểm tra kết nối mạng hoặc thử lại."}
              </p>
              <AdminButton
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => refetch()}
              >
                Thử lại
              </AdminButton>
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FaMapMarkerAlt className="text-3xl text-slate-300" />
              <h3 className="mt-3 text-base font-semibold text-slate-700">
                Không có điểm chiến lược nào
              </h3>
              <p className="mt-1 text-sm text-slate-400 max-w-sm">
                Không tìm thấy bản ghi nào khớp với điều kiện lọc hiện tại.
              </p>
              <button
                type="button"
                onClick={handleResetFilter}
                className="mt-3 text-xs font-semibold text-cyan-700 hover:underline"
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <DataTable columns={columns} rows={rows} />

              {/* Pagination Controls */}
              <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Số dòng mỗi trang:</span>
                  <select
                    value={size}
                    onChange={(e) => {
                      setSize(Number(e.target.value));
                      setPage(0);
                    }}
                    className="h-8 rounded border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="ml-2">
                    Hiển thị {rows.length > 0 ? page * size + 1 : 0} -{" "}
                    {Math.min((page + 1) * size, totalElements)} trên {totalElements}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <AdminButton
                    variant="outline"
                    size="sm"
                    disabled={page === 0 || isLoading}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                  >
                    Trang trước
                  </AdminButton>
                  <span className="text-xs font-medium text-slate-600 px-2">
                    Trang {page + 1} / {totalPages || 1}
                  </span>
                  <AdminButton
                    variant="outline"
                    size="sm"
                    disabled={page + 1 >= totalPages || isLoading}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Trang sau
                  </AdminButton>
                </div>
              </div>
            </div>
          )}
        </AdminCard>
      )}

      {/* Modal: Xem chi tiết điểm chiến lược */}
      <StrategicPointDetailModal
        open={Boolean(selectedPoint)}
        point={selectedPoint}
        onClose={() => setSelectedPoint(null)}
        onEdit={(pointToEdit) => {
          setSelectedPoint(null);
          setEditPoint(pointToEdit);
        }}
      />

      {/* Modal: Tạo điểm chiến lược mới */}
      <CreateStrategicPointModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      {/* Modal: Chỉnh sửa điểm chiến lược */}
      <EditStrategicPointModal
        open={Boolean(editPoint)}
        point={editPoint}
        onClose={() => setEditPoint(null)}
      />
    </div>
  );
}
