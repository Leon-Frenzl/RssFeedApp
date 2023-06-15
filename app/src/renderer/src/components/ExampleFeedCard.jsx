import React, { useState } from 'react';
import { Card, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import ItemPage from './ItemPage';

function ExampleFeedCard({
  id,
  image,
  title,
  author,
  description,
  rssFeedUrl,
  topic,
  subscribed,
  onSubscribe,
  onUnsubscribe,
}) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

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
    if (subscribed) {
      onUnsubscribe(rssFeedUrl);
    } else {
      onSubscribe(rssFeedUrl);
    }
  };

  const rerouteToItemPage = () => {
    navigate(`/items/${id}`);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
        <Button type="primary" onClick={rerouteToItemPage}>
          View Feed
        </Button>
        {subscribed ? (
          <Button type="primary" onClick={handleSubscribe}>
            Unsubscribe
          </Button>
        ) : (
          <Button type="primary" onClick={handleSubscribe}>
            Subscribe
          </Button>
        )}
      </div>
    </Card>
  );
}

export default ExampleFeedCard;
