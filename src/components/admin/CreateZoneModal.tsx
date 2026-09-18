import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FaCheckCircle } from "react-icons/fa";

import { AdminButton } from "@/components/ui/admin/AdminUi";
import Modal from "@/components/ui/common/Modal";
import GisBoundaryMap from "@/components/admin/GisBoundaryMap";
import { createLocation } from "@/services/location";
import { getUserNames } from "@/services/user";
import type {
  CreateLocationRequest,
  GeoJsonPolygon,
  LocationStatus,
} from "@/types/location";

interface CreateZoneModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateZoneModal({ open, onClose }: CreateZoneModalProps) {
  const queryClient = useQueryClient();

  // Form states
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [radiusMeters, setRadiusMeters] = useState(5000);
  const [status, setStatus] = useState<LocationStatus>("ACTIVE");
  const [isActive, setIsActive] = useState(true);

  // Polygon points state: Leaflet [lat, lng][]
  const [polygonPoints, setPolygonPoints] = useState<[number, number][]>([]);

  // Fetch users for manager dropdown
  const { data: userOptions = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["user-names"],
    queryFn: getUserNames,
    staleTime: 5 * 60 * 1000,
    enabled: open,
  });

  const resetForm = () => {
    setName("");
    setUserId("");
    setRadiusMeters(5000);
    setStatus("ACTIVE");
    setIsActive(true);
    setPolygonPoints([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Convert polygonPoints to GeoJSON boundary (if >= 3 points)
  const boundaryGeoJson: GeoJsonPolygon | null = useMemo(() => {
    if (polygonPoints.length < 3) return null;

    // GeoJSON format: [lng, lat]
    const ring: [number, number][] = polygonPoints.map(([lat, lng]) => [lng, lat]);

    // Ensure ring is closed
    const first = ring[0];
    const last = ring[ring.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      ring.push([first[0], first[1]]);
    }

    return {
      type: "Polygon",
      coordinates: [ring],
    };
  }, [polygonPoints]);

  const mutation = useMutation({
    mutationFn: (data: CreateLocationRequest) => createLocation(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["locations-pages"] });
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      toast.success(`Tạo khu vực "${res.name}" thành công!`);
      handleClose();
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Có lỗi xảy ra khi tạo khu vực";
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Vui lòng nhập tên khu vực");
      return;
    }

    if (polygonPoints.length > 0 && polygonPoints.length < 3) {
      toast.error("Ranh giới đa giác cần tối thiểu 3 điểm tọa độ hoặc để trống");
      return;
    }

    const payload: CreateLocationRequest = {
      name: name.trim(),
      userId: userId.trim() ? userId.trim() : null,
      radiusMeters: Number(radiusMeters) || 5000,
      status,
      isActive,
      boundary: boundaryGeoJson,
    };

    mutation.mutate(payload);
  };

  return (
    <Modal
      open={open}
      title="Tạo mới khu vực điều phối"
      size="2xl"
      onClose={handleClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Information */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Tên khu vực điều phối <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Khu vực Quận 1, Khu vực TP Thủ Đức..."
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-text outline-none transition-colors focus:border-secondary focus:ring-1 focus:ring-secondary"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Người quản trị phụ trách
            </label>
            <div className="relative">
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
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Bán kính ứng cứu (mét)
            </label>
            <div className="relative">
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

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Kích hoạt hệ thống
            </label>
            <select
              value={isActive ? "TRUE" : "FALSE"}
              onChange={(e) => setIsActive(e.target.value === "TRUE")}
              className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-text outline-none transition-colors focus:border-secondary focus:ring-1 focus:ring-secondary"
            >
              <option value="TRUE">Đang bật</option>
              <option value="FALSE">Tạm tắt</option>
            </select>
          </div>
        </div>

        {/* GIS Boundary Map Section */}
        <div className="border-t border-slate-100 pt-3">
          <GisBoundaryMap
            points={polygonPoints}
            onChange={setPolygonPoints}
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
          <AdminButton
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
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
            {mutation.isPending ? "Đang tạo..." : "Tạo khu vực"}
          </AdminButton>
        </div>
      </form>
    </Modal>
  );
}
