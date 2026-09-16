import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaTimesCircle,
  FaTrash,
  FaUpload,
  FaWarehouse,
} from "react-icons/fa";

import { AdminButton } from "@/components/ui/admin/AdminUi";
import Modal from "@/components/ui/common/Modal";
import {
  hazardTypeLabel,
  safePointTypeLabel,
} from "@/contants/mapPointLables";
import {
  updateHazardReport,
  updateSafePoint,
  updateWarehouse,
} from "@/services/dispatch";
import type {
  HazardStatus,
  HazardType,
  MapPointDetailRes,
  SafePointType,
} from "@/types/mapPoint";

interface EditStrategicPointModalProps {
  open: boolean;
  onClose: () => void;
  point: MapPointDetailRes | null;
}

const safePointOptions: { type: SafePointType; label: string }[] = [
  { type: "EVACUATION_CENTER", label: safePointTypeLabel.EVACUATION_CENTER },
  { type: "MEDICAL_STATION", label: safePointTypeLabel.MEDICAL_STATION },
  { type: "TEMPORARY_CAMP", label: safePointTypeLabel.TEMPORARY_CAMP },
  { type: "WATER_STATION", label: safePointTypeLabel.WATER_STATION },
];

const hazardTypeOptions: { type: HazardType; label: string }[] = [
  { type: "FALLEN_TREE", label: hazardTypeLabel.FALLEN_TREE },
  { type: "LANDSLIDE", label: hazardTypeLabel.LANDSLIDE },
  { type: "FLOOD_DEEP", label: hazardTypeLabel.FLOOD_DEEP },
  { type: "POWER_LINE_DOWN", label: hazardTypeLabel.POWER_LINE_DOWN },
];

const hazardStatusOptions: { status: HazardStatus; label: string }[] = [
  { status: "ACTIVE", label: "Đang nguy hiểm" },
  { status: "RESOLVED", label: "Đã xử lý xong" },
  { status: "REJECTED", label: "Báo cáo giả mạo / Hủy" },
];

const phoneRegex = /^0[3|5|7|8|9][0-9]{8}$/;

export default function EditStrategicPointModal({
  open,
  onClose,
  point,
}: EditStrategicPointModalProps) {
  const queryClient = useQueryClient();

  // Common error state
  const [formError, setFormError] = useState<string | null>(null);

  // Warehouse fields
  const [warehouseName, setWarehouseName] = useState("");
  const [managerPhone, setManagerPhone] = useState("");
  const [warehouseActive, setWarehouseActive] = useState(true);

  // Safe Point fields
  const [safePointName, setSafePointName] = useState("");
  const [safePointType, setSafePointType] = useState<SafePointType>("EVACUATION_CENTER");
  const [contactPhone, setContactPhone] = useState("");
  const [safePointActive, setSafePointActive] = useState(true);

  // Hazard fields
  const [hazardType, setHazardType] = useState<HazardType>("FALLEN_TREE");
  const [hazardStatus, setHazardStatus] = useState<HazardStatus>("ACTIVE");
  const [description, setDescription] = useState("");
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

  // Sync state whenever point changes
  useEffect(() => {
    if (!point || !open) return;
    setFormError(null);
    setNewImages([]);

    if (point.pointType === "WARE_HOUSE") {
      setWarehouseName(point.detail.name || "");
      setManagerPhone(point.detail.managerPhone || "");
      setWarehouseActive(point.detail.isActive ?? true);
    } else if (point.pointType === "SAFE_ZONE") {
      setSafePointName(point.detail.name || "");
      setSafePointType(point.detail.safePointType || "EVACUATION_CENTER");
      setContactPhone(point.detail.contactPhone || "");
      setSafePointActive(point.detail.isActive ?? true);
    } else if (point.pointType === "HAZARD") {
      setHazardType(point.detail.hazardType || "FALLEN_TREE");
      setHazardStatus(point.detail.status || "ACTIVE");
      setDescription(point.detail.description || "");
      setExistingImages(point.detail.imageUrls || []);
    }
  }, [point, open]);

  // Mutations
  const warehouseMutation = useMutation({
    mutationFn: () => {
      if (!point) throw new Error("Không tìm thấy điểm");
      return updateWarehouse(point.id, {
        name: warehouseName.trim(),
        managerPhone: managerPhone.trim() || undefined,
        isActive: warehouseActive,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["strategic-points"] });
      toast.success("Cập nhật kho cứu trợ thành công!");
      onClose();
    },
    onError: (err: any) => {
      setFormError(err?.response?.data?.message || err.message || "Cập nhật kho thất bại");
    },
  });

  const safePointMutation = useMutation({
    mutationFn: () => {
      if (!point) throw new Error("Không tìm thấy điểm");
      return updateSafePoint(point.id, {
        name: safePointName.trim(),
        safePointType,
        contactPhone: contactPhone.trim() || undefined,
        isActive: safePointActive,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["strategic-points"] });
      toast.success("Cập nhật điểm an toàn thành công!");
      onClose();
    },
    onError: (err: any) => {
      setFormError(err?.response?.data?.message || err.message || "Cập nhật điểm an toàn thất bại");
    },
  });

  const hazardMutation = useMutation({
    mutationFn: () => {
      if (!point) throw new Error("Không tìm thấy điểm");
      return updateHazardReport(
        point.id,
        {
          hazardType,
          status: hazardStatus,
          description: description.trim() || undefined,
          imageUrls: existingImages,
        },
        newImages.length > 0 ? newImages : undefined,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["strategic-points"] });
      toast.success("Cập nhật báo cáo hiểm họa thành công!");
      onClose();
    },
    onError: (err: any) => {
      setFormError(err?.response?.data?.message || err.message || "Cập nhật hiểm họa thất bại");
    },
  });

  const isSubmitting =
    warehouseMutation.isPending || safePointMutation.isPending || hazardMutation.isPending;

  if (!point || point.pointType === "SOS") {
    return null;
  }

  const handleRemoveExistingImage = (indexToRemove: number) => {
    setExistingImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleRemoveNewImage = (indexToRemove: number) => {
    setNewImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (point.pointType === "WARE_HOUSE") {
      if (!warehouseName.trim()) {
        setFormError("Vui lòng nhập tên kho cứu trợ");
        return;
      }
      if (managerPhone.trim() && !phoneRegex.test(managerPhone.trim())) {
        setFormError("Số điện thoại quản lý không hợp lệ (10 số, bắt đầu 03, 05, 07, 08, 09)");
        return;
      }
      warehouseMutation.mutate();
    } else if (point.pointType === "SAFE_ZONE") {
      if (!safePointName.trim()) {
        setFormError("Vui lòng nhập tên điểm an toàn");
        return;
      }
      if (contactPhone.trim() && !phoneRegex.test(contactPhone.trim())) {
        setFormError("Số điện thoại liên hệ không hợp lệ (10 số, bắt đầu 03, 05, 07, 08, 09)");
        return;
      }
      safePointMutation.mutate();
    } else if (point.pointType === "HAZARD") {
      hazardMutation.mutate();
    }
  };

  // Modal Title & Icon
  const getModalTitle = () => {
    switch (point.pointType) {
      case "WARE_HOUSE":
        return (
          <div className="flex items-center gap-2 text-slate-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700">
              <FaWarehouse size={15} />
            </span>
            <span>Chỉnh sửa Kho cứu trợ</span>
          </div>
        );
      case "SAFE_ZONE":
        return (
          <div className="flex items-center gap-2 text-slate-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <FaShieldAlt size={15} />
            </span>
            <span>Chỉnh sửa Điểm an toàn</span>
          </div>
        );
      case "HAZARD":
        return (
          <div className="flex items-center gap-2 text-slate-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
              <FaExclamationTriangle size={15} />
            </span>
            <span>Chỉnh sửa Điểm hiểm họa</span>
          </div>
        );
      default:
        return <span>Chỉnh sửa Điểm chiến lược</span>;
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <div className="space-y-4">
        {/* Title Header */}
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">{getModalTitle()}</h3>
          <p className="mt-1 text-xs text-slate-500">
            Cập nhật các thông số quản trị và tình trạng thực tế của điểm chiến lược.
          </p>
        </div>

        {/* Read-only Location Info Bar */}
        <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-xs text-slate-600">
          <div className="flex items-start gap-2">
            <FaMapMarkerAlt className="mt-0.5 shrink-0 text-cyan-600" size={13} />
            <div className="flex-1">
              <div className="font-medium text-slate-800">{point.address || "Chưa cập nhật địa chỉ"}</div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-slate-500">
                <span className="font-mono">
                  Tọa độ: {point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}
                </span>
                {point.createdAt && (
                  <span>Tạo lúc: {new Date(point.createdAt).toLocaleString("vi-VN")}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ================= WAREHOUSE FORM ================= */}
          {point.pointType === "WARE_HOUSE" && (
            <>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Tên kho cứu trợ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={warehouseName}
                  onChange={(e) => setWarehouseName(e.target.value)}
                  placeholder="Ví dụ: Kho hàng cứu trợ Miền Trung"
                  className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-800 outline-none transition focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Số điện thoại quản lý
                </label>
                <input
                  type="tel"
                  value={managerPhone}
                  onChange={(e) => setManagerPhone(e.target.value)}
                  placeholder="Ví dụ: 0912345678"
                  className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-800 outline-none transition focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600"
                />
                <span className="mt-0.5 block text-[11px] text-slate-400">
                  10 số, bắt đầu bằng 03, 05, 07, 08, 09
                </span>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Trạng thái hoạt động
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWarehouseActive(true)}
                    className={`flex items-center justify-center gap-2 rounded-lg border py-2 text-xs font-semibold transition ${
                      warehouseActive
                        ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <FaCheckCircle className={warehouseActive ? "text-emerald-600" : "text-slate-400"} />
                    Đang hoạt động
                  </button>
                  <button
                    type="button"
                    onClick={() => setWarehouseActive(false)}
                    className={`flex items-center justify-center gap-2 rounded-lg border py-2 text-xs font-semibold transition ${
                      !warehouseActive
                        ? "border-rose-500 bg-rose-50 text-rose-800 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <FaTimesCircle className={!warehouseActive ? "text-rose-600" : "text-slate-400"} />
                    Tạm dừng hoạt động
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ================= SAFE ZONE FORM ================= */}
          {point.pointType === "SAFE_ZONE" && (
            <>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Tên điểm an toàn <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={safePointName}
                  onChange={(e) => setSafePointName(e.target.value)}
                  placeholder="Ví dụ: Trường THCS Lý Thường Kiệt"
                  className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-800 outline-none transition focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Loại điểm an toàn
                </label>
                <select
                  value={safePointType}
                  onChange={(e) => setSafePointType(e.target.value as SafePointType)}
                  className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600"
                >
                  {safePointOptions.map((opt) => (
                    <option key={opt.type} value={opt.type}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Số điện thoại liên hệ
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="Ví dụ: 0987654321"
                  className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-800 outline-none transition focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600"
                />
                <span className="mt-0.5 block text-[11px] text-slate-400">
                  10 số, bắt đầu bằng 03, 05, 07, 08, 09
                </span>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Trạng thái tiếp nhận
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSafePointActive(true)}
                    className={`flex items-center justify-center gap-2 rounded-lg border py-2 text-xs font-semibold transition ${
                      safePointActive
                        ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <FaCheckCircle className={safePointActive ? "text-emerald-600" : "text-slate-400"} />
                    Đang mở cửa tiếp nhận
                  </button>
                  <button
                    type="button"
                    onClick={() => setSafePointActive(false)}
                    className={`flex items-center justify-center gap-2 rounded-lg border py-2 text-xs font-semibold transition ${
                      !safePointActive
                        ? "border-rose-500 bg-rose-50 text-rose-800 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <FaTimesCircle className={!safePointActive ? "text-rose-600" : "text-slate-400"} />
                    Đã đóng / Hết chỗ
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ================= HAZARD FORM ================= */}
          {point.pointType === "HAZARD" && (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Loại hiểm họa
                  </label>
                  <select
                    value={hazardType}
                    onChange={(e) => setHazardType(e.target.value as HazardType)}
                    className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600"
                  >
                    {hazardTypeOptions.map((opt) => (
                      <option key={opt.type} value={opt.type}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Trạng thái hiểm họa
                  </label>
                  <select
                    value={hazardStatus}
                    onChange={(e) => setHazardStatus(e.target.value as HazardStatus)}
                    className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600"
                  >
                    {hazardStatusOptions.map((opt) => (
                      <option key={opt.status} value={opt.status}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Mô tả chi tiết
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả mức độ nghiêm trọng, vật cản, phương tiện cần ứng phó..."
                  rows={3}
                  className="w-full rounded-md border border-slate-300 p-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600"
                />
              </div>

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Ảnh hiện trường hiện có ({existingImages.length})
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {existingImages.map((url, idx) => (
                      <div key={idx} className="group relative aspect-video overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                        <img src={url} alt="Hiện trường" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(idx)}
                          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-80 transition hover:bg-rose-600 hover:opacity-100"
                          title="Xóa ảnh này"
                        >
                          <FaTrash size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload New Images */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Tải lên thêm ảnh mới
                </label>
                <div className="flex items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                    <FaUpload size={12} className="text-slate-500" />
                    <span>Chọn tệp ảnh...</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setNewImages((prev) => [...prev, ...files]);
                        e.target.value = "";
                      }}
                      className="hidden"
                    />
                  </label>
                  {newImages.length > 0 && (
                    <span className="text-xs text-cyan-700">
                      Đã chọn thêm {newImages.length} ảnh mới
                    </span>
                  )}
                </div>

                {newImages.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {newImages.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-0.5 text-xs text-cyan-800"
                      >
                        <span className="max-w-[150px] truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveNewImage(idx)}
                          className="ml-0.5 text-cyan-600 hover:text-rose-600"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Form Error Banner */}
          {formError && (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
              {formError}
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <AdminButton variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </AdminButton>
            <AdminButton variant="primary" size="sm" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </AdminButton>
          </div>
        </form>
      </div>
    </Modal>
  );
}
