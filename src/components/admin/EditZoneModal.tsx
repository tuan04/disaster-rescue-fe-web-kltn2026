import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FaInfoCircle, FaCheckCircle } from "react-icons/fa";

import { AdminButton } from "@/components/ui/admin/AdminUi";
import Modal from "@/components/ui/common/Modal";
import GisBoundaryMap from "@/components/admin/GisMap";
import { updateLocation } from "@/services/location";
import { getUserNames } from "@/services/user";
import type {
  LocationPageResponse,
  LocationStatus,
  UpdateLocationRequest,
} from "@/types/location";
import { formatDate } from "@/helpers/dateHelper";

interface EditZoneModalProps {
  open: boolean;
  onClose: () => void;
  zone: LocationPageResponse | null;
}

export default function EditZoneModal({ open, onClose, zone }: EditZoneModalProps) {
  const queryClient = useQueryClient();

  // Form states - ONLY 5 editable fields: userId, name, radiusMeters, status, isActive
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [radiusMeters, setRadiusMeters] = useState(5000);
  const [status, setStatus] = useState<LocationStatus>("ACTIVE");
  const [isActive, setIsActive] = useState(true);

  // Fetch users for manager dropdown
  const { data: userOptions = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["user-names"],
    queryFn: getUserNames,
    staleTime: 5 * 60 * 1000,
    enabled: open,
  });

  // Sync state with incoming zone data
  useEffect(() => {
    if (zone) {
      setName(zone.name || "");
      setUserId(zone.userId || "");
      setRadiusMeters(zone.radiusMeters || 5000);
      setStatus(zone.status || "ACTIVE");
      setIsActive(zone.isActive !== undefined ? zone.isActive : true);
    }
  }, [zone]);

  const mutation = useMutation({
    mutationFn: (data: UpdateLocationRequest) => {
      if (!zone) throw new Error("Không tìm thấy thông tin khu vực");
      return updateLocation(zone.id, data);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["locations-pages"] });
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      toast.success(`Cập nhật khu vực "${res.name}" thành công!`);
      onClose();
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Có lỗi xảy ra khi cập nhật khu vực";
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!zone) return;

    if (!name.trim()) {
      toast.error("Vui lòng nhập tên khu vực");
      return;
    }

    // Gửi đúng 5 trường cho phép chỉnh sửa: userId, name, radiusMeters, status, isActive
    const payload: UpdateLocationRequest = {
      name: name.trim(),
      userId: userId.trim() ? userId.trim() : null,
      radiusMeters: Number(radiusMeters) || 5000,
      status,
      isActive,
    };

    mutation.mutate(payload);
  };

  return (
    <Modal
      open={open && Boolean(zone)}
      title={zone ? `Chỉnh sửa khu vực: ${zone.name}` : "Chỉnh sửa khu vực"}
      size="xl"
      onClose={onClose}
    >
      {zone && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Read-only Meta Info */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Mã khu vực (UUID):</span>
              <span className="font-mono font-medium text-slate-700 select-all">
                {zone.id}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Ngày tạo:</span>
              <span className="text-slate-600">{formatDate(zone.createdAt)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Cập nhật lần cuối:</span>
              <span className="text-slate-600">{formatDate(zone.modifiedAt)}</span>
            </div>

            <div className="flex items-center gap-1.5 pt-1 text-[11px] text-amber-600">
              <FaInfoCircle size={12} className="shrink-0" />
              <span>
                Theo quy định điều phối, ranh giới bản đồ GIS không cho phép thay đổi tại đây.
              </span>
            </div>
          </div>

          {/* Form Fields: Only userId, name, radiusMeters, status, isActive */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Tên khu vực điều phối <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên khu vực điều phối..."
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-text outline-none transition-colors focus:border-secondary focus:ring-1 focus:ring-secondary"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Người quản trị phụ trách
              </label>
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                disabled={isLoadingUsers}
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-text outline-none transition-colors focus:border-secondary focus:ring-1 focus:ring-secondary"
              >
                <option value="">-- Chưa gán quản trị viên --</option>
                {userOptions.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
                {userId && !userOptions.some((u) => u.id === userId) && (
                  <option value={userId}>
                    {zone.userName ? `${zone.userName} (Hiện tại)` : `UID: ${userId}`}
                  </option>
                )}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Bán kính ứng cứu (mét)
              </label>
              <input
                type="number"
                min={100}
                step={100}
                value={radiusMeters}
                onChange={(e) => setRadiusMeters(Number(e.target.value))}
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-text outline-none transition-colors focus:border-secondary focus:ring-1 focus:ring-secondary"
              />
              <span className="mt-0.5 block text-[11px] text-slate-400">
                Tương đương:{" "}
                {radiusMeters >= 1000
                  ? `${(radiusMeters / 1000).toLocaleString()} km`
                  : `${radiusMeters.toLocaleString()} m`}
              </span>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Trạng thái vận hành
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LocationStatus)}
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-text outline-none transition-colors focus:border-secondary focus:ring-1 focus:ring-secondary"
              >
                <option value="ACTIVE">Hoạt động bình thường</option>
                <option value="ISOLATE">Bị cô lập</option>
                <option value="OVERLOADED">Quá tải cứu hộ</option>
                <option value="DISABLED">Tạm ngưng vận hành</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Kích hoạt hệ thống
              </label>
              <select
                value={isActive ? "TRUE" : "FALSE"}
                onChange={(e) => setIsActive(e.target.value === "TRUE")}
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-text outline-none transition-colors focus:border-secondary focus:ring-1 focus:ring-secondary"
              >
                <option value="TRUE">Đang bật (Active)</option>
                <option value="FALSE">Tạm tắt (Inactive)</option>
              </select>
            </div>
          </div>

          {/* GIS Boundary Map Preview */}
          <div className="border-t border-slate-100 pt-3">
            <GisBoundaryMap
              boundary={zone.boundary}
              readOnly={true}
              zoneName={zone.name}
              height={220}
              autoFit={true}
              title="Ranh giới GIS hiện tại"
              description="Ranh giới bản đồ của khu vực (không cho phép chỉnh sửa tại đây theo quy định điều phối)."
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
            <AdminButton
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={mutation.isPending}
            >
              Hủy
            </AdminButton>

            <AdminButton
              type="submit"
              variant="primary"
              size="sm"
              disabled={mutation.isPending}
              icon={mutation.isPending ? undefined : <FaCheckCircle size={13} />}
            >
              {mutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </AdminButton>
          </div>
        </form>
      )}
    </Modal>
  );
}
