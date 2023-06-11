import React, { useState } from 'react';
import { Row, Col, Modal, Form, Input, Button, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import FeedCard from './ExampleFeedCard';

function MyFeedsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [feeds, setFeeds] = useState([]);
  const [feedUrl, setFeedUrl] = useState('');

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFeedUrl('');
  };

  const handleFeedUrlChange = (event) => {
    setFeedUrl(event.target.value);
  };

  const handleAddFeed = () => {
    setFeeds([...feeds, feedUrl]);
    closeModal();
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card onClick={openModal} style={{ height: '100%', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <PlusOutlined style={{ fontSize: '24px' }} />
            </div>
          </Card>
        </Col>
        {feeds.map((feedUrl, index) => (
          <Col span={6} key={index}>
            <FeedCard url={feedUrl} />
          </Col>
        ))}
      </Row>
      <Modal
        title="Add Feed"
        open={modalOpen}
        onCancel={closeModal}
        footer={[
          <Button key="cancel" onClick={closeModal}>
            Cancel
          </Button>,
          <Button key="add" type="primary" onClick={handleAddFeed}>
            Add
          </Button>,
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="Feed URL">
            <Input value={feedUrl} onChange={handleFeedUrlChange} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default MyFeedsPage;
