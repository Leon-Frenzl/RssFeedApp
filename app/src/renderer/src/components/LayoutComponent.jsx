import React, { useState } from 'react';
import { Layout } from 'antd';
import Sidebar from './Sidebar';
import ExampleFeedsPage from './ExampleFeedsPage';
import MyFeedsPage from './MyFeedsPage';
import GroupsPage from './GroupsPage';
import DashboardPage from './DashboardPage';

const { Content: AntContent } = Layout;

function LayoutComponent() {
    const [selectedMenuKey, setSelectedMenuKey] = useState('1');

    const handleMenuClick = (key) => {
        setSelectedMenuKey(key);
    };

    const renderContent = () => {
        switch (selectedMenuKey) {
            case '1':
                return <ExampleFeedsPage />;
            case '2':
                return <MyFeedsPage />;
            case '3':
                return <GroupsPage />;
            case '4':
                return <DashboardPage />;
            default:
                return null;
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sidebar onMenuClick={handleMenuClick} selectedMenuKey={selectedMenuKey} className="sidebar"/>
            <Layout>
                <AntContent style={{ padding: '24px', overflow: 'auto' }}>
                    {renderContent()}
                </AntContent>
            </Layout>
        </Layout>

    );
}

export default LayoutComponent;
