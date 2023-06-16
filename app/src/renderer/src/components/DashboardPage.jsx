import React, { useEffect, useState } from 'react';
import { Layout, Card, Row, Col, Statistic, Progress, List } from 'antd';

const { Header, Content, Footer } = Layout;

function DashboardPage({appUsageTime}) {
  const [rssFeeds, setRssFeeds] = useState([]);
  const [updatedFeeds, setUpdatedFeeds] = useState([]);
  const [socialMediaNotifications, setSocialMediaNotifications] = useState([]);

  useEffect(() => {
    // Simulate fetching data from APIs or other sources
    // Replace with your actual API calls or data retrieval logic

    // Fetch RSS feeds
    const fetchRssFeeds = () => {
      // Simulated API call to fetch RSS feeds
      setTimeout(() => {
        const feeds = [
          { title: 'Feed 1', readTime: 12 },
          { title: 'Feed 2', readTime: 8 },
          { title: 'Feed 3', readTime: 15 },
        ];
        setRssFeeds(feeds);
      }, 1500);
    };

    // Fetch updated feeds
    const fetchUpdatedFeeds = () => {
      // Simulated API call to fetch updated feeds
      setTimeout(() => {
        const updatedFeeds = [
          { title: 'Updated Feed 1', updatedTime: '10 minutes ago' },
          { title: 'Updated Feed 2', updatedTime: '1 hour ago' },
          { title: 'Updated Feed 3', updatedTime: '2 hours ago' },
        ];
        setUpdatedFeeds(updatedFeeds);
      }, 2000);
    };

    // Fetch social media notifications
    const fetchSocialMediaNotifications = () => {
      // Simulated API call to fetch social media notifications
      setTimeout(() => {
        const notifications = [
          { id: 1, text: 'New message from John Doe' },
          { id: 2, text: 'You have 10 new followers' },
          { id: 3, text: 'Your post has been shared 50 times' },
        ];
        setSocialMediaNotifications(notifications);
      }, 2500);
    };

    // Fetch all data
    fetchRssFeeds();
    fetchUpdatedFeeds();
    fetchSocialMediaNotifications();
  }, []);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: 0 }} />
      <Content style={{ margin: '24px 16px 0' }}>
        <div style={{ padding: 24, minHeight: 360 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={24} md={8} lg={8} xl={8}>
              <Card title="App Usage Statistics" bordered={false}>
                <Statistic title="Total App Usage" value={`${appUsageTime.toString()} seconds`} />
              </Card>
            </Col>
            <Col xs={24} sm={24} md={8} lg={8} xl={8}>
              <Card title="Read Time on RSS Feeds" bordered={false}>
                <List
                  dataSource={rssFeeds}
                  renderItem={(feed) => (
                    <List.Item>
                      <List.Item.Meta title={feed.title} />
                      <Progress
                        percent={(feed.readTime / 20) * 100} // Assuming a maximum read time of 20 minutes
                        format={(percent) => `${Math.round((percent * 20) / 100)} min`}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col xs={24} sm={24} md={8} lg={8} xl={8}>
              <Card title="Updated Feeds" bordered={false}>
                <List
                  dataSource={updatedFeeds}
                  renderItem={(feed) => (
                    <List.Item>{`${feed.title} (Updated ${feed.updatedTime})`}</List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <Card title="Social Media Notifications" bordered={false}>
                <List
                  dataSource={socialMediaNotifications}
                  renderItem={(notification) => <List.Item>{notification.text}</List.Item>}
                />
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>RSS Feed App ©2023 Created by Leon Frenzl</Footer>
    </Layout>
  );
}

export default DashboardPage;
