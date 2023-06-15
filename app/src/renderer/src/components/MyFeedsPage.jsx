import React, { useState, useEffect } from 'react';
import { Row, Col, Modal, Form, Input, Button, Card, Divider } from 'antd';
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

  const groupedFeeds = feeds.reduce((groups, feed) => {
    const group = groups.find((group) => group.topic === feed.topic);
    if (group) {
      group.feeds.push(feed);
    } else {
      groups.push({ topic: feed.topic, feeds: [feed] });
    }
    return groups;
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

  const getColProps = () => {
    const colProps = {
      span: 6,
      style: { maxWidth: '300px' },
    };

    return colProps;
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
          Add Feed
        </Button>
      </div>
      {feeds.length === 0 ? (
        <div
          style={{
            margin: '16px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginTop: '30%',
          }}
        >
          Your subscribed feeds are empty. Subscribe or add some feeds.
        </div>
      ) : (
        groupedFeeds.map((group, groupIndex) => (
          <div key={groupIndex}>
            <Divider orientation="left">{group.topic}</Divider>
            <Row gutter={[16, 16]}>
              {group.feeds.map((feed, feedIndex) => (
                <Col key={feedIndex} span={6} style={{ maxWidth: '300px' }}>
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
        title="Add Feed"
        visible={modalOpen}
        onCancel={closeModal}
        onOk={handleAddFeed}
        destroyOnClose
      >
        <Form layout="vertical">
          <Form.Item label="Feed URL">
            <Input value={feedUrl} onChange={handleFeedUrlChange} />
          </Form.Item>
          <Form.Item label="Topic">
            <Input value={feedTopic} onChange={handleFeedTopicChange} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default MyFeedsPage;
