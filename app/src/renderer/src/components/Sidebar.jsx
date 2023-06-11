import React from 'react';
import { Layout, Menu } from 'antd';
import {
  AppstoreOutlined,
  MailOutlined,
  UsergroupAddOutlined,
  DashboardOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

function Sidebar({ onMenuClick, selectedMenuKey }) {
  const menuItems = [
    { key: '1', icon: <AppstoreOutlined />, label: 'Example Feeds' },
    { key: '2', icon: <MailOutlined />, label: 'My Feeds' },
    { key: '3', icon: <UsergroupAddOutlined />, label: 'Groups' },
    { key: '4', icon: <DashboardOutlined />, label: 'Dashboard' },
  ];

  const handleMenuClick = ({ key }) => {
    onMenuClick(key);
  };

  return (
    <Sider width={200} theme="light">
      <Menu mode="vertical" theme="light" selectedKeys={[selectedMenuKey]} onClick={handleMenuClick} items={menuItems}>
      </Menu>
    </Sider>
  );
}

export default Sidebar;
