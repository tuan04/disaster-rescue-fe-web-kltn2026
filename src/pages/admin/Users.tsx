import { FaSearch, FaUserPlus } from "react-icons/fa";
import {
  AdminButton,
  AdminCard,
  DataTable,
  type DataTableColumn,
  StatusTag,
} from "@/components/ui/admin/AdminUi";

interface UserRecord {
  key: string;
  name: string;
  email: string;
  role: "admin" | "volunteer" | "user";
  status: "active" | "suspended";
  phone: string;
}

const mockUsers: UserRecord[] = [
  {
    key: "1",
    name: "Nguyễn Văn Admin",
    email: "admin@sosrescue.gov.vn",
    role: "admin",
    status: "active",
    phone: "0905111222",
  },
  {
    key: "2",
    name: "Trần Hải Tình Nguyện",
    email: "volunteer.hai@gmail.com",
    role: "volunteer",
    status: "active",
    phone: "0914333444",
  },
  {
    key: "3",
    name: "Lê Văn Nạn",
    email: "levannan@gmail.com",
    role: "user",
    status: "active",
    phone: "0935888999",
  },
];

const roleMeta = {
  admin: { tone: "danger" as const, label: "Quản trị viên" },
  volunteer: { tone: "success" as const, label: "Tình nguyện viên" },
  user: { tone: "info" as const, label: "Người dân" },
};

export default function Users() {
  const columns: DataTableColumn<UserRecord>[] = [
    {
      key: "name",
      title: "Họ và tên",
      render: (record) => <span className="font-medium text-text">{record.name}</span>,
    },
    {
      key: "email",
      title: "Email",
      render: (record) => record.email,
    },
    {
      key: "phone",
      title: "Số điện thoại",
      render: (record) => record.phone,
    },
    {
      key: "role",
      title: "Vai trò",
      render: (record) => {
        const role = roleMeta[record.role];
        return <StatusTag tone={role.tone}>{role.label}</StatusTag>;
      },
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (record) => (
        <StatusTag tone={record.status === "active" ? "success" : "danger"}>
          {record.status === "active" ? "Hoạt động" : "Tạm khóa"}
        </StatusTag>
      ),
    },
    {
      key: "action",
      title: "Thao tác",
      render: () => (
        <div className="flex items-center gap-3">
          <AdminButton variant="link" size="sm">
            Sửa
          </AdminButton>
          <AdminButton variant="danger" size="sm">
            Khóa
          </AdminButton>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="mb-1 text-title font-bold text-text">Quản lý người dùng</h2>
          <p className="text-sm text-slate-500">
            Quản lý tài khoản Admin, Tình nguyện viên và Người dân trên hệ thống.
          </p>
        </div>
        <AdminButton variant="primary" icon={<FaUserPlus />}>
          Thêm người dùng
        </AdminButton>
      </div>

      <AdminCard>
        <label className="relative mb-4 block max-w-md">
          <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="h-10 w-full rounded-md border border-slate-300 bg-white pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15"
            placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
            type="search"
          />
        </label>
        <DataTable columns={columns} rows={mockUsers} />
      </AdminCard>
    </div>
  );
}
