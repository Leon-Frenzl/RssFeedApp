import React, {useState, useEffect} from 'react';
import { Layout } from 'antd';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import ExampleFeedsPage from './ExampleFeedsPage';
import MyFeedsPage from './MyFeedsPage';
import PackagePage from './PackagePage';
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
              <Route path="/packages" element={<PackagePage />} />
              <Route path="/items/:id" element={<ItemPage />} />
            </Routes>
          </AntContent>
        </Layout>
      </Layout>
    </Router>
  );
}

export default LayoutComponent;
