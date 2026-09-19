import { FaEdit } from "react-icons/fa";

import { AdminButton, StatusTag } from "@/components/ui/admin/AdminUi";
import Modal from "@/components/ui/common/Modal";
import GisBoundaryMap from "@/components/admin/GisMap";
import { formatDate } from "@/helpers/dateHelper";
import { locationStatusMeta, type LocationPageResponse } from "@/types/location";

interface ZoneDetailModalProps {
  open: boolean;
  onClose: () => void;
  zone: LocationPageResponse | null;
  onEdit?: (zone: LocationPageResponse) => void;
}

export default function ZoneDetailModal({
  open,
  onClose,
  zone,
  onEdit,
}: ZoneDetailModalProps) {

  return (
    <Modal
      open={open}
      title={zone ? `Chi tiết khu vực: ${zone.name}` : "Chi tiết khu vực"}
      size="2xl"
      onClose={onClose}
    >
      {zone && (
        <div className="space-y-5">
          {/* Quick Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <StatusTag tone={locationStatusMeta[zone.status]?.tone || "default"}>
              {locationStatusMeta[zone.status]?.label || zone.status}
            </StatusTag>
            <StatusTag tone={zone.isActive ? "success" : "default"}>
              {zone.isActive ? "Đang bật" : "Tạm tắt"}
            </StatusTag>
            {zone.radiusMeters && (
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 font-medium">
                Bán kính: {zone.radiusMeters.toLocaleString()} m
              </span>
            )}
          </div>

          {/* Information Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 rounded-lg bg-slate-50 p-4 border border-slate-200/60 text-sm">
            <div>
              <span className="text-xs text-slate-400 block">Mã khu vực (UUID)</span>
              <span className="font-mono text-xs text-slate-700 select-all">
                {zone.id}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-400 block">Tên khu vực</span>
              <span className="font-medium text-text">{zone.name}</span>
            </div>

            <div>
              <span className="text-xs text-slate-400 block">Người quản trị</span>
              <span className="font-medium text-text">
                {zone.userName || "Chưa có thông tin"}
              </span>
              {zone.userId && (
                <span className="block font-mono text-[11px] text-slate-400 select-all">
                  UID: {zone.userId}
                </span>
              )}
            </div>

            <div>
              <span className="text-xs text-slate-400 block">Số điện thoại</span>
              <span className="font-medium text-text">
                {zone.userPhone || "Chưa có thông tin"}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-400 block">Thời gian tạo</span>
              <span className="text-xs text-slate-600">{formatDate(zone.createdAt)}</span>
            </div>

            <div>
              <span className="text-xs text-slate-400 block">Lần cập nhật cuối</span>
              <span className="text-xs text-slate-600">{formatDate(zone.modifiedAt)}</span>
            </div>
          </div>

          {/* GIS Boundary Map */}
          <div>
            <GisBoundaryMap
              boundary={zone.boundary}
              readOnly={true}
              zoneName={zone.name}
              height={320}
              autoFit={true}
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            {onEdit && (
              <AdminButton
                variant="primary"
                size="sm"
                icon={<FaEdit size={12} />}
                onClick={() => {
                  onClose();
                  onEdit(zone);
                }}
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
      )}
    </Modal>
  );
}
