import React, { useState } from 'react';
import { Card, Button } from 'antd';

function ExampleFeedCard({ image, title, author, description, rssFeedUrl}) {
  const [expanded, setExpanded] = useState(false);
  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const getDescriptionText = () => {
    if (!description) {
      return '';
    }

    if (expanded) {
      return description;
    }

    if (description.length > 100) {
      return `${description.slice(0, 100)}...`;
    }

    return description;
  };

  const handleSubscribe = () => {
    const ipcRenderer = window.electron.ipcRenderer;
    ipcRenderer.send('subscribe-to-example-feed', rssFeedUrl)
    console.log('feed-subscribed: ' + rssFeedUrl)
  };

  return (
    <Card hoverable cover={<img alt="Feed" src={image} />} style={{ height: '100%' }}>
      <Card.Meta title={title} description={author} />
      <p>{getDescriptionText()}</p>
      {description && description.length > 100 && (
        <Button type="link" onClick={toggleExpand}>
          {expanded ? 'Read Less' : 'Read More'}
        </Button>
      )}
      <Button type="primary" onClick={handleSubscribe}>
        Subscribe
      </Button>
    </Card>
  );
}

export default ExampleFeedCard;
