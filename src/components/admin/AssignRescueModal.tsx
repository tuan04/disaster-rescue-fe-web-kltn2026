import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  FaAmbulance,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaTruck,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSyncAlt,
  FaSearchLocation,
} from "react-icons/fa";

import Modal from "@/components/ui/common/Modal";
import { AdminButton } from "@/components/ui/admin/AdminUi";
import { getNearbyCampaignTeams, assignTeamsToRescueRequest } from "@/services/assignment";
import { emergencyLevelLabel } from "@/contants/mapPointLables";
import type { RescueRequestRow } from "@/components/admin/RescueDetailModal";
import type { RescueAssignmentRequest } from "@/types/assignment";

interface AssignRescueModalProps {
  open: boolean;
  onClose: () => void;
  rescue: RescueRequestRow | null;
  onSuccess?: () => void;
}

const RADIUS_OPTIONS = [
  { label: "3 km", value: 3000 },
  { label: "5 km", value: 5000 },
  { label: "10 km", value: 10000 },
  { label: "20 km", value: 20000 },
  { label: "50 km", value: 50000 },
];

export default function AssignRescueModal({
  open,
  onClose,
  rescue,
  onSuccess,
}: AssignRescueModalProps) {
  const queryClient = useQueryClient();

  const [radiusInMeters, setRadiusInMeters] = useState<number>(10000);
  const [selectedTeamIds, setSelectedTeamIds] = useState<Set<string>>(new Set());
  const [generalNote, setGeneralNote] = useState<string>("");

  // Initialize or reset state when modal opens
  useEffect(() => {
    if (open && rescue) {
      setSelectedTeamIds(new Set());
      setGeneralNote(`Điều động cứu hộ khẩn cấp cho yêu cầu #${rescue.id.slice(0, 8)}`);
    }
  }, [open, rescue]);

  // Fetch nearby campaign teams
  const {
    data: nearbyTeams = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [
      "nearby-campaign-teams",
      rescue?.latitude,
      rescue?.longitude,
      radiusInMeters,
    ],
    queryFn: () => {
      if (!rescue) return [];
      return getNearbyCampaignTeams(rescue.latitude, rescue.longitude, radiusInMeters);
    },
    enabled: Boolean(open && rescue),
    staleTime: 30 * 1000,
  });

  // Assign mutation
  const assignMutation = useMutation({
    mutationFn: async () => {
      if (!rescue) throw new Error("Không tìm thấy thông tin yêu cầu cứu nạn");
      if (selectedTeamIds.size === 0) {
        throw new Error("Vui lòng chọn ít nhất một đội cứu hộ");
      }

      const noteToUse = generalNote.trim() || `Điều phối cứu hộ cho yêu cầu #${rescue.id.slice(0, 8)}`;

      // Map selected team IDs to RescueAssignmentRequest[]
      const requests: RescueAssignmentRequest[] = Array.from(selectedTeamIds).map((teamId) => {
        const team = nearbyTeams.find((t) => t.id === teamId);
        return {
          campaignTeamId: teamId,
          teamName: team?.teamName || "Đội cứu hộ",
          leaderPhone: team?.leaderPhone || "-",
          note: noteToUse,
        };
      });

      return assignTeamsToRescueRequest(rescue.id, requests);
    },
    onSuccess: (data) => {
      toast.success(`Đã điều động thành công ${data.length} đội cứu hộ!`);
      queryClient.invalidateQueries({ queryKey: ["pending-rescue-requests"] });
      queryClient.invalidateQueries({ queryKey: ["map-points"] });
      queryClient.invalidateQueries({ queryKey: ["rescue-assignments"] });
      onSuccess?.();
      onClose();
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = error.response?.data?.message || error.message || "Lỗi khi điều động đội cứu hộ";
      toast.error(msg);
    },
  });

  const handleToggleSelectAll = () => {
    if (selectedTeamIds.size === nearbyTeams.length) {
      setSelectedTeamIds(new Set());
    } else {
      setSelectedTeamIds(new Set(nearbyTeams.map((t) => t.id)));
    }
  };

  const handleToggleTeam = (teamId: string) => {
    setSelectedTeamIds((prev) => {
      const next = new Set(prev);
      if (next.has(teamId)) {
        next.delete(teamId);
      } else {
        next.add(teamId);
      }
      return next;
    });
  };

  if (!rescue) return null;

  const isHigh = rescue.emergencyLevel === "HIGH";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Điều phối đội cứu hộ khẩn cấp"
      size="2xl"
    >
      <div className="space-y-5">
        {/* Rescue Request Summary Card */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                #{rescue.id.slice(0, 8)}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold ${
                  isHigh
                    ? "bg-rose-100 text-rose-800 ring-1 ring-rose-300"
                    : rescue.emergencyLevel === "MEDIUM"
                      ? "bg-amber-100 text-amber-800 ring-1 ring-amber-300"
                      : "bg-blue-100 text-blue-800 ring-1 ring-blue-300"
                }`}
              >
                {isHigh && <FaExclamationTriangle size={10} className="text-rose-600" />}
                <span>{emergencyLevelLabel[rescue.emergencyLevel] || rescue.emergencyLevel}</span>
              </span>
            </div>
            {rescue.reporterPhone && rescue.reporterPhone !== "-" && (
              <a
                href={`tel:${rescue.reporterPhone}`}
                className="inline-flex items-center gap-1 font-semibold text-cyan-700 hover:underline"
              >
                <FaPhoneAlt size={10} />
                <span>{rescue.reporterPhone}</span>
              </a>
            )}
          </div>

          <div className="mt-2.5 flex items-start gap-1.5">
            <FaMapMarkerAlt className="mt-0.5 shrink-0 text-rose-500" size={12} />
            <div>
              <p className="font-medium text-slate-900">{rescue.address}</p>
              <p className="font-mono text-[11px] text-slate-400 mt-0.5">
                Tọa độ: {rescue.latitude.toFixed(5)}, {rescue.longitude.toFixed(5)}
              </p>
            </div>
          </div>

          <div className="mt-2 rounded bg-white p-2 border border-slate-200 text-slate-800">
            <span className="font-semibold text-slate-500 block mb-0.5">Nội dung cầu cứu:</span>
            <p className="line-clamp-2">{rescue.content || "Không có mô tả chi tiết."}</p>
          </div>
        </div>

        {/* Search Radius and Filter Controls */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <FaSearchLocation className="text-cyan-700" size={13} />
            <span>Bán kính tìm kiếm đội cứu hộ:</span>
          </div>
          <div className="flex items-center gap-1.5">
            {RADIUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRadiusInMeters(opt.value)}
                className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                  radiusInMeters === opt.value
                    ? "bg-cyan-700 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => refetch()}
              title="Làm mới danh sách đội"
              className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            >
              <FaSyncAlt size={11} className={isFetching ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Nearby Teams List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={
                    nearbyTeams.length > 0 && selectedTeamIds.size === nearbyTeams.length
                  }
                  onChange={handleToggleSelectAll}
                  disabled={nearbyTeams.length === 0}
                  className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
                <span>Đội cứu hộ sẵn sàng ở gần ({nearbyTeams.length})</span>
              </label>
            </div>
            <span className="text-cyan-700 font-medium">
              Đã chọn: {selectedTeamIds.size} đội
            </span>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <FaSyncAlt className="animate-spin text-cyan-600 mb-2" size={20} />
              <p className="text-xs">Đang tìm các đội cứu hộ trong bán kính {radiusInMeters / 1000}km...</p>
            </div>
          ) : nearbyTeams.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-xs text-slate-500">
              <FaAmbulance className="mx-auto text-slate-300 mb-2" size={28} />
              <p className="font-semibold text-slate-700">
                Không tìm thấy đội cứu hộ sẵn sàng nào trong phạm vi {radiusInMeters / 1000}km
              </p>
              <p className="mt-1 text-slate-400">
                Hãy thử mở rộng bán kính tìm kiếm (ví dụ: 20 km hoặc 50 km) để tìm thêm các đội khác.
              </p>
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {nearbyTeams.map((team) => {
                const isSelected = selectedTeamIds.has(team.id);
                return (
                  <div
                    key={team.id}
                    onClick={() => handleToggleTeam(team.id)}
                    className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-all ${
                      isSelected
                        ? "border-cyan-500 bg-cyan-50/40 ring-1 ring-cyan-500"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleTeam(team.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {team.teamName}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                          <FaCheckCircle size={9} />
                          <span>Sẵn sàng</span>
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                        <div className="flex items-center gap-1">
                          <FaPhoneAlt size={10} className="text-slate-400" />
                          <span className="font-mono">{team.leaderPhone || "Chưa có SĐT"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaUsers size={11} className="text-slate-400" />
                          <span>{team.totalParticipants || 0} thành viên</span>
                        </div>
                      </div>

                      {team.vehicles && team.vehicles.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap items-center gap-1">
                          <FaTruck size={10} className="text-slate-400 shrink-0" />
                          {team.vehicles.map((v, idx) => (
                            <span
                              key={idx}
                              className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                            >
                              {v}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Dispatch Note Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Ghi chú điều động / Lệnh tác chiến <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={2}
            value={generalNote}
            onChange={(e) => setGeneralNote(e.target.value)}
            placeholder="Nhập hướng dẫn, yêu cầu trang bị hoặc ghi chú cho các đội cứu hộ..."
            className="w-full rounded-md border border-slate-300 bg-white p-2.5 text-xs text-slate-800 outline-none transition-colors focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 placeholder:text-slate-400"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
          <AdminButton variant="outline" size="sm" onClick={onClose} disabled={assignMutation.isPending}>
            Hủy
          </AdminButton>
          <AdminButton
            variant="primary"
            size="sm"
            icon={<FaAmbulance size={12} />}
            disabled={selectedTeamIds.size === 0 || assignMutation.isPending || !generalNote.trim()}
            onClick={() => assignMutation.mutate()}
            className="bg-rose-600 hover:bg-rose-700 border-rose-600 text-white"
          >
            {assignMutation.isPending
              ? "Đang điều động..."
              : `Xác nhận điều động (${selectedTeamIds.size} đội)`}
          </AdminButton>
        </div>
      </div>
    </Modal>
  );
}
