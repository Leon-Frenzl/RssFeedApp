import React, { useEffect, useState } from 'react';
import { Row, Col, Divider } from 'antd';
import FeedCard from './ExampleFeedCard';

function ExampleFeedsPage() {
  const [exampleFeeds, setExampleFeeds] = useState([]);

  useEffect(() => {
    const ipcRenderer = window.electron.ipcRenderer;

    const fetchExampleFeeds = async () => {
      ipcRenderer.send('read-example-feeds');
    };

    ipcRenderer.on('response-example-feeds', (event, parsedFeeds) => {
      if (Array.isArray(parsedFeeds)) {
        setExampleFeeds(parsedFeeds);
      } else {
        setExampleFeeds([]); // or handle the error condition appropriately
      }
    });

    fetchExampleFeeds();

    return () => {
      ipcRenderer.removeAllListeners('response-example-feeds');
    };
  }, []);

  const groupedFeeds = exampleFeeds.reduce((groups, feed) => {
    const group = groups.find((group) => group.topic === feed.topic);
    if (group) {
      group.feeds.push(feed);
    } else {
      groups.push({ topic: feed.topic, feeds: [feed] });
    }
    return groups;
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

  console.log('ExampleFeedsPage rendered');

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
                />
              </Col>
            ))}
          </Row>
        </div>
      ))}
    </div>
  );
}

export default ExampleFeedsPage;
