import { FaArrowUp, FaExclamationTriangle, FaShieldAlt } from "react-icons/fa";
import {
  AdminButton,
  AdminCard,
  DataTable,
  type DataTableColumn,
  StatCard,
  StatusTag,
} from "@/components/ui/admin/AdminUi";

interface RescueRecord {
  key: string;
  id: string;
  sender: string;
  phone: string;
  location: string;
  severity: "danger" | "warning" | "normal";
  status: "pending" | "processing" | "completed";
  time: string;
}

const mockData: RescueRecord[] = [
  {
    key: "1",
    id: "SOS-0045",
    sender: "Nguyễn Văn A",
    phone: "0905123456",
    location: "Quận Liên Chiểu, Đà Nẵng",
    severity: "danger",
    status: "pending",
    time: "14:25 - 04/07/2026",
  },
  {
    key: "2",
    id: "SOS-0044",
    sender: "Trần Thị B",
    phone: "0914987654",
    location: "Huyện Hòa Vang, Đà Nẵng",
    severity: "warning",
    status: "processing",
    time: "13:10 - 04/07/2026",
  },
  {
    key: "3",
    id: "SOS-0043",
    sender: "Phạm Minh C",
    phone: "0935555666",
    location: "Quận Cẩm Lệ, Đà Nẵng",
    severity: "normal",
    status: "completed",
    time: "10:05 - 04/07/2026",
  },
];

const severityMeta = {
  danger: { tone: "danger" as const, label: "Nguy cấp" },
  warning: { tone: "warning" as const, label: "Cần chú ý" },
  normal: { tone: "info" as const, label: "Thường" },
};

const statusMeta = {
  pending: { tone: "default" as const, label: "Chờ xử lý" },
  processing: { tone: "info" as const, label: "Đang cứu nạn" },
  completed: { tone: "success" as const, label: "Hoàn thành" },
};

export default function Dashboard() {
  const columns: DataTableColumn<RescueRecord>[] = [
    {
      key: "id",
      title: "Mã số",
      render: (record) => <span className="font-bold text-text">{record.id}</span>,
    },
    {
      key: "sender",
      title: "Người gửi",
      render: (record) => record.sender,
    },
    {
      key: "phone",
      title: "Số điện thoại",
      render: (record) => record.phone,
    },
    {
      key: "location",
      title: "Khu vực",
      render: (record) => record.location,
    },
    {
      key: "severity",
      title: "Mức độ",
      render: (record) => {
        const severity = severityMeta[record.severity];
        return <StatusTag tone={severity.tone}>{severity.label}</StatusTag>;
      },
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (record) => {
        const status = statusMeta[record.status];
        return <StatusTag tone={status.tone}>{status.label}</StatusTag>;
      },
    },
    {
      key: "time",
      title: "Thời gian",
      render: (record) => record.time,
    },
    {
      key: "action",
      title: "Thao tác",
      render: (record) => (
        <div className="flex items-center gap-3">
          <AdminButton variant="link" size="sm">
            Chi tiết
          </AdminButton>
          {record.status !== "completed" ? (
            <AdminButton variant="outline" size="sm">
              Cập nhật
            </AdminButton>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="mb-2 text-title font-bold text-text">Bảng quản trị hệ thống</h2>
        <p className="text-sm text-slate-500">
          Cập nhật tình hình cứu hộ khẩn cấp trực tuyến trong khu vực.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Yêu cầu đang chờ"
          value={12}
          tone="danger"
          icon={<FaExclamationTriangle />}
          suffix={
            <span className="inline-flex items-center gap-1">
              <FaArrowUp /> +3 mới
            </span>
          }
        />
        <StatCard
          title="Đang xử lý ứng cứu"
          value={8}
          tone="warning"
          icon={<FaExclamationTriangle />}
        />
        <StatCard
          title="Hoàn thành hôm nay"
          value={42}
          tone="success"
          icon={<FaShieldAlt />}
          suffix={
            <span className="inline-flex items-center gap-1">
              <FaArrowUp /> 92%
            </span>
          }
        />
      </div>

      <AdminCard title="Yêu cầu tiếp nhận khẩn cấp gần nhất">
        <DataTable columns={columns} rows={mockData} />
      </AdminCard>
    </div>
  );
}
