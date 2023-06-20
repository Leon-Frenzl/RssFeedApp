import React, { useState } from 'react';
import { Card, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { EyeOutlined, CheckOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';

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
    onSubscribe(rssFeedUrl, description, topic);
  };

  const handleUnsubscribe = () => {
    onUnsubscribe(rssFeedUrl);
  };

  const rerouteToItemPage = () => {
    navigate(`/items/${id}`);
  };

  return (
    <Card hoverable style={{ height: '400px' }}>
      <div
        style={{
          height: '200px',
          width: '100%',
          position: 'relative',
          backgroundColor: '#f5f5f5',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundImage: `url(${image})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
      </div>
      <Card.Meta title={title} description={author} />
      <p style={{ fontSize: '14px' }}>{getDescriptionText()}</p>
      {description && description.length > 100 && (
        <Button type="link" onClick={toggleExpand}>
          {expanded ? 'Read Less' : 'Read More'}
        </Button>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', marginBottom: 0 }}>
        <div>
          <Button type="primary" onClick={rerouteToItemPage} style={{ fontSize: '12px' }}>
            <EyeOutlined /> View Feed
          </Button>
        </div>
        <div>
          <Button type="primary" onClick={subscribed ? handleUnsubscribe : handleSubscribe} style={{ fontSize: '12px' }}>
            {subscribed ? <MinusOutlined /> : <PlusOutlined />} {subscribed ? 'Unsubscribe' : 'Subscribe'}
          </Button>
        </div>
      </div>

      {/* Responsive Styles */}
      <style>
        {`
          @media only screen and (max-width: 768px) {
            p {
              font-size: 12px;
            }

            .ant-btn {
              font-size: 10px;
            }
          }
        
          @media only screen and (max-width: 480px) {
            p {
              font-size: 10px;
            }

            .ant-btn {
              font-size: 8px;
            }
          }
        `}
      </style>
    </Card>
  );
}

export default ExampleFeedCard;
