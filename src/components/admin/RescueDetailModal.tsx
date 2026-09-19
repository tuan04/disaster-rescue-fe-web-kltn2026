import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import {
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaExternalLinkAlt,
  FaCopy,
  FaCheck,
  FaClock,
  FaExclamationCircle,
  FaMobileAlt,
  FaShareAlt,
  FaCommentDots,
  FaAmbulance,
  FaUsers,
} from "react-icons/fa";

import Modal from "@/components/ui/common/Modal";
import { AdminButton, StatusTag } from "@/components/ui/admin/AdminUi";
import GisBoundaryMap, { type GisMapMarker } from "@/components/admin/GisMap";
import { emergencyLevelLabel, requestSourceLabel } from "@/contants/mapPointLables";
import { formatDateTime } from "@/helpers/dateHelper";
import { getAssignmentsByRequestId } from "@/services/assignment";
import type { EmergencyLevel, MapPointDetailRes, RequestSource } from "@/types/mapPoint";

export interface RescueRequestRow {
  key: string;
  id: string;
  address: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  reporterPhone: string;
  content: string;
  emergencyLevel: EmergencyLevel;
  source: RequestSource;
  status: string;
  raw: MapPointDetailRes;
}

interface RescueDetailModalProps {
  open: boolean;
  onClose: () => void;
  rescue: RescueRequestRow | null;
  onAssign?: (rescue: RescueRequestRow) => void;
}

const assignmentStatusMeta: Record<
  string,
  { label: string; tone: "warning" | "info" | "success" | "danger" | "default" }
> = {
  ASSIGNED: { label: "Đã điều động", tone: "warning" },
  ACCEPTED: { label: "Đã tiếp nhận", tone: "info" },
  COMPLETED: { label: "Hoàn thành", tone: "success" },
  REJECTED: { label: "Từ chối", tone: "danger" },
  CANCELED: { label: "Đã hủy", tone: "default" },
};

export default function RescueDetailModal({
  open,
  onClose,
  rescue,
  onAssign,
}: RescueDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [showAllAssignments, setShowAllAssignments] = useState(false);

  useEffect(() => {
    if (!open) {
      setShowAllAssignments(false);
    }
  }, [open, rescue?.id]);

  // Fetch assignments for this rescue request
  const { data: assignments = [], isLoading: isLoadingAssignments } = useQuery({
    queryKey: ["rescue-assignments", rescue?.id],
    queryFn: () => (rescue?.id ? getAssignmentsByRequestId(rescue.id) : Promise.resolve([])),
    enabled: Boolean(open && rescue?.id),
    staleTime: 30 * 1000,
  });

  const displayedAssignments = showAllAssignments ? assignments : assignments.slice(0, 3);

  if (!rescue) return null;

  const handleCopyPhone = () => {
    if (!rescue.reporterPhone || rescue.reporterPhone === "-") return;
    navigator.clipboard.writeText(rescue.reporterPhone);
    setCopied(true);
    toast.success("Đã sao chép số điện thoại vào bộ nhớ tạm");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCoordinates = () => {
    const coordStr = `${rescue.latitude}, ${rescue.longitude}`;
    navigator.clipboard.writeText(coordStr);
    toast.success("Đã sao chép tọa độ GPS");
  };

  const mapMarkers: GisMapMarker[] = [
    {
      id: rescue.id,
      latitude: rescue.latitude,
      longitude: rescue.longitude,
      title: `Cứu hộ: ${rescue.reporterPhone}`,
      subtitle: emergencyLevelLabel[rescue.emergencyLevel] || rescue.emergencyLevel,
      pointType: "SOS",
      status: "Chờ cứu hộ",
      statusTone: "danger",
      address: rescue.address,
      phone: rescue.reporterPhone,
    },
  ];

  const emergencyTone: Record<EmergencyLevel, "danger" | "warning" | "info"> = {
    HIGH: "danger",
    MEDIUM: "warning",
    LOW: "info",
  };

  const renderSourceIcon = (source: RequestSource) => {
    if (source === "APP") return <FaMobileAlt className="text-cyan-600" size={13} />;
    if (source === "SOCIAL") return <FaShareAlt className="text-purple-600" size={13} />;
    return <FaCommentDots className="text-emerald-600" size={13} />;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Chi tiết yêu cầu cứu hộ khẩn cấp"
      size="2xl"
    >
      <div className="space-y-6">
        {/* Header Alert Card */}
        <div
          className={`flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between ${
            rescue.emergencyLevel === "HIGH"
              ? "border-rose-200 bg-rose-50 text-rose-900"
              : rescue.emergencyLevel === "MEDIUM"
                ? "border-amber-200 bg-amber-50 text-amber-900"
                : "border-cyan-200 bg-cyan-50 text-cyan-900"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow-sm ${
                rescue.emergencyLevel === "HIGH"
                  ? "bg-rose-600 animate-pulse"
                  : rescue.emergencyLevel === "MEDIUM"
                    ? "bg-amber-600"
                    : "bg-cyan-600"
              }`}
            >
              <FaExclamationCircle size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base">
                  Mức độ khẩn cấp: {emergencyLevelLabel[rescue.emergencyLevel] || rescue.emergencyLevel}
                </span>
                <StatusTag tone={emergencyTone[rescue.emergencyLevel]}>
                  {rescue.emergencyLevel}
                </StatusTag>
              </div>
              <span className="text-xs opacity-80">
                Mã yêu cầu: <code className="font-mono font-semibold">{rescue.id}</code>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <StatusTag tone="danger">Chờ tiếp nhận</StatusTag>
          </div>
        </div>

        {/* Thông tin người gửi & thời gian */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Phone card */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Người gọi / Báo tin
            </span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 text-cyan-700">
                  <FaPhoneAlt size={13} />
                </div>
                <div>
                  <a
                    href={`tel:${rescue.reporterPhone}`}
                    className="font-mono text-base font-bold text-slate-900 hover:text-cyan-700 hover:underline"
                  >
                    {rescue.reporterPhone || "Không có SĐT"}
                  </a>
                </div>
              </div>

              {rescue.reporterPhone && rescue.reporterPhone !== "-" && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    title="Sao chép SĐT"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    {copied ? <FaCheck size={12} className="text-emerald-600" /> : <FaCopy size={12} />}
                  </button>
                  <a
                    href={`tel:${rescue.reporterPhone}`}
                    className="inline-flex h-8 px-2.5 items-center justify-center gap-1.5 rounded-md bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    <FaPhoneAlt size={10} />
                    <span>Gọi</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Time & Source card */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Thời gian & Kênh tiếp nhận
            </span>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <FaClock size={13} className="text-slate-400 shrink-0" />
                <span className="font-medium">{formatDateTime(rescue.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                {renderSourceIcon(rescue.source)}
                <span>Kênh: <strong>{requestSourceLabel[rescue.source] || rescue.source}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Nội dung yêu cầu cứu nạn */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Nội dung kêu cứu / Tình trạng thực địa
          </label>
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-800 shadow-inner min-h-20 whitespace-pre-wrap">
            {rescue.content || "Không có mô tả chi tiết."}
          </div>
        </div>

        {/* Danh sách phân công đội cứu hộ */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <FaUsers className="text-cyan-700" size={13} />
              <span>Đội cứu hộ phân công</span>
              {assignments.length > 0 && (
                <span className="text-[11px] font-normal text-slate-400">
                  ({assignments.length})
                </span>
              )}
            </label>

            {assignments.length > 3 && (
              <button
                type="button"
                onClick={() => setShowAllAssignments((prev) => !prev)}
                className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 hover:underline"
              >
                {showAllAssignments ? "Thu gọn" : `Xem tất cả (${assignments.length})`}
              </button>
            )}
          </div>

          {isLoadingAssignments ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4 text-center text-xs text-slate-400">
              Đang tải danh sách đội cứu hộ phân công...
            </div>
          ) : displayedAssignments.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-3 text-center text-xs text-slate-500 flex items-center justify-between">
              <span>Chưa có đội cứu hộ nào được phân công cho yêu cầu này.</span>
              {onAssign && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onAssign(rescue);
                  }}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
                >
                  Điều phối ngay
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
                {displayedAssignments.map((assign) => {
                  const meta = assignmentStatusMeta[assign.status] || {
                    label: assign.status,
                    tone: "default",
                  };
                  return (
                    <div
                      key={assign.id}
                      className="flex items-center justify-between px-3.5 py-2.5 transition-colors hover:bg-slate-50/70 gap-3 text-xs"
                    >
                      {/* Tên đội */}
                      <span className="font-semibold text-slate-900 truncate">
                        {assign.assignedTeamName}
                      </span>

                      {/* Trạng thái & Giờ tạo */}
                      <div className="flex items-center gap-3 shrink-0">
                        <StatusTag tone={meta.tone}>{meta.label}</StatusTag>
                        <div className="flex items-center gap-1 text-slate-500 font-mono text-[11px]">
                          <FaClock size={11} className="text-slate-400" />
                          <span>{formatDateTime(assign.assignedAt)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {!showAllAssignments && assignments.length > 3 && (
                <div className="border-t border-slate-100 bg-slate-50/60 p-2 text-center">
                  <button
                    type="button"
                    onClick={() => setShowAllAssignments(true)}
                    className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 hover:underline"
                  >
                    Xem tất cả ({assignments.length} phân công)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Địa chỉ & Tọa độ */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Vị trí & Tọa độ cứu nạn
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyCoordinates}
                className="text-xs font-medium text-slate-500 hover:text-cyan-700 flex items-center gap-1"
              >
                <FaCopy size={10} />
                <span>Sao chép tọa độ</span>
              </button>
              <a
                href={`https://www.google.com/maps?q=${rescue.latitude},${rescue.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-cyan-700 hover:underline inline-flex items-center gap-1"
              >
                <FaExternalLinkAlt size={10} />
                <span>Mở Google Maps</span>
              </a>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 flex items-start gap-2 text-sm text-slate-700">
            <FaMapMarkerAlt className="mt-0.5 text-rose-500 shrink-0" size={14} />
            <div>
              <p className="font-medium text-slate-900">{rescue.address || "Chưa có địa chỉ cụ thể"}</p>
              <p className="font-mono text-xs text-slate-500 mt-0.5">
                Vĩ độ: {rescue.latitude.toFixed(6)} | Kinh độ: {rescue.longitude.toFixed(6)}
              </p>
            </div>
          </div>

          {/* Bản đồ vị trí mini */}
          <div className="h-64 w-full rounded-lg overflow-hidden border border-slate-200 shadow-sm mt-2">
            <GisBoundaryMap
              markers={mapMarkers}
              initialCenter={[rescue.latitude, rescue.longitude]}
              flyToCenter={[rescue.latitude, rescue.longitude]}
              initialZoom={15}
              readOnly={true}
              height={256}
              autoFit={true}
              hideHeader={true}
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <AdminButton variant="outline" onClick={onClose}>
            Đóng
          </AdminButton>
          {onAssign && (
            <AdminButton
              variant="primary"
              icon={<FaAmbulance size={13} />}
              onClick={() => {
                onClose();
                onAssign(rescue);
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white border-rose-600 shadow-sm"
            >
              Điều phối cứu hộ
            </AdminButton>
          )}
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${rescue.latitude},${rescue.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md font-medium text-sm h-10 px-4 bg-cyan-700 text-white hover:bg-cyan-800 transition-colors shadow-sm"
          >
            <FaExternalLinkAlt size={12} />
            <span>Chỉ đường tới vị trí</span>
          </a>
        </div>
      </div>
    </Modal>
  );
}
