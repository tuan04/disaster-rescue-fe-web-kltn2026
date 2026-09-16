import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FaCampground,
  FaEdit,
  FaExclamationTriangle,
  FaExternalLinkAlt,
  FaEye,
  FaFilter,
  FaHospital,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaPlus,
  FaRedo,
  FaShieldAlt,
  FaTint,
  FaWarehouse,
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
import Modal from "@/components/ui/common/Modal";
import {
  hazardTypeLabel,
  pointTypeLabel,
  safePointTypeLabel,
} from "@/contants/mapPointLables";
import { getStrategicPoints } from "@/services/dispatch";
import { getAllLocations } from "@/services/location";
import type {
  HazardType,
  MapPointDetailRes,
  PointType,
  SafePointType,
  StrategicPointsFilterRequest,
} from "@/types/mapPoint";

interface StrategicPointRow {
  key: string;
  id: string;
  name: string;
  address: string;
  phone: string;
  pointType: PointType;
  subTypeLabel?: string;
  status: string;
  statusTone: "success" | "danger" | "warning" | "default";
  raw: MapPointDetailRes;
}

const getPointTypeIcon = (pointType: PointType, subType?: string) => {
  if (pointType === "WARE_HOUSE") {
    return <FaWarehouse className="text-cyan-600" size={16} />;
  }
  if (pointType === "HAZARD") {
    return <FaExclamationTriangle className="text-amber-600" size={16} />;
  }
  if (pointType === "SAFE_ZONE") {
    if (subType === "MEDICAL_STATION") {
      return <FaHospital className="text-rose-600" size={16} />;
    }
    if (subType === "WATER_STATION") {
      return <FaTint className="text-blue-600" size={16} />;
    }
    if (subType === "TEMPORARY_CAMP") {
      return <FaCampground className="text-amber-600" size={16} />;
    }
    return <FaShieldAlt className="text-emerald-600" size={16} />;
  }
  return <FaMapMarkerAlt className="text-slate-600" size={16} />;
};

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

  // Fetch locations for filter dropdown
  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: getAllLocations,
    staleTime: 5 * 60 * 1000,
  });


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

        <div className="flex items-center gap-2">
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

      {/* Main Table Card */}
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

      {/* Modal: Xem chi tiết điểm chiến lược */}
      <Modal
        open={Boolean(selectedPoint)}
        title="Chi tiết điểm chiến lược"
        onClose={() => setSelectedPoint(null)}
      >
        {selectedPoint && (
          <div className="flex flex-col gap-4">
            {/* Header info */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                {getPointTypeIcon(
                  selectedPoint.pointType,
                  selectedPoint.raw.pointType === "SAFE_ZONE"
                    ? selectedPoint.raw.detail.safePointType
                    : undefined
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedPoint.name}
                </h3>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">
                    {pointTypeLabel[selectedPoint.pointType]}
                  </span>
                  {selectedPoint.subTypeLabel && (
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
                      {selectedPoint.subTypeLabel}
                    </span>
                  )}
                  <StatusTag tone={selectedPoint.statusTone}>
                    {selectedPoint.status}
                  </StatusTag>
                </div>
              </div>
            </div>

            {/* Address & GPS */}
            <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
              <span className="text-xs font-semibold text-slate-400 uppercase">
                Địa chỉ & Tọa độ
              </span>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {selectedPoint.address}
              </p>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono">
                  {selectedPoint.raw.latitude.toFixed(5)}, {selectedPoint.raw.longitude.toFixed(5)}
                </span>
                <a
                  href={`https://www.google.com/maps?q=${selectedPoint.raw.latitude},${selectedPoint.raw.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-cyan-700 hover:underline"
                >
                  <span>Google Maps</span>
                  <FaExternalLinkAlt size={10} />
                </a>
              </div>
            </div>

            {/* Phone contact */}
            <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
              <span className="text-xs font-semibold text-slate-400 uppercase">
                Đầu mối liên hệ
              </span>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Số điện thoại:</span>
                {selectedPoint.phone !== "-" ? (
                  <a
                    href={`tel:${selectedPoint.phone}`}
                    className="inline-flex items-center gap-1.5 font-mono text-sm font-bold text-cyan-700 hover:underline"
                  >
                    <FaPhoneAlt size={11} />
                    <span>{selectedPoint.phone}</span>
                  </a>
                ) : (
                  <span className="text-xs text-slate-400">Không có</span>
                )}
              </div>
            </div>

            {/* Specific detail for each point type */}
            {selectedPoint.raw.pointType === "SAFE_ZONE" && (
              <div className="rounded-lg border border-slate-200 p-3">
                <span className="text-xs font-semibold text-slate-400 uppercase">
                  Thông tin điểm an toàn
                </span>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Phân loại:</span>{" "}
                    <span className="font-semibold text-slate-800">
                      {safePointTypeLabel[selectedPoint.raw.detail.safePointType]}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Trạng thái:</span>{" "}
                    <span className="font-semibold text-slate-800">
                      {selectedPoint.raw.detail.isActive ? "Hoạt động" : "Tạm dừng"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {selectedPoint.raw.pointType === "WARE_HOUSE" && (
              <div className="rounded-lg border border-slate-200 p-3">
                <span className="text-xs font-semibold text-slate-400 uppercase">
                  Thông tin kho cứu trợ
                </span>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Tên kho:</span>{" "}
                    <span className="font-semibold text-slate-800">
                      {selectedPoint.raw.detail.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Quản lý kho:</span>{" "}
                    <span className="font-mono font-semibold text-slate-800">
                      {selectedPoint.raw.detail.managerPhone || "Đang cập nhật"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {selectedPoint.raw.pointType === "HAZARD" && (
              <div className="space-y-3">
                <div className="rounded-lg border border-slate-200 p-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase">
                    Mô tả tình hình hiểm họa
                  </span>
                  <p className="mt-1 text-sm text-slate-700">
                    {selectedPoint.raw.detail.description || "Chưa có mô tả chi tiết."}
                  </p>
                </div>

                {selectedPoint.raw.detail.imageUrls &&
                  selectedPoint.raw.detail.imageUrls.length > 0 && (
                    <div>
                      <span className="text-xs font-semibold text-slate-400 uppercase">
                        Hình ảnh hiện trường
                      </span>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {selectedPoint.raw.detail.imageUrls.map((url, i) => (
                          <img
                            key={i}
                            src={url}
                            alt="Hiện trường"
                            className="h-24 w-full rounded-lg object-cover border border-slate-200"
                          />
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
              <span>Thời gian tạo: {selectedPoint.raw.createdAt || "N/A"}</span>
              <div className="flex items-center gap-2">
                {selectedPoint.raw.pointType !== "SOS" && (
                  <AdminButton
                    variant="primary"
                    size="sm"
                    icon={<FaEdit size={12} />}
                    onClick={() => {
                      const pointToEdit = selectedPoint.raw;
                      setSelectedPoint(null);
                      setEditPoint(pointToEdit);
                    }}
                  >
                    Chỉnh sửa
                  </AdminButton>
                )}
                <AdminButton
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPoint(null)}
                >
                  Đóng
                </AdminButton>
              </div>
            </div>
          </div>
        )}
      </Modal>

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
