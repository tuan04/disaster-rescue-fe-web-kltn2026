import { Card, Col, Row, Statistic, Table, Tag, Space, Button } from 'antd';
import { ArrowUpOutlined, AlertOutlined, SafetyOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface RescueRecord {
  key: string;
  id: string;
  sender: string;
  phone: string;
  location: string;
  severity: 'danger' | 'warning' | 'normal';
  status: 'pending' | 'processing' | 'completed';
  time: string;
}

const mockData: RescueRecord[] = [
  {
    key: '1',
    id: 'SOS-0045',
    sender: 'Nguyễn Văn A',
    phone: '0905123456',
    location: 'Quận Liên Chiểu, Đà Nẵng',
    severity: 'danger',
    status: 'pending',
    time: '14:25 - 04/07/2026',
  },
  {
    key: '2',
    id: 'SOS-0044',
    sender: 'Trần Thị B',
    phone: '0914987654',
    location: 'Huyện Hòa Vang, Đà Nẵng',
    severity: 'warning',
    status: 'processing',
    time: '13:10 - 04/07/2026',
  },
  {
    key: '3',
    id: 'SOS-0043',
    sender: 'Phạm Minh C',
    phone: '0935555666',
    location: 'Quận Cẩm Lệ, Đà Nẵng',
    severity: 'normal',
    status: 'completed',
    time: '10:05 - 04/07/2026',
  },
];

export default function Dashboard() {
  const columns: ColumnsType<RescueRecord> = [
    {
      title: 'Mã số',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
    },
    {
      title: 'Người gửi',
      dataIndex: 'sender',
      key: 'sender',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Khu vực',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Mức độ',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => {
        let color = 'blue';
        let text = 'Thường';
        if (severity === 'danger') {
          color = 'red';
          text = 'Nguy cấp';
        } else if (severity === 'warning') {
          color = 'gold';
          text = 'Cần chú ý';
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        let text = 'Chờ xử lý';
        if (status === 'processing') {
          color = 'processing';
          text = 'Đang cứu nạn';
        } else if (status === 'completed') {
          color = 'success';
          text = 'Hoàn thành';
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Thời gian',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" size="small">Chi tiết</Button>
          {record.status !== 'completed' && (
            <Button type="primary" size="small" ghost>Cập nhật</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 24, fontWeight: 'bold', margin: '0 0 8px 0' }}>Bảng quản trị hệ thống</h2>
        <p style={{ color: '#666', margin: 0 }}>Cập nhật tình hình cứu hộ khẩn cấp trực tuyến trong khu vực.</p>
      </div>

      {/* Quick Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Statistic
              title="Yêu cầu đang chờ"
              value={12}
              valueStyle={{ color: '#cf1322' }}
              prefix={<AlertOutlined />}
              suffix={<span style={{ fontSize: 12, color: '#cf1322', marginLeft: 8 }}><ArrowUpOutlined /> +3 mới</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Statistic
              title="Đang xử lý ứng cứu"
              value={8}
              valueStyle={{ color: '#d46b08' }}
              prefix={<AlertOutlined spin />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Statistic
              title="Hoàn thành hôm nay"
              value={42}
              valueStyle={{ color: '#3f8600' }}
              prefix={<SafetyOutlined />}
              suffix={<span style={{ fontSize: 12, color: '#3f8600', marginLeft: 8 }}><ArrowUpOutlined /> 92%</span>}
            />
          </Card>
        </Col>
      </Row>

      {/* Table section */}
      <Card title="Yêu cầu tiếp nhận khẩn cấp gần nhất" bordered={false} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Table columns={columns} dataSource={mockData} pagination={false} />
      </Card>
    </div>
  );
}
