import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Card, Divider } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import FeedCard from './ExampleFeedCard';

function MyFeedsPage() {
  const [feeds, setFeeds] = useState([]);

  const ipcRenderer = window.electron.ipcRenderer;

  useEffect(() => {
    const fetchFeeds = async () => {
      ipcRenderer.send('read-rssFeeds');
    };

    const handleResponse = (event, parsedFeeds) => {
      if (Array.isArray(parsedFeeds)) {
        setFeeds(parsedFeeds);
      } else {
        setFeeds([]);
      }
    };

    ipcRenderer.on('response-rssFeeds', handleResponse);

    fetchFeeds();

    return () => {
      ipcRenderer.removeAllListeners('response-rssFeeds', handleResponse);
    };
  }, []);

  const handleSubscribe = (rssFeedUrl) => {
    ipcRenderer.send('subscribe-to-feed', rssFeedUrl);

    setFeeds((prevFeeds) =>
      prevFeeds.map((feed) => {
        if (feed.url === rssFeedUrl) {
          return { ...feed, subscribed: true };
        }
        return feed;
      })
    );
  };

  const handleUnsubscribe = (rssFeedUrl) => {
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
    </div>
  );
}

export default MyFeedsPage;
