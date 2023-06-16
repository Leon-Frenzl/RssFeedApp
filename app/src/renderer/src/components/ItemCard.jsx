import React, { useState, memo } from 'react';
import { Card, Modal, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { EyeOutlined, ReadOutlined, CloseOutlined } from '@ant-design/icons';

function ItemCard({ title, link, pubDate, content, description }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const navigate = useNavigate();

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const toggleDescription = () => {
    setShowDescription(!showDescription);
  };

  const getDescriptionText = () => {
    if (!description) {
      return '';
    }

    const descriptionLines = description.split('\n');
    const shouldShowFullDescription = showDescription || descriptionLines.length <= 3;

    if (shouldShowFullDescription) {
      return description;
    }

    return `${descriptionLines.slice(0, 3).join('\n')}...`;
  };

  const navigateToArticle = () => {
    navigate(`/article/${encodeURIComponent(link)}`);
  };

  return (
    <Card hoverable style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Card.Meta description={pubDate} />
      <div style={{ maxHeight: '200px', overflow: 'hidden' }}>
        <img alt="Feed" src={content} style={{ width: '100%', height: 'auto' }} />
      </div>
      <h1>{title}</h1>
      <div style={{ flex: 1 }}>
        <p
          style={{
            WebkitLineClamp: '3',
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            display: '-webkit-box',
          }}
        >
          {getDescriptionText()}
        </p>
      </div>
      <div style={{ marginTop: 'auto' }}>
        {description && description.split('\n').length > 3 && (
          <Button type="primary" onClick={toggleDescription}>
            Read More
          </Button>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" onClick={openModal}>
          <EyeOutlined /> Read More
        </Button>
      </div>
      <Modal
        title={title}
        open={modalVisible}
        onCancel={closeModal}
        footer={[
          <Button key="cancel" onClick={closeModal}>
            Close
          </Button>,
          <Button key="fullArticle" type="primary" onClick={navigateToArticle}>
            Read Full Article
          </Button>,
        ]}
      >
        <div>
          <img alt="Feed" src={content} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
          <p>{description}</p>
        </div>
      </Modal>
    </Card>
  );
}

export default memo(ItemCard);
