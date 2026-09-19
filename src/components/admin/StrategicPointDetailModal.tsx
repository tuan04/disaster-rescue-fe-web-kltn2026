import {
  FaCampground,
  FaEdit,
  FaExclamationTriangle,
  FaExternalLinkAlt,
  FaHospital,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaShieldAlt,
  FaTint,
  FaWarehouse,
} from "react-icons/fa";

import { AdminButton, StatusTag } from "@/components/ui/admin/AdminUi";
import Modal from "@/components/ui/common/Modal";
import GisBoundaryMap from "@/components/admin/GisMap";
import {
  pointTypeLabel,
  safePointTypeLabel,
} from "@/contants/mapPointLables";
import type {
  MapPointDetailRes,
  PointType,
} from "@/types/mapPoint";

export interface StrategicPointRow {
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

export const getPointTypeIcon = (pointType: PointType, subType?: string) => {
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

interface StrategicPointDetailModalProps {
  open: boolean;
  onClose: () => void;
  point: StrategicPointRow | null;
  onEdit?: (point: MapPointDetailRes) => void;
}

export default function StrategicPointDetailModal({
  open,
  onClose,
  point,
  onEdit,
}: StrategicPointDetailModalProps) {
  const handleEdit = () => {
    if (!point) return;
    const pointToEdit = point.raw;
    onClose();
    onEdit?.(pointToEdit);
  };

  return (
    <Modal
      open={open && Boolean(point)}
      title="Chi tiết điểm chiến lược"
      size="lg"
      onClose={onClose}
    >
      {point && (
        <div className="flex flex-col gap-4">
          {/* Header info */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
              {getPointTypeIcon(
                point.pointType,
                point.raw.pointType === "SAFE_ZONE"
                  ? point.raw.detail.safePointType
                  : undefined
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {point.name}
              </h3>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">
                  {pointTypeLabel[point.pointType]}
                </span>
                {point.subTypeLabel && (
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
                    {point.subTypeLabel}
                  </span>
                )}
                <StatusTag tone={point.statusTone}>
                  {point.status}
                </StatusTag>
              </div>
            </div>
          </div>

          {/* Interactive Map Preview */}
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <GisBoundaryMap
              markers={[
                {
                  id: point.id,
                  latitude: point.raw.latitude,
                  longitude: point.raw.longitude,
                  title: point.name,
                  subtitle: point.subTypeLabel || pointTypeLabel[point.pointType],
                  pointType: point.pointType,
                  subType: point.raw.pointType === "SAFE_ZONE" ? point.raw.detail.safePointType : undefined,
                  address: point.address,
                  phone: point.phone,
                  status: point.status,
                },
              ]}
              readOnly={true}
              autoFit={true}
              height={200}
              hideHeader={true}
            />
          </div>

          {/* Address & GPS */}
          <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
            <span className="text-xs font-semibold text-slate-400 uppercase">
              Địa chỉ & Tọa độ
            </span>
            <p className="mt-1 text-sm font-medium text-slate-800">
              {point.address}
            </p>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono">
                {point.raw.latitude.toFixed(5)}, {point.raw.longitude.toFixed(5)}
              </span>
              <a
                href={`https://www.google.com/maps?q=${point.raw.latitude},${point.raw.longitude}`}
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
              {point.phone !== "-" ? (
                <a
                  href={`tel:${point.phone}`}
                  className="inline-flex items-center gap-1.5 font-mono text-sm font-bold text-cyan-700 hover:underline"
                >
                  <FaPhoneAlt size={11} />
                  <span>{point.phone}</span>
                </a>
              ) : (
                <span className="text-xs text-slate-400">Không có</span>
              )}
            </div>
          </div>

          {/* Specific detail for each point type */}
          {point.raw.pointType === "SAFE_ZONE" && (
            <div className="rounded-lg border border-slate-200 p-3">
              <span className="text-xs font-semibold text-slate-400 uppercase">
                Thông tin điểm an toàn
              </span>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">Phân loại:</span>{" "}
                  <span className="font-semibold text-slate-800">
                    {safePointTypeLabel[point.raw.detail.safePointType]}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Trạng thái:</span>{" "}
                  <span className="font-semibold text-slate-800">
                    {point.raw.detail.isActive ? "Hoạt động" : "Tạm dừng"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {point.raw.pointType === "WARE_HOUSE" && (
            <div className="rounded-lg border border-slate-200 p-3">
              <span className="text-xs font-semibold text-slate-400 uppercase">
                Thông tin kho cứu trợ
              </span>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">Tên kho:</span>{" "}
                  <span className="font-semibold text-slate-800">
                    {point.raw.detail.name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Quản lý kho:</span>{" "}
                  <span className="font-mono font-semibold text-slate-800">
                    {point.raw.detail.managerPhone || "Đang cập nhật"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {point.raw.pointType === "HAZARD" && (
            <div className="space-y-3">
              <div className="rounded-lg border border-slate-200 p-3">
                <span className="text-xs font-semibold text-slate-400 uppercase">
                  Mô tả tình hình hiểm họa
                </span>
                <p className="mt-1 text-sm text-slate-700">
                  {point.raw.detail.description || "Chưa có mô tả chi tiết."}
                </p>
              </div>

              {point.raw.detail.imageUrls &&
                point.raw.detail.imageUrls.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase">
                      Hình ảnh hiện trường
                    </span>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {point.raw.detail.imageUrls.map((url, i) => (
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
            <span>Thời gian tạo: {point.raw.createdAt || "N/A"}</span>
            <div className="flex items-center gap-2">
              {point.raw.pointType !== "SOS" && (
                <AdminButton
                  variant="primary"
                  size="sm"
                  icon={<FaEdit size={12} />}
                  onClick={handleEdit}
                >
                  Chỉnh sửa
                </AdminButton>
              )}
              <AdminButton
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                Đóng
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
