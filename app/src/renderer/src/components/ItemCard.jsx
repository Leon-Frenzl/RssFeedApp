import React, { useState, useRef, useEffect, memo } from 'react';
import { Card, Modal, Button, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { EyeOutlined } from '@ant-design/icons';

function ItemCard({ id, title, link, pubDate, content, description, videos }) {
  const [modalVisible, setModalVisible] = useState(false);
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const navigateToArticle = () => {
    window.open(link, '_blank');
  };

  useEffect(() => {
    if (!modalVisible && videoRef.current) {
      // Pause the video when the modal is closed
      videoRef.current.pause();
    }
  }, [modalVisible]);

  const hasVideo = videos && videos.length > 0;

  const cardContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    marginBottom: '20px',
  };

  const cardHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  };

  const cardImageContainerStyle = {
    height: '200px',
    width: '100%',
    position: 'relative',
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  };

  const cardImageStyle = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundImage: `url(${content})`,
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  const cardTitleStyle = {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginBottom: '10px',
  };

  const cardDescriptionStyle = {
    WebkitLineClamp: '3',
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    display: '-webkit-box',
    marginBottom: '10px',
  };

  const cardButtonContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginTop: 'auto',
  };

  const modalContentStyle = {
    textAlign: 'left',
  };

  return (
    <Card hoverable style={cardContainerStyle}>
      <div style={cardHeaderStyle}>
        <Card.Meta description={pubDate} />
        {hasVideo && <Tag color="blue">Video</Tag>}
      </div>
      <div style={cardImageContainerStyle}>
        <div style={cardImageStyle} />
      </div>
      <h1 style={cardTitleStyle}>{title}</h1>
      <div style={{ flex: '1 0 auto' }}>
        <p style={cardDescriptionStyle}>{description}</p>
      </div>
      <div style={cardButtonContainerStyle}>
        {description && (
          <Button type="primary" onClick={openModal} style={{ flex: '1' }}>
            <EyeOutlined /> Read More
          </Button>
        )}
      </div>
      <Modal
        title={title}
        visible={modalVisible}
        onCancel={closeModal}
        footer={[
          <Button key="cancel" onClick={closeModal}>
            Close
          </Button>,
          <Button key="fullArticle" type="primary" onClick={navigateToArticle}>
            Read Full Article
          </Button>,
        ]}
        bodyStyle={modalContentStyle}
      >
        <div>
          {hasVideo && (
            <video ref={videoRef} src={videos[0]} style={{ width: '100%' }} controls />
          )}
          <p>{description}</p>
        </div>
      </Modal>
    </Card>
  );
}

export default memo(ItemCard);
