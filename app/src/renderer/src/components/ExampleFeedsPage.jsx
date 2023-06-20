import React, { useEffect, useState } from 'react';
import { Row, Col, Divider, Modal, Form, Input, Button } from 'antd';
import FeedCard from './ExampleFeedCard';
import FilterFeedComponent from './FilterFeedComponent';

function ExampleFeedsPage() {
  const [exampleFeeds, setExampleFeeds] = useState([]);
  const [filteredFeeds, setFilteredFeeds] = useState([]);
  const [feedUrl, setFeedUrl] = useState('');
  const [feedTopic, setFeedTopic] = useState('');
  const [description, setDescription] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const ipcRenderer = window.electron.ipcRenderer;

  const fetchExampleFeeds = async () => {
    ipcRenderer.send('read-example-feeds');
  };

  useEffect(() => {
    ipcRenderer.on('response-example-feeds', (event, parsedFeeds) => {
      if (parsedFeeds.error) {
        showModal('Error', parsedFeeds.error);
      } else {
        setExampleFeeds(parsedFeeds);
        setFilteredFeeds(parsedFeeds);
      }
    });

    fetchExampleFeeds();

    return () => {
      ipcRenderer.removeAllListeners('response-example-feeds');
    };
  }, []);

  const handleSubscribe = (rssFeedUrl, description, topic) => {
    const updatedFeeds = exampleFeeds.map((feed) => {
      if (feed.url === rssFeedUrl) {
        return { ...feed, subscribed: true, description, topic };
      }
      return feed;
    });
    setExampleFeeds(updatedFeeds);
    setFilteredFeeds(updatedFeeds);
    const ipcRenderer = window.electron.ipcRenderer;
    ipcRenderer.send('subscribe-to-feed', rssFeedUrl, description, topic);
  };

  const handleUnsubscribe = (rssFeedUrl) => {
    const updatedFeeds = exampleFeeds.map((feed) => {
      if (feed.url === rssFeedUrl) {
        return { ...feed, subscribed: false };
      }
      return feed;
    });
    setExampleFeeds(updatedFeeds);
    setFilteredFeeds(updatedFeeds);
    const ipcRenderer = window.electron.ipcRenderer;
    ipcRenderer.send('unsubscribe-from-feed', rssFeedUrl);
  };

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFeedUrl('');
    setFeedTopic('');
    setDescription('');
  };

  const handleFeedUrlChange = (event) => {
    setFeedUrl(event.target.value);
  };

  const handleFeedTopicChange = (event) => {
    setFeedTopic(event.target.value);
  };

  const handleFeedDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleAddFeed = () => {
    const ipcRenderer = window.electron.ipcRenderer;
    ipcRenderer.send('add-rssFeed', feedUrl, description, feedTopic);
    closeModal();
    fetchExampleFeeds();
  };

  const groupedFeeds = filteredFeeds.reduce((groups, feed) => {
    const group = groups.find((group) => group.topic === feed.topic);
    if (group) {
      group.feeds.push(feed);
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
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center' }}>
        <h1 style={{ flex: 1, marginBottom: 0 }}>Example Feeds Page</h1>
        <Button type="primary" onClick={openModal} style={{ marginLeft: '16px' }}>
          Add Feed
        </Button>
      </div>
      <FilterFeedComponent feeds={exampleFeeds} setFilteredFeeds={setFilteredFeeds} />
      {groupedFeeds.map((group, groupIndex) => (
        <div key={groupIndex}>
          <Divider orientation="left">{group.topic}</Divider>
          {group.feeds.length > 0 && (
            <Row gutter={[16, 16]}>
              {group.feeds.map((feed, feedIndex) => (
                <React.Fragment key={feedIndex}>
                  <Col {...getColProps()}>
                    <FeedCard
                      image={feed.image}
                      title={feed.title}
                      author={feed.author}
                      description={feed.description}
                      rssFeedUrl={feed.url}
                      topic={group.topic}
                      id={feed.id}
                      subscribed={feed.subscribed}
                      onSubscribe={handleSubscribe}
                      onUnsubscribe={handleUnsubscribe}
                    />
                  </Col>
                  {(feedIndex + 1) % 4 === 0 && <div style={{ width: '100%' }}></div>}
                </React.Fragment>
              ))}
            </Row>
          )}
        </div>
      ))}
      <Modal
        open={modalOpen}
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
          <Form.Item label="Description">
            <Input
              value={description}
              onChange={handleFeedDescriptionChange}
              placeholder="Enter Feed Description"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ExampleFeedsPage;
