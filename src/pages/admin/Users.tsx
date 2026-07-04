import { Card, Table, Tag, Space, Button, Input } from 'antd';
import { SearchOutlined, UserAddOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface UserRecord {
  key: string;
  name: string;
  email: string;
  role: 'admin' | 'volunteer' | 'user';
  status: 'active' | 'suspended';
  phone: string;
}

const mockUsers: UserRecord[] = [
  { key: '1', name: 'Nguyễn Văn Admin', email: 'admin@sosrescue.gov.vn', role: 'admin', status: 'active', phone: '0905111222' },
  { key: '2', name: 'Trần Hải Tình Nguyện', email: 'volunteer.hai@gmail.com', role: 'volunteer', status: 'active', phone: '0914333444' },
  { key: '3', name: 'Lê Văn Nạn', email: 'levannan@gmail.com', role: 'user', status: 'active', phone: '0935888999' },
];

export default function Users() {
  const columns: ColumnsType<UserRecord> = [
    {
      title: 'Họ và tên',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        let color = 'blue';
        let text = 'Người dân';
        if (role === 'admin') {
          color = 'red';
          text = 'Quản trị viên';
        } else if (role === 'volunteer') {
          color = 'green';
          text = 'Tình nguyện viên';
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'error'}>
          {status === 'active' ? 'Hoạt động' : 'Tạm khóa'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: () => (
        <Space size="middle">
          <Button type="link" size="small">Sửa</Button>
          <Button type="link" danger size="small">Khóa</Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 'bold', margin: '0 0 4px 0' }}>Quản lý người dùng</h2>
          <p style={{ color: '#666', margin: 0 }}>Quản lý tài khoản Admin, Tình nguyện viên và Người dân trên hệ thống.</p>
        </div>
        <Button type="primary" icon={<UserAddOutlined />} className="bg-[var(--primary)] border-0">
          Thêm người dùng
        </Button>
      </div>

      <Card bordered={false} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            style={{ maxWidth: 400 }}
          />
        </div>
        <Table columns={columns} dataSource={mockUsers} />
      </Card>
    </div>
  );
}
