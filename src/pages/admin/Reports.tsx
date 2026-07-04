import { Card, Table, Tag, Space, Button, Select } from 'antd';
import { FileExcelOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface ReportRecord {
  key: string;
  id: string;
  sender: string;
  phone: string;
  type: 'flood' | 'landslide' | 'medical' | 'other';
  location: string;
  status: 'pending' | 'processing' | 'completed';
  date: string;
}

const mockReports: ReportRecord[] = [
  { key: '1', id: 'REP-001', sender: 'Lê Hoàng M', phone: '0905111333', type: 'flood', location: 'Xã Hòa Khương, Huyện Hòa Vang, Đà Nẵng', status: 'pending', date: '04/07/2026' },
  { key: '2', id: 'REP-002', sender: 'Phan Văn K', phone: '0914222444', type: 'landslide', location: 'Đèo Hải Vân, Phường Hòa Hiệp Bắc, Quận Liên Chiểu, Đà Nẵng', status: 'processing', date: '04/07/2026' },
  { key: '3', id: 'REP-003', sender: 'Nguyễn Thị H', phone: '0935333555', type: 'medical', location: 'Phường Khuê Trung, Quận Cẩm Lệ, Đà Nẵng', status: 'completed', date: '03/07/2026' },
];

export default function Reports() {
  const columns: ColumnsType<ReportRecord> = [
    {
      title: 'Mã báo cáo',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
    },
    {
      title: 'Người báo cáo',
      dataIndex: 'sender',
      key: 'sender',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Loại sự cố',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        let color = 'default';
        let text = 'Khác';
        if (type === 'flood') {
          color = 'blue';
          text = 'Lũ lụt / Ngập úng';
        } else if (type === 'landslide') {
          color = 'volcano';
          text = 'Sạt lở đất';
        } else if (type === 'medical') {
          color = 'magenta';
          text = 'Cấp cứu y tế';
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        let text = 'Chờ duyệt';
        if (status === 'processing') {
          color = 'processing';
          text = 'Đang xử lý';
        } else if (status === 'completed') {
          color = 'success';
          text = 'Đã đóng';
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Ngày báo cáo',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: () => (
        <Space size="middle">
          <Button type="link" size="small">Xem chi tiết</Button>
          <Button type="link" size="small">Phân phối cứu trợ</Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 'bold', margin: '0 0 4px 0' }}>Báo cáo cứu hộ</h2>
          <p style={{ color: '#666', margin: 0 }}>Theo dõi, xác thực thông tin và quản lý các lượt yêu cầu hỗ trợ từ người dân.</p>
        </div>
        <Button icon={<FileExcelOutlined />}>Xuất dữ liệu</Button>
      </div>

      <Card bordered={false} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
          <Select
            placeholder="Lọc loại sự cố"
            style={{ width: 200 }}
            allowClear
            options={[
              { value: 'flood', label: 'Lũ lụt / Ngập úng' },
              { value: 'landslide', label: 'Sạt lở đất' },
              { value: 'medical', label: 'Cấp cứu y tế' },
              { value: 'other', label: 'Khác' },
            ]}
          />
          <Select
            placeholder="Lọc trạng thái"
            style={{ width: 160 }}
            allowClear
            options={[
              { value: 'pending', label: 'Chờ duyệt' },
              { value: 'processing', label: 'Đang xử lý' },
              { value: 'completed', label: 'Đã đóng' },
            ]}
          />
        </div>
        <Table columns={columns} dataSource={mockReports} />
      </Card>
    </div>
  );
}
