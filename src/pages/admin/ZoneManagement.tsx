import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FaLayerGroup,
  FaRedo,
  FaPhoneAlt,
  FaUser,
  FaExclamationTriangle,
  FaEye,
  FaEdit,
  FaPlus,
  FaCompass,
} from "react-icons/fa";

import {
  AdminButton,
  AdminCard,
  DataTable,
  type DataTableColumn,
  StatusTag,
} from "@/components/ui/admin/AdminUi";
import CreateZoneModal from "@/components/admin/CreateZoneModal";
import EditZoneModal from "@/components/admin/EditZoneModal";
import ZoneDetailModal from "@/components/admin/ZoneDetailModal";
import { getLocationPages } from "@/services/location";
import { getUserNames } from "@/services/user";
import {
  locationStatusMeta,
  type LocationFilterParams,
  type LocationPageResponse,
  type LocationStatus,
} from "@/types/location";

interface ZoneTableRow extends LocationPageResponse {
  key: string;
}

export default function ZoneManagement() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  // Filters
  const [statusFilter, setStatusFilter] = useState<LocationStatus | "ALL">("ALL");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "TRUE" | "FALSE">("ALL");
  const [userIdFilter, setUserIdFilter] = useState("");

  // Modals state
  const [selectedZone, setSelectedZone] = useState<LocationPageResponse | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editZone, setEditZone] = useState<LocationPageResponse | null>(null);

  // Query Users for dropdown: http://localhost:8000/api/v1/users/names
  const { data: userOptions = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["user-names"],
    queryFn: getUserNames,
    staleTime: 5 * 60 * 1000,
  });


  const filterParams: LocationFilterParams = useMemo(() => {
    const params: LocationFilterParams = {
      page,
      size,
    };
    if (statusFilter !== "ALL") {
      params.status = statusFilter;
    }
    if (activeFilter === "TRUE") {
      params.isActive = true;
    } else if (activeFilter === "FALSE") {
      params.isActive = false;
    }
    if (userIdFilter.trim()) {
      params.userId = userIdFilter.trim();
    }
    return params;
  }, [page, size, statusFilter, activeFilter, userIdFilter]);

  const {
    data: pageData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["locations-pages", filterParams],
    queryFn: () => getLocationPages(filterParams),
  });

  const content = pageData?.content ?? [];
  const totalElements = pageData?.totalElements ?? 0;
  const totalPages = pageData?.totalPages ?? 1;

  const rows: ZoneTableRow[] = useMemo(
    () => content.map((loc) => ({ ...loc, key: loc.id })),
    [content]
  );

  // Tổng hợp danh sách người quản trị từ user-service VÀ từ các khu vực hiện có
  const allUserOptions = useMemo(() => {
    const map = new Map<string, string>();
    userOptions.forEach((u) => {
      if (u.id && u.name) map.set(u.id, u.name);
    });
    content.forEach((loc) => {
      if (loc.userId && !map.has(loc.userId)) {
        map.set(loc.userId, loc.userName || "Quản trị viên khu vực");
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [userOptions, content]);

  const handleResetFilter = () => {
    setStatusFilter("ALL");
    setActiveFilter("ALL");
    setUserIdFilter("");
    setPage(0);
  };

  // Table Columns Definition
  const columns: DataTableColumn<ZoneTableRow>[] = [
    {
      key: "name",
      title: "Khu vực điều phối",
      render: (record) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-secondary">
            <FaLayerGroup size={18} />
          </div>
          <div className="font-semibold text-text">{record.name}</div>
        </div>
      ),
    },
    {
      key: "manager",
      title: "Người quản trị",
      render: (record) =>
        record.userName || record.userPhone ? (
          <div>
            <div className="flex items-center gap-1.5 font-medium text-text">
              <FaUser size={12} className="text-slate-400" />
              <span>{record.userName || "Chưa có tên"}</span>
            </div>
            {record.userPhone && (
              <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                <FaPhoneAlt size={10} className="text-slate-400" />
                <span>{record.userPhone}</span>
              </div>
            )}
          </div>
        ) : (
          <span className="inline-flex items-center text-xs italic text-slate-400">
            Chưa gán quản lý
          </span>
        ),
    },
    {
      key: "radius",
      title: "Bán kính ứng cứu",
      render: (record) => (
        <div className="text-sm font-medium text-slate-700">
          {record.radiusMeters ? (
            <span>
              {record.radiusMeters >= 1000
                ? `${(record.radiusMeters / 1000).toLocaleString()} km`
                : `${record.radiusMeters.toLocaleString()} m`}
            </span>
          ) : (
            <span className="text-slate-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (record) => {
        const meta = locationStatusMeta[record.status] || {
          label: record.status,
          tone: "default",
        };
        return <StatusTag tone={meta.tone}>{meta.label}</StatusTag>;
      },
    },
    {
      key: "isActive",
      title: "Kích hoạt",
      render: (record) => (
        <StatusTag tone={record.isActive ? "success" : "default"}>
          {record.isActive ? "Đang bật" : "Tạm tắt"}
        </StatusTag>
      ),
    },
    {
      key: "action",
      title: "Thao tác",
      render: (record) => (
        <div className="flex items-center gap-1">
          <AdminButton
            variant="link"
            size="sm"
            icon={<FaEye size={13} />}
            onClick={() => setSelectedZone(record)}
          >
            Xem
          </AdminButton>
          <AdminButton
            variant="link"
            size="sm"
            icon={<FaEdit size={12} />}
            onClick={() => setEditZone(record)}
          >
            Chỉnh sửa
          </AdminButton>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-title font-bold text-text flex items-center gap-2.5">
            <FaLayerGroup className="text-secondary" />
            <span>Quản lý khu vực (Zone Management)</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi phân quyền quản trị viên phụ trách và trạng thái điều phối cứu hộ theo từng khu vực.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <AdminButton
            variant="outline"
            size="sm"
            icon={<FaRedo className={isFetching ? "animate-spin" : ""} />}
            onClick={() => refetch()}
            disabled={isFetching}
          >
            Làm mới
          </AdminButton>

          <AdminButton
            variant="primary"
            size="sm"
            icon={<FaPlus size={12} />}
            onClick={() => setCreateModalOpen(true)}
          >
            Tạo khu vực
          </AdminButton>
        </div>
      </div>

      {/* Filter Card */}
      <AdminCard>
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-sm font-semibold text-text flex items-center gap-2">
              <FaCompass className="text-secondary" />
              <span>Bộ lọc dữ liệu khu vực</span>
            </span>

            {(statusFilter !== "ALL" || activeFilter !== "ALL" || userIdFilter.trim()) && (
              <button
                type="button"
                onClick={handleResetFilter}
                className="text-xs font-medium text-danger hover:underline"
              >
                Đặt lại bộ lọc
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* User Filter Dropdown */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Người quản trị hệ thống
              </label>
              <div className="relative">
                <select
                  value={userIdFilter}
                  onChange={(e) => {
                    setUserIdFilter(e.target.value);
                    setPage(0);
                  }}
                  disabled={isLoadingUsers && allUserOptions.length === 0}
                  className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-text outline-none transition-colors focus:border-secondary focus:ring-1 focus:ring-secondary disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">Tất cả người quản trị</option>
                  {allUserOptions.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                  {userIdFilter && !allUserOptions.some((u) => u.id === userIdFilter) && (
                    <option value={userIdFilter}>Người quản trị đang chọn</option>
                  )}
                </select>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Trạng thái vận hành
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as LocationStatus | "ALL");
                  setPage(0);
                }}
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-text outline-none transition-colors focus:border-secondary focus:ring-1 focus:ring-secondary"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Hoạt động bình thường</option>
                <option value="ISOLATE">Bị cô lập</option>
                <option value="OVERLOADED">Quá tải cứu hộ</option>
                <option value="DISABLED">Tạm dừng vận hành</option>
              </select>
            </div>

            {/* Active Filter */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Kích hoạt hệ thống
              </label>
              <select
                value={activeFilter}
                onChange={(e) => {
                  setActiveFilter(e.target.value as "ALL" | "TRUE" | "FALSE");
                  setPage(0);
                }}
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-text outline-none transition-colors focus:border-secondary focus:ring-1 focus:ring-secondary"
              >
                <option value="ALL">Tất cả</option>
                <option value="TRUE">Đang bật</option>
                <option value="FALSE">Tạm tắt</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-400">
              Tổng số bản ghi: <strong className="text-text">{totalElements}</strong> khu vực
            </span>
          </div>
        </div>
      </AdminCard>

      {/* Main Table Card */}
      <AdminCard>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <FaRedo className="animate-spin text-2xl text-secondary" />
            <p className="mt-3 text-sm">Đang tải danh sách khu vực điều phối...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FaExclamationTriangle className="text-3xl text-danger" />
            <h3 className="mt-3 text-base font-semibold text-text">
              Lỗi khi tải dữ liệu khu vực
            </h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm">
              {error instanceof Error ? error.message : "Vui lòng kiểm tra lại kết nối hoặc thử lại."}
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
            <FaLayerGroup className="text-3xl text-slate-300" />
            <h3 className="mt-3 text-base font-semibold text-slate-700">
              Không tìm thấy khu vực nào
            </h3>
            <p className="mt-1 text-sm text-slate-400 max-w-sm">
              Không có bản ghi khu vực nào khớp với điều kiện lọc hiện tại.
            </p>
            <button
              type="button"
              onClick={handleResetFilter}
              className="mt-3 text-xs font-semibold text-secondary hover:underline"
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
                  className="h-8 rounded border border-slate-200 bg-white px-2 text-xs text-text outline-none"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="ml-2">
                  Hiển thị {rows.length > 0 ? page * size + 1 : 0} -{" "}
                  {Math.min((page + 1) * size, totalElements)} trên {totalElements} khu vực
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
                <span className="text-xs font-medium text-text px-2">
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

      {/* Modal: Chi tiết khu vực & Bản đồ ranh giới */}
      <ZoneDetailModal
        open={Boolean(selectedZone)}
        zone={selectedZone}
        onClose={() => setSelectedZone(null)}
        onEdit={(zoneToEdit) => {
          setSelectedZone(null);
          setEditZone(zoneToEdit);
        }}
      />

      {/* Modal: Tạo mới khu vực điều phối */}
      <CreateZoneModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      {/* Modal: Chỉnh sửa khu vực điều phối (userId, name, radiusMeters, status, isActive) */}
      <EditZoneModal
        open={Boolean(editZone)}
        zone={editZone}
        onClose={() => setEditZone(null)}
      />
    </div>
  );
}
