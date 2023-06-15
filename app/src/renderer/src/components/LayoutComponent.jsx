import React from 'react';
import { Layout } from 'antd';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import ExampleFeedsPage from './ExampleFeedsPage';
import MyFeedsPage from './MyFeedsPage';
import GroupsPage from './GroupsPage';
import DashboardPage from './DashboardPage';
import ItemPage from './ItemPage';

const { Content: AntContent } = Layout;

function LayoutComponent() {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Sidebar />
        <Layout>
          <AntContent style={{ padding: '24px', overflow: 'auto' }}>
            <Routes>
              <Route path="/" element={<ExampleFeedsPage />} />
              <Route path="/my-feeds" element={<MyFeedsPage />} />
              <Route path="/groups" element={<GroupsPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/items/:id" element={<ItemPage />} />
            </Routes>
          </AntContent>
        </Layout>
      </Layout>
    </Router>
  );
}

export default LayoutComponent;
