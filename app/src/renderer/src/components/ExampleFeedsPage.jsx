import React, { useEffect, useState } from 'react';
import { Row, Col, Divider, Modal } from 'antd';
import FeedCard from './ExampleFeedCard';

function ExampleFeedsPage() {
  const [exampleFeeds, setExampleFeeds] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');

  useEffect(() => {
    const ipcRenderer = window.electron.ipcRenderer;

    const fetchExampleFeeds = async () => {
      ipcRenderer.send('read-example-feeds');
    };

    ipcRenderer.on('response-example-feeds', (event, parsedFeeds) => {
      if (parsedFeeds.error) {
        showModal('Error', parsedFeeds.error);
      } else {
        setExampleFeeds(parsedFeeds);
      }
    });

    ipcRenderer.on('response-subscribe', (event, response) => {
      if (response && response.error) {
        showModal('Error', response.error);
      } else {
        fetchExampleFeeds();
      }
    });

    ipcRenderer.on('response-unsubscribe', (event, response) => {
      if (response && response.error) {
        showModal('Error', response.error);
      } else {
        fetchExampleFeeds();
      }
    });

    fetchExampleFeeds();

    return () => {
      ipcRenderer.removeAllListeners('response-example-feeds');
      ipcRenderer.removeAllListeners('response-subscribe');
      ipcRenderer.removeAllListeners('response-unsubscribe');
    };
  }, []);

  const getColProps = () => {
    const screenWidth = window.innerWidth;
    let colProps;

    if (screenWidth >= 1200) {
      colProps = { span: 6 };
    } else if (screenWidth >= 992) {
      colProps = { span: 8 };
    } else if (screenWidth >= 768) {
      colProps = { span: 12 };
    } else {
      colProps = { span: 24 };
    }

    const maxCardsPerRow = 4;
    const totalCards = groupedFeeds.reduce(
      (count, group) => count + group.feeds.length,
      0
    );
    const cardsPerRow = Math.min(totalCards, maxCardsPerRow);

    colProps.span = Math.floor(24 / cardsPerRow);
    colProps.style = { maxWidth: '300px' };

    return colProps;
  };

  const handleSubscribe = (rssFeedUrl, description) => {
    const ipcRenderer = window.electron.ipcRenderer;
    setExampleFeeds((prevExampleFeeds) =>
      prevExampleFeeds.map((feed) => {
        if (feed.url === rssFeedUrl) {
          return { ...feed, subscribed: true, description };
        }
        return feed;
      })
    );
  
    // Send the IPC message to subscribe to the feed
    ipcRenderer.send('subscribe-to-feed', rssFeedUrl);
  };

  const handleUnsubscribe = (rssFeedUrl) => {
    const ipcRenderer = window.electron.ipcRenderer;
    setExampleFeeds((prevExampleFeeds) =>
      prevExampleFeeds.map((feed) => {
        if (feed.url === rssFeedUrl) {
          return { ...feed, subscribed: false };
        }
        return feed;
      })
    );
    ipcRenderer.send('unsubscribe-from-feed', rssFeedUrl);
  };

  const showModal = (title, content) => {
    setModalTitle(title);
    setModalContent(content);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  // Calculate grouped feeds
  const groupedFeeds = exampleFeeds.reduce((groups, feed) => {
    const group = groups.find((group) => group.topic === feed.topic);
    if (group) {
      group.feeds.push(feed);
    } else {
      groups.push({ topic: feed.topic, feeds: [feed] });
    }
    return groups;
  }, []);

  return (
    <div style={{ padding: '16px' }}>
      <h1>Example Feeds Page</h1>
      {groupedFeeds.map((group, groupIndex) => (
        <div key={groupIndex}>
          <Divider orientation="left">{group.topic}</Divider>
          <Row gutter={[16, 16]}>
            {group.feeds.map((feed, feedIndex) => (
              <Col key={feedIndex} {...getColProps()}>
                <FeedCard
                  image={feed.image}
                  title={feed.title}
                  author={feed.author}
                  description={feed.description}
                  rssFeedUrl={feed.url}
                  topic={feed.topic}
                  id={feed.id}
                  subscribed={feed.subscribed}
                  onSubscribe={handleSubscribe}
                  onUnsubscribe={handleUnsubscribe}
                />
              </Col>
            ))}
          </Row>
        </div>
      ))}
      <Modal
        title={modalTitle}
        open={modalVisible}
        onOk={closeModal}
        onCancel={closeModal}
        footer={null}
      >
        <p>{modalContent}</p>
      </Modal>
    </div>
  );
}

export default ExampleFeedsPage;
