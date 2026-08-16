import {
  emergencyLevelLabel,
  hazardTypeLabel,
  pointTypeLabel,
  rescueStatusLabel,
  safePointTypeLabel,
} from "@/contants/mapPointLables";
import type { EmergencyLevel, MapPointDetailRes } from "@/types/mapPoint";
import { formatDateTime } from "@/utils/date";
import type { ReactNode } from "react";

interface PointDetailProps {
  point: MapPointDetailRes | null;
  loading?: boolean;
  error?: Error | null;
  className?: string;
}

const emergencyLevelBadgeClassName: Record<EmergencyLevel, string> = {
  LOW: "bg-success/10 text-success ring-success/20",
  MEDIUM: "bg-warning/10 text-amber-700 ring-warning/20",
  HIGH: "bg-danger/10 text-danger ring-danger/20",
};

const getGoogleMapsDirectionsUrl = (latitude: number, longitude: number) =>
  `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

export default function PointDetail({
  point,
  loading = false,
  error = null,
  className = "",
}: PointDetailProps) {
  const renderDetail = () => {
    if (loading) {
      return (
        <p className="text-sm text-slate-500">Đang tải thông tin điểm...</p>
      );
    }

    if (error) {
      return (
        <p className="text-sm font-medium text-red-600">
          Không tải được thông tin điểm.
        </p>
      );
    }

    if (!point) {
      return <p className="text-sm text-slate-500">Đang chờ dữ liệu...</p>;
    }

    switch (point.pointType) {
      case "SOS":
        return (
          <div>
            <DetailRow
              label="Số điện thoại"
              value={point.detail.reporterPhone}
            />
            <DetailRow label="Nội dung" value={point.detail.content} />
            <DetailRow
              label="Mức khẩn cấp"
              value={
                <EmergencyLevelBadge level={point.detail.emergencyLevel} />
              }
            />
            <DetailRow
              label="Trạng thái"
              value={rescueStatusLabel[point.detail.status]}
            />
            <AddressRow point={point} />
            <DetailRow
              label="Ngày đăng"
              value={formatDateTime(point.createdAt)}
            />
            <DetailRow label="Nguồn" value={point.detail.source} />
          </div>
        );

      case "HAZARD":
        return (
          <div>
            <DetailRow
              label="Loại nguy hiểm"
              value={hazardTypeLabel[point.detail.hazardType]}
            />
            <DetailRow label="Mô tả" value={point.detail.description} />
            <AddressRow point={point} />
            <DetailRow
              label="Ngày đăng"
              value={formatDateTime(point.createdAt)}
            />

            {point.detail.imageUrls && point.detail.imageUrls.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500">Hình ảnh</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {point.detail.imageUrls.map((imageUrl) => (
                    <img
                      key={imageUrl}
                      src={imageUrl}
                      alt="Minh họa điểm nguy hiểm"
                      className="aspect-square w-full rounded border border-slate-200 object-cover"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case "SAFE_ZONE":
        return (
          <div>
            <DetailRow label="Tên điểm" value={point.detail.name} />
            <DetailRow label="Liên hệ" value={point.detail.contactPhone} />
            <DetailRow
              label="Loại"
              value={safePointTypeLabel[point.detail.safePointType]}
            />
            <AddressRow point={point} />
          </div>
        );

      case "WARE_HOUSE":
        return (
          <div>
            <DetailRow label="Tên kho" value={point.detail.name} />
            <DetailRow label="Quản lý" value={point.detail.managerPhone} />
            <AddressRow point={point} />
          </div>
        );
    }
  };

  return (
    <div className={`text-slate-900 ${className}`}>
      <header className="border-b border-slate-200 pb-1">
        <h1 className="text-base font-bold">
          {point ? pointTypeLabel[point.pointType] : "Chi tiết điểm"}
        </h1>
      </header>

      <section className="pt-1">{renderDetail()}</section>
    </div>
  );
}

function AddressRow({ point }: { point: MapPointDetailRes }) {
  return (
    <DetailRow
      label="Địa chỉ"
      value={
        <AddressValue
          address={point.address}
          latitude={point.latitude}
          longitude={point.longitude}
        />
      }
    />
  );
}

function EmergencyLevelBadge({ level }: { level: EmergencyLevel }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${emergencyLevelBadgeClassName[level]}`}
    >
      {emergencyLevelLabel[level]}
    </span>
  );
}

function GoogleMapsDirectionsLink({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  return (
    <a
      href={getGoogleMapsDirectionsUrl(latitude, longitude)}
      target="_blank"
      rel="noreferrer"
      className="font-semibold text-secondary underline-offset-2 hover:underline"
    >
      Chỉ đường
    </a>
  );
}

function AddressValue({
  address,
  latitude,
  longitude,
}: {
  address: string | null | undefined;
  latitude: number;
  longitude: number;
}) {
  return (
    <span>
      {address ?? "Chưa có dữ liệu"}{" "}
      <GoogleMapsDirectionsLink latitude={latitude} longitude={longitude} />
    </span>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode | null | undefined;
}) {
  return (
    <div className="grid grid-cols-10 items-start">
      <p className="col-span-3 text-xs font-semibold text-slate-500">{label}</p>
      <p className="col-span-7 text-xs font-medium text-slate-900">
        {value ?? "Chưa có dữ liệu"}
      </p>
    </div>
  );
}
