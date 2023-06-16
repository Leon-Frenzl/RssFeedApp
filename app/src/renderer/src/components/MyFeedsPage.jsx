import React, { useState, useEffect } from 'react';
import { Row, Col, Modal, Form, Input, Button, Card, Divider } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import FeedCard from './ExampleFeedCard';

function MyFeedsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [feeds, setFeeds] = useState([]);
  const [feedUrl, setFeedUrl] = useState('');
  const [feedTopic, setFeedTopic] = useState('');

  useEffect(() => {
    const ipcRenderer = window.electron.ipcRenderer;

    const fetchFeeds = async () => {
      ipcRenderer.send('read-rssFeeds');
    };

    ipcRenderer.on('response-rssFeeds', (event, parsedFeeds) => {
      if (Array.isArray(parsedFeeds)) {
        console.log(parsedFeeds);
        setFeeds(parsedFeeds);
      } else {
        setFeeds([]);
      }
    });

    fetchFeeds();

    return () => {
      ipcRenderer.removeAllListeners('response-rssFeeds');
    };
  }, []);

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFeedUrl('');
    setFeedTopic('');
  };

  const handleFeedUrlChange = (event) => {
    setFeedUrl(event.target.value);
  };

  const handleFeedTopicChange = (event) => {
    setFeedTopic(event.target.value);
  };

  const handleAddFeed = () => {
    const newFeed = { url: feedUrl, topic: feedTopic, subscribed: true };
    setFeeds([...feeds, newFeed]);
    closeModal();
  };

  const handleSubscribe = (rssFeedUrl) => {
    const ipcRenderer = window.electron.ipcRenderer;

    ipcRenderer.send('unsubscribe-from-feed', rssFeedUrl);

    setFeeds((prevFeeds) =>
      prevFeeds.map((feed) => {
        if (feed.url === rssFeedUrl) {
          return { ...feed, subscribed: false };
        }
        return feed;
      })
    );
  };

  const handleUnsubscribe = (rssFeedUrl) => {
    const ipcRenderer = window.electron.ipcRenderer;

    ipcRenderer.send('unsubscribe-from-feed', rssFeedUrl);

    setFeeds((prevFeeds) =>
      prevFeeds.filter((feed) => feed.url !== rssFeedUrl)
    );
  };

  const groupedFeeds = feeds.reduce((groups, feed) => {
    const groupIndex = groups.findIndex((group) => group.topic === feed.topic);
    if (groupIndex !== -1) {
      groups[groupIndex].feeds.push(feed);
    } else {
      groups.push({ topic: feed.topic, feeds: [feed] });
    }
    return groups;
  }, []);

  const getColProps = () => {
    const colProps = {
      span: 6,
      style: { maxWidth: '300px' },
    };

    return colProps;
  };

  return (
    <div style={{ padding: '16px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <h1 style={{ margin: 0 }}>My Feeds</h1>
        <Button type="primary" onClick={openModal}>
          <PlusOutlined /> Add Feed
        </Button>
      </div>
      {feeds.length === 0 ? (
        <div
          style={{
            margin: '16px',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          No feeds available. Add a new feed to get started!
        </div>
      ) : (
        groupedFeeds.map((group, groupIndex) => (
          <div key={groupIndex}>
            <Divider orientation="left">{group.topic}</Divider>
            <Row gutter={[16, 16]}>
              {group.feeds.map((feed, feedIndex) => (
                <Col key={feedIndex} {...getColProps()}>
                  <FeedCard
                    id={feed.id}
                    image={feed.image}
                    title={feed.title}
                    author={feed.author}
                    description={feed.description}
                    rssFeedUrl={feed.url}
                    topic={feed.topic}
                    subscribed={feed.subscribed}
                    onSubscribe={handleSubscribe}
                    onUnsubscribe={handleUnsubscribe}
                  />
                </Col>
              ))}
            </Row>
          </div>
        ))
      )}

      <Modal
        visible={modalOpen}
        onCancel={closeModal}
        title="Add Feed"
        footer={[
          <Button key="cancel" onClick={closeModal}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            disabled={!feedUrl || !feedTopic}
            onClick={handleAddFeed}
          >
            Add
          </Button>,
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="Feed URL">
            <Input
              value={feedUrl}
              onChange={handleFeedUrlChange}
              placeholder="Enter the feed URL"
            />
          </Form.Item>
          <Form.Item label="Topic">
            <Input
              value={feedTopic}
              onChange={handleFeedTopicChange}
              placeholder="Enter the topic"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default MyFeedsPage;
