import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Space, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  FileProtectOutlined,
  LogoutOutlined,
  HomeOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Menu items selection key logic based on current route path
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/admin') return 'dashboard';
    if (path.startsWith('/admin/users')) return 'users';
    if (path.startsWith('/admin/reports')) return 'reports';
    return 'dashboard';
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Tổng quan',
      onClick: () => navigate('/admin'),
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: 'Quản lý Người dùng',
      onClick: () => navigate('/admin/users'),
    },
    {
      key: 'reports',
      icon: <FileProtectOutlined />,
      label: 'Báo cáo Cứu hộ',
      onClick: () => navigate('/admin/reports'),
    },
    {
      key: 'divider',
      type: 'divider',
    },
    {
      key: 'back-home',
      icon: <HomeOutlined />,
      label: 'Về trang chủ',
      onClick: () => navigate('/'),
    },
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: () => {
        // Handle logout
        navigate('/');
      },
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sider Navigation */}
      <Sider trigger={null} collapsible collapsed={collapsed} theme="dark" width={240}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', background: '#001529' }}>
          <span style={{ color: '#FF6B00', fontWeight: 'bold', fontSize: collapsed ? 16 : 20, whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
            {collapsed ? 'SOS' : 'SOS Admin Panel'}
          </span>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
        />
      </Sider>

      {/* Main layout container */}
      <Layout>
        {/* Admin Header */}
        <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />

          <Space size="large">
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#FF6B00' }} />
                <span style={{ fontWeight: 500 }}>Administrator</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* Content Body */}
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: '#fff',
            borderRadius: 8,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
