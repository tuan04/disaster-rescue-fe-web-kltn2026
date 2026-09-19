import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FaAmbulance,
  FaExclamationTriangle,
  FaEye,
  FaFilter,
  FaMapMarkedAlt,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaRedo,
  FaThList,
  FaClock,
  FaCheckCircle,
  FaExternalLinkAlt,
  FaCopy,
} from "react-icons/fa";
import toast from "react-hot-toast";

import {
  AdminButton,
  AdminCard,
  DataTable,
  type DataTableColumn,
} from "@/components/ui/admin/AdminUi";
import RescueDetailModal, {
  type RescueRequestRow,
} from "@/components/admin/RescueDetailModal";
import AssignRescueModal from "@/components/admin/AssignRescueModal";
import GisBoundaryMap, { type GisMapMarker } from "@/components/admin/GisMap";
import { emergencyLevelLabel, requestSourceLabel } from "@/contants/mapPointLables";
import { formatDateTime } from "@/helpers/dateHelper";
import { getPendingRescueRequests } from "@/services/dispatch";
import type {
  EmergencyLevel,
  MapPointDetailRes,
  RequestSource,
  SosDetailRes,
} from "@/types/mapPoint";

const mapDetailToRescueRow = (point: MapPointDetailRes): RescueRequestRow => {
  const sosDetail = point.detail as SosDetailRes;

  return {
    key: point.id,
    id: point.id,
    address: point.address || "Chưa xác định địa chỉ cụ thể",
    latitude: point.latitude,
    longitude: point.longitude,
    createdAt: point.createdAt,
    reporterPhone: sosDetail?.reporterPhone || "-",
    content: sosDetail?.content || "Không có mô tả chi tiết",
    emergencyLevel: sosDetail?.emergencyLevel || "MEDIUM",
    source: sosDetail?.source || "APP",
    status: sosDetail?.status || "PENDING",
    raw: point,
  };
};

export default function CoordinateRescue() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  // Filters
  const [emergencyLevel, setEmergencyLevel] = useState<EmergencyLevel | "ALL">("ALL");
  const [source, setSource] = useState<RequestSource | "ALL">("ALL");
  const [searchKeyword, setSearchKeyword] = useState("");

  // View mode
  const [viewMode, setViewMode] = useState<"table" | "map">("table");

  // Selected rescue request for detail modal
  const [selectedRescue, setSelectedRescue] = useState<RescueRequestRow | null>(null);

  // Selected rescue request for assign modal
  const [assignRescue, setAssignRescue] = useState<RescueRequestRow | null>(null);

  // Query API
  const {
    data: pageData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "pending-rescue-requests",
      emergencyLevel === "ALL" ? undefined : emergencyLevel,
      source === "ALL" ? undefined : source,
      page,
      size,
    ],
    queryFn: () =>
      getPendingRescueRequests({
        emergencyLevel: emergencyLevel === "ALL" ? undefined : emergencyLevel,
        source: source === "ALL" ? undefined : source,
        page,
        size,
        sort: "createdAt,desc",
      }),
  });

  const content = pageData?.content ?? [];
  const totalElements = pageData?.totalElements ?? 0;
  const totalPages = pageData?.totalPages ?? 1;

  // Map to row data
  const rows: RescueRequestRow[] = useMemo(() => {
    return content.map(mapDetailToRescueRow);
  }, [content]);

  // Client-side search keyword filtering
  const filteredRows = useMemo(() => {
    if (!searchKeyword.trim()) return rows;
    const kw = searchKeyword.trim().toLowerCase();
    return rows.filter(
      (r) =>
        r.reporterPhone.toLowerCase().includes(kw) ||
        r.content.toLowerCase().includes(kw) ||
        r.address.toLowerCase().includes(kw) ||
        r.id.toLowerCase().includes(kw)
    );
  }, [rows, searchKeyword]);

  // Map markers for GisBoundaryMap
  const mapMarkers: GisMapMarker[] = useMemo(() => {
    return filteredRows.map((row) => ({
      id: row.id,
      latitude: row.latitude,
      longitude: row.longitude,
      title: `SOS: ${row.reporterPhone}`,
      subtitle: `${emergencyLevelLabel[row.emergencyLevel] || row.emergencyLevel} - ${requestSourceLabel[row.source] || row.source}`,
      pointType: "SOS",
      status: "Chờ tiếp nhận",
      statusTone: row.emergencyLevel === "HIGH" ? "danger" : "warning",
      address: row.address,
      phone: row.reporterPhone,
      onSelect: () => setSelectedRescue(row),
    }));
  }, [filteredRows]);

  const handleResetFilter = () => {
    setEmergencyLevel("ALL");
    setSource("ALL");
    setSearchKeyword("");
    setPage(0);
  };

  const hasActiveFilter =
    emergencyLevel !== "ALL" || source !== "ALL" || Boolean(searchKeyword.trim());

  const renderSourceTag = (src: RequestSource) => {
    if (src === "APP") {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700 ring-1 ring-inset ring-sky-200">
          <span>APP</span>
        </span>
      );
    }
    if (src === "SOCIAL") {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700 ring-1 ring-inset ring-purple-200">
          <span>Mạng xã hội</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
        <span>Tin nhắn SMS</span>
      </span>
    );
  };

  const columns: DataTableColumn<RescueRequestRow>[] = [
    {
      key: "id_time",
      title: "Mã SOS & Thời gian",
      render: (record) => {
        const shortId = record.id.slice(0, 8);
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                #{shortId}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(record.id);
                  toast.success("Đã sao chép mã yêu cầu");
                }}
                title="Sao chép toàn bộ ID"
                className="text-slate-400 hover:text-slate-600"
              >
                <FaCopy size={10} />
              </button>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <FaClock size={10} className="shrink-0 text-slate-400" />
              <span>{formatDateTime(record.createdAt)}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: "emergencyLevel",
      title: "Mức độ khẩn cấp",
      render: (record) => {
        const isHigh = record.emergencyLevel === "HIGH";
        return (
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${
                isHigh
                  ? "bg-rose-100 text-rose-800 ring-rose-300 animate-pulse"
                  : record.emergencyLevel === "MEDIUM"
                    ? "bg-amber-100 text-amber-800 ring-amber-300"
                    : "bg-blue-100 text-blue-800 ring-blue-300"
              }`}
            >
              {isHigh && <FaExclamationTriangle size={11} className="text-rose-600" />}
              {emergencyLevelLabel[record.emergencyLevel] || record.emergencyLevel}
            </span>
          </div>
        );
      },
    },
    {
      key: "contact",
      title: "SĐT",
      render: (record) => {
        if (!record.reporterPhone || record.reporterPhone === "-") {
          return <span className="text-slate-400">Không có SĐT</span>;
        }
        return (
          <div className="flex items-center gap-2">
            <a
              href={`tel:${record.reporterPhone}`}
              className="inline-flex items-center gap-1.5 font-mono text-sm font-semibold text-cyan-700 hover:text-cyan-800 hover:underline"
            >
              <FaPhoneAlt size={11} className="text-cyan-600" />
              <span>{record.reporterPhone}</span>
            </a>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(record.reporterPhone);
                toast.success("Đã sao chép SĐT");
              }}
              className="text-slate-400 hover:text-slate-600"
              title="Sao chép số điện thoại"
            >
              <FaCopy size={11} />
            </button>
          </div>
        );
      },
    },
    {
      key: "content",
      title: "Nội dung",
      render: (record) => (
        <div className="max-w-xs md:max-w-md">
          <p
            className="line-clamp-2 text-sm text-slate-800 leading-snug cursor-pointer hover:text-slate-950"
            title={record.content}
            onClick={() => setSelectedRescue(record)}
          >
            {record.content}
          </p>
        </div>
      ),
    },
    {
      key: "address",
      title: "Địa chỉ & Tọa độ",
      render: (record) => (
        <div className="max-w-xs">
          <div className="flex items-start gap-1.5 text-xs text-slate-700 leading-snug">
            <FaMapMarkerAlt className="mt-0.5 shrink-0 text-rose-500" size={11} />
            <span className="line-clamp-2">{record.address}</span>
          </div>
          <div className="mt-0.5 pl-4 font-mono text-[11px] text-slate-400">
            {record.latitude.toFixed(4)}, {record.longitude.toFixed(4)}
          </div>
        </div>
      ),
    },
    {
      key: "source",
      title: "Nguồn",
      render: (record) => renderSourceTag(record.source),
    },
    {
      key: "actions",
      title: "Thao tác",
      className: "text-right",
      render: (record) => (
        <div className="flex items-center justify-end gap-1.5">
          <AdminButton
            variant="link"
            size="sm"
            icon={<FaAmbulance size={13} />}
            onClick={() => setAssignRescue(record)}
            className="text-slate-600 hover:text-slate-900 font-semibold"
          >
            Cứu hộ
          </AdminButton>
          <AdminButton
            variant="link"
            size="sm"
            icon={<FaEye size={13} />}
            onClick={() => setSelectedRescue(record)}
          >
            Xem
          </AdminButton>
          <a
            href={`https://www.google.com/maps?q=${record.latitude},${record.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Mở trên Google Maps"
          >
            <FaExternalLinkAlt size={11} />
          </a>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 text-rose-600 shadow-sm">
              <FaAmbulance size={18} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 md:text-2xl">
              Điều phối cứu hộ
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 md:text-sm">
            Quản lý và tiếp nhận các yêu cầu cứu nạn khẩn cấp đang chờ xử lý trong hệ thống
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View toggle (Table / Map) */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                viewMode === "table"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FaThList size={12} />
              <span>Dạng bảng</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                viewMode === "map"
                  ? "bg-cyan-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FaMapMarkedAlt size={12} />
              <span>Bản đồ trực quan</span>
            </button>
          </div>

          {/* Refresh button */}
          <AdminButton
            variant="outline"
            size="md"
            icon={<FaRedo size={12} className={isFetching ? "animate-spin text-cyan-700" : ""} />}
            onClick={() => refetch()}
            disabled={isFetching}
            title="Làm mới danh sách"
          >
            Làm mới
          </AdminButton>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <AdminCard>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
              <FaFilter size={12} className="text-cyan-700" />
              <span>Bộ lọc yêu cầu cứu hộ</span>
            </div>
            {hasActiveFilter && (
              <button
                type="button"
                onClick={handleResetFilter}
                className="text-xs font-semibold text-rose-600 hover:underline"
              >
                Đặt lại bộ lọc
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

            {/* Filter by Emergency Level */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Mức độ khẩn cấp
              </label>
              <select
                value={emergencyLevel}
                onChange={(e) => {
                  setEmergencyLevel(e.target.value as EmergencyLevel | "ALL");
                  setPage(0);
                }}
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600"
              >
                <option value="ALL">Tất cả mức độ</option>
                <option value="HIGH">Cao (Khẩn cấp cao)</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="LOW">Thấp</option>
              </select>
            </div>

            {/* Filter by Request Source */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Nguồn tiếp nhận
              </label>
              <select
                value={source}
                onChange={(e) => {
                  setSource(e.target.value as RequestSource | "ALL");
                  setPage(0);
                }}
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600"
              >
                <option value="ALL">Tất cả nguồn</option>
                <option value="APP">APP</option>
                <option value="SOCIAL">Mạng xã hội (SOCIAL)</option>
                <option value="SMS">Tin nhắn SMS (SMS)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
            <span>
              Tổng số yêu cầu tìm thấy:{" "}
              <strong className="text-slate-800">{totalElements}</strong> ca
            </span>
            {searchKeyword.trim() && (
              <span>
                Khớp từ khóa trang này:{" "}
                <strong className="text-cyan-700">{filteredRows.length}</strong> ca
              </span>
            )}
          </div>
        </div>
      </AdminCard>

      {/* Map View Mode */}
      {viewMode === "map" && (
        <AdminCard>
          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FaMapMarkedAlt className="text-rose-600" size={16} />
                <span className="text-sm font-bold text-slate-900">
                  Bản đồ các điểm SOS chờ cứu hộ
                </span>
                <span className="rounded bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
                  {mapMarkers.length} điểm hiển thị
                </span>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-rose-600 ring-2 ring-white"></span>
                  <span>Điểm SOS khẩn cấp</span>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <FaRedo className="animate-spin text-2xl text-cyan-700" />
                <p className="mt-3 text-sm">Đang tải bản đồ điểm cứu hộ...</p>
              </div>
            ) : (
              <GisBoundaryMap
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
              <FaRedo className="animate-spin text-2xl text-cyan-700" />
              <p className="mt-3 text-sm">Đang tải danh sách yêu cầu cứu hộ...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FaExclamationTriangle className="text-3xl text-rose-500" />
              <h3 className="mt-3 text-base font-semibold text-slate-800">
                Lỗi khi tải danh sách yêu cầu cứu hộ
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
          ) : filteredRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FaCheckCircle className="text-3xl text-emerald-400" />
              <h3 className="mt-3 text-base font-semibold text-slate-800">
                Hiện không có yêu cầu cứu hộ nào chờ xử lý
              </h3>
              <p className="mt-1 text-sm text-slate-400 max-w-sm">
                Không tìm thấy yêu cầu nào khớp với tiêu chí lọc hoặc tất cả các ca đều đã được tiếp nhận.
              </p>
              {hasActiveFilter && (
                <button
                  type="button"
                  onClick={handleResetFilter}
                  className="mt-3 text-xs font-semibold text-cyan-700 hover:underline"
                >
                  Xóa bộ lọc để xem toàn bộ
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <DataTable columns={columns} rows={filteredRows} />

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
                    className="h-8 rounded border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-cyan-600"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="ml-2">
                    Hiển thị {filteredRows.length > 0 ? page * size + 1 : 0} -{" "}
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

      {/* Modal: Xem chi tiết yêu cầu cứu hộ */}
      <RescueDetailModal
        open={Boolean(selectedRescue)}
        rescue={selectedRescue}
        onClose={() => setSelectedRescue(null)}
        onAssign={(r) => {
          setSelectedRescue(null);
          setAssignRescue(r);
        }}
      />

      {/* Modal: Điều phối / Gán đội cứu hộ */}
      <AssignRescueModal
        open={Boolean(assignRescue)}
        rescue={assignRescue}
        onClose={() => setAssignRescue(null)}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
}
