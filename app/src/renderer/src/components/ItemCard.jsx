import React, { useState } from 'react';
import { Card, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

function ItemCard({ title, link, pubDate, content, description }) {
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

    if (description.length > 80) {
      return `${description.slice(0, 80)}...`;
    }

    return description;
  };

  const navigateToArticle = () => {
    navigate(`/article/${encodeURIComponent(link)}`);
  };

  return (
    <Card hoverable style={{ height: '100%' }}>
      <Card.Meta title={title} description={pubDate} />
      <div
        style={{
          maxHeight: expanded ? 'none' : '200px', // Adjust the max height as per your requirements
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: expanded ? 'unset' : 3, // Set the number of lines to display before truncation
          WebkitBoxOrient: 'vertical',
        }}
      >
        <img alt="Feed" src={content} style={{ width: '100%', height: 'auto' }} />
        <p>{getDescriptionText()}</p>
      </div>
      {description && description.length > 80 && (
        <Button type="link" onClick={toggleExpand}>
          {expanded ? 'Read Less' : 'Read More'}
        </Button>
      )}
      <div style={{ marginTop: 'auto' }}>
        <Button type="primary" onClick={navigateToArticle}>
          Read Full Article
        </Button>
      </div>
    </Card>
  );
}

export default ItemCard;
