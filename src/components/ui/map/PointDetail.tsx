import type { MapPointDetailRes } from "@/types/dispatch";

interface PointDetailProps {
  point: MapPointDetailRes | null;
  loading?: boolean;
  error?: Error | null;
  className?: string;
}

const pointTypeLabel: Record<MapPointDetailRes["pointType"], string> = {
  SOS: "SOS",
  HAZARD: "Điểm nguy hiểm",
  SAFE_ZONE: "Điểm an toàn",
  WARE_HOUSE: "Kho cứu trợ",
};

const formatActive = (value: boolean) =>
  value ? "Đang hoạt động" : "Ngừng hoạt động";

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
          <div className="space-y-2">
            <DetailRow label="Số điện thoại" value={point.detail.reporterPhone} />
            <DetailRow label="Nội dung" value={point.detail.content} />
            <DetailRow label="Mức khẩn cấp" value={point.detail.emergencyLevel} />
            <DetailRow label="Trạng thái" value={point.detail.status} />
            <DetailRow label="Nguồn" value={point.detail.source} />
          </div>
        );

      case "HAZARD":
        return (
          <div className="space-y-2">
            <DetailRow label="Loại nguy hiểm" value={point.detail.hazardType} />
            <DetailRow label="Mô tả" value={point.detail.description} />
            <DetailRow label="Trạng thái" value={point.detail.status} />

            {point.detail.imageUrls && point.detail.imageUrls.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase text-slate-500">
                  Hình ảnh
                </p>
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
          <div className="space-y-2">
            <DetailRow label="Tên điểm" value={point.detail.name} />
            <DetailRow label="Sức chứa tối đa" value={point.detail.maxCapacity} />
            <DetailRow label="Số người hiện tại" value={point.detail.currentPeople} />
            <DetailRow label="Liên hệ" value={point.detail.contactPhone} />
            <DetailRow label="Trạng thái" value={formatActive(point.detail.isActive)} />
          </div>
        );

      case "WARE_HOUSE":
        return (
          <div className="space-y-2">
            <DetailRow label="Tên kho" value={point.detail.name} />
            <DetailRow label="Quản lý" value={point.detail.managerPhone} />
            <DetailRow label="Trạng thái" value={formatActive(point.detail.isActive)} />
          </div>
        );
    }
  };

  return (
    <div className={`point-detail w-full text-slate-900 ${className}`}>
      <header className="border-b border-slate-200 pb-2">
        <h1 className="text-base font-bold">
          {point ? pointTypeLabel[point.pointType] : "Chi tiết điểm"}
        </h1>
      </header>

      <section className="pt-3">{renderDetail()}</section>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] font-semibold uppercase text-slate-500">
        {label}
      </p>
      <p className="text-xs font-medium leading-relaxed text-slate-900">
        {value ?? "Chưa có dữ liệu"}
      </p>
    </div>
  );
}
