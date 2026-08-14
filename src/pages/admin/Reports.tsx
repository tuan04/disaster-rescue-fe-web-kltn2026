import { FaFileExcel } from "react-icons/fa";
import {
  AdminButton,
  AdminCard,
  DataTable,
  type DataTableColumn,
  StatusTag,
} from "@/components/ui/admin/AdminUi";

interface ReportRecord {
  key: string;
  id: string;
  sender: string;
  phone: string;
  type: "flood" | "landslide" | "medical" | "other";
  location: string;
  status: "pending" | "processing" | "completed";
  date: string;
}

const mockReports: ReportRecord[] = [
  {
    key: "1",
    id: "REP-001",
    sender: "Lê Hoàng M",
    phone: "0905111333",
    type: "flood",
    location: "Xã Hòa Khương, Huyện Hòa Vang, Đà Nẵng",
    status: "pending",
    date: "04/07/2026",
  },
  {
    key: "2",
    id: "REP-002",
    sender: "Phan Văn K",
    phone: "0914222444",
    type: "landslide",
    location: "Đèo Hải Vân, Phường Hòa Hiệp Bắc, Quận Liên Chiểu, Đà Nẵng",
    status: "processing",
    date: "04/07/2026",
  },
  {
    key: "3",
    id: "REP-003",
    sender: "Nguyễn Thị H",
    phone: "0935333555",
    type: "medical",
    location: "Phường Khuê Trung, Quận Cẩm Lệ, Đà Nẵng",
    status: "completed",
    date: "03/07/2026",
  },
];

const typeMeta = {
  flood: { tone: "info" as const, label: "Lũ lụt / Ngập úng" },
  landslide: { tone: "volcano" as const, label: "Sạt lở đất" },
  medical: { tone: "magenta" as const, label: "Cấp cứu y tế" },
  other: { tone: "default" as const, label: "Khác" },
};

const statusMeta = {
  pending: { tone: "default" as const, label: "Chờ duyệt" },
  processing: { tone: "info" as const, label: "Đang xử lý" },
  completed: { tone: "success" as const, label: "Đã đóng" },
};

export default function Reports() {
  const columns: DataTableColumn<ReportRecord>[] = [
    {
      key: "id",
      title: "Mã báo cáo",
      render: (record) => <span className="font-bold text-text">{record.id}</span>,
    },
    {
      key: "sender",
      title: "Người báo cáo",
      render: (record) => record.sender,
    },
    {
      key: "phone",
      title: "Số điện thoại",
      render: (record) => record.phone,
    },
    {
      key: "type",
      title: "Loại sự cố",
      render: (record) => {
        const type = typeMeta[record.type];
        return <StatusTag tone={type.tone}>{type.label}</StatusTag>;
      },
    },
    {
      key: "location",
      title: "Địa điểm",
      render: (record) => record.location,
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
      key: "date",
      title: "Ngày báo cáo",
      render: (record) => record.date,
    },
    {
      key: "action",
      title: "Hành động",
      render: () => (
        <div className="flex items-center gap-3">
          <AdminButton variant="link" size="sm">
            Xem chi tiết
          </AdminButton>
          <AdminButton variant="link" size="sm">
            Phân phối cứu trợ
          </AdminButton>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="mb-1 text-title font-bold text-text">Báo cáo cứu hộ</h2>
          <p className="text-sm text-slate-500">
            Theo dõi, xác thực thông tin và quản lý các lượt yêu cầu hỗ trợ từ người dân.
          </p>
        </div>
        <AdminButton icon={<FaFileExcel />}>Xuất dữ liệu</AdminButton>
      </div>

      <AdminCard>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <select className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15 sm:w-52">
            <option value="">Lọc loại sự cố</option>
            <option value="flood">Lũ lụt / Ngập úng</option>
            <option value="landslide">Sạt lở đất</option>
            <option value="medical">Cấp cứu y tế</option>
            <option value="other">Khác</option>
          </select>
          <select className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15 sm:w-44">
            <option value="">Lọc trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="processing">Đang xử lý</option>
            <option value="completed">Đã đóng</option>
          </select>
        </div>
        <DataTable columns={columns} rows={mockReports} />
      </AdminCard>
    </div>
  );
}
