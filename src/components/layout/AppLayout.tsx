import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Input, Badge, Button, Avatar } from 'antd';
import {
  DashboardOutlined,
  BellOutlined,
  SettingOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import './AppLayout.css';

const { Header, Sider, Content, Footer } = Layout;

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems: MenuProps['items'] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Fleet Dashboard',
      onClick: () => navigate('/dashboard'),
    },
    {
      key: '/alerts',
      icon: <BellOutlined />,
      label: 'Alerts Center',
      onClick: () => navigate('/alerts'),
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/settings'),
    },
  ];

  const selectedKey = '/' + location.pathname.split('/')[1] || '/dashboard';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div
            style={{
              fontSize: '20px',
              fontWeight: 600,
              fontStyle: 'italic',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/dashboard')}
          >
            SunGazer
          </div>
          <Menu
            mode="horizontal"
            selectedKeys={[selectedKey]}
            items={[
              {
                key: '/dashboard',
                label: 'Fleet Dashboard',
                onClick: () => navigate('/dashboard'),
              },
              {
                key: '/alerts',
                label: 'Alerts Center',
                onClick: () => navigate('/alerts'),
              },
              {
                key: '/settings',
                label: 'Settings',
                onClick: () => navigate('/settings'),
              },
            ]}
            style={{ flex: 1, border: 'none' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Input
            placeholder="Search sites or alerts..."
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
          />
          <Badge count={4} offset={[-5, 5]}>
            <Button
              type="text"
              icon={<BellOutlined style={{ fontSize: 18 }} />}
            />
          </Badge>
          <Button type="primary">SP&L</Button>
          <Avatar icon={<UserOutlined />} />
        </div>
      </Header>

      <Layout>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={220}
          style={{ background: '#fff' }}
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            style={{ height: '100%', borderRight: 0 }}
          />
        </Sider>

        <Layout style={{ padding: '24px', background: '#f0f2f5' }}>
          <Content>
            <Outlet />
          </Content>
          <Footer
            style={{
              textAlign: 'center',
              background: 'transparent',
              padding: '12px 0',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <a href="#" style={{ marginRight: 24 }}>Home</a>
                <a href="#" style={{ marginRight: 24 }}>Resources</a>
                <a href="#" style={{ marginRight: 24 }}>Support</a>
              </div>
              <div style={{ color: '#8c8c8c' }}>
                Made with Visily
              </div>
            </div>
          </Footer>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AppLayout;

