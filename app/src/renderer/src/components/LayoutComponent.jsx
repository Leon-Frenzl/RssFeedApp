import React, {useState, useEffect} from 'react';
import { Layout } from 'antd';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import ExampleFeedsPage from './ExampleFeedsPage';
import MyFeedsPage from './MyFeedsPage';
import PackagePage from './PackagePage';
import DashboardPage from './DashboardPage';
import ItemPage from './ItemPage';

const { Content: AntContent } = Layout;

function LayoutComponent() {
  const [appUsageTime, setAppUsageTime] = useState(0);

  useEffect(() => {
    const ipcRenderer = window.electron.ipcRenderer;
    ipcRenderer.send('start-app-usage-timer'); // Send command to start the app usage timer

    ipcRenderer.on('app-usage-time', (event, usageTime) => {
      setAppUsageTime(usageTime);
    });

    return () => {
      ipcRenderer.send('stop-app-usage-timer'); // Send command to stop the app usage timer
      ipcRenderer.removeAllListeners('app-usage-time');
    };
  }, []);

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
              <Route path="/dashboard" element={<DashboardPage appUsageTime={appUsageTime}/>} />
              <Route path="/items/:id" element={<ItemPage />} />
            </Routes>
          </AntContent>
        </Layout>
      </Layout>
    </Router>
  );
}

export default LayoutComponent;
