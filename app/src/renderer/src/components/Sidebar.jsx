import React from 'react';
import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  AppstoreOutlined,
  MailOutlined,
  BookOutlined,
  DashboardOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { key: '/', icon: <AppstoreOutlined />, label: 'Example Feeds' },
    { key: '/my-feeds', icon: <MailOutlined />, label: 'My Feeds' },
    { key: '/packages', icon: <BookOutlined />, label: 'Packages' },
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  ];

  return (
    <Sider width={200} theme="light">
      <Menu
        mode="vertical"
        theme="light"
        selectedKeys={[location.pathname]}
      >
        {menuItems.map((item) => (
          <Menu.Item key={item.key} icon={item.icon}>
            <Link to={item.key}>{item.label}</Link>
          </Menu.Item>
        ))}
      </Menu>
    </Sider>
  );
}

export default Sidebar;
