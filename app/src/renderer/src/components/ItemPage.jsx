import React, { useEffect, useState } from 'react';
import { Row, Col, Modal, Button } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import ItemCard from './ItemCard';

function ItemPage() {
  const { id } = useParams();
  const [feedItems, setFeedItems] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const ipcRenderer = window.electron.ipcRenderer;

    const fetchFeedItems = async () => {
      ipcRenderer.send('render-items', id);
    };

    ipcRenderer.on('response-render-items', (event, items) => {
      if (items.error) {
        showModal('Error', items.error);
      } else {
        console.log(items);
        setFeedItems(items);
      }
    });

    fetchFeedItems();

    return () => {
      ipcRenderer.removeAllListeners('response-render-items');
      ipcRenderer.removeAllListeners('response-subscribe');
      ipcRenderer.removeAllListeners('response-unsubscribe');
    };
  }, [id]);

  const showModal = (title, content) => {
    setModalTitle(title);
    setModalContent(content);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const renderFeedItems = () => {
    if (Array.isArray(feedItems) && feedItems.length > 0) {
      const itemsPerRow = 4;
      const rows = Math.ceil(feedItems.length / itemsPerRow);
  
      const itemRows = [];
  
      for (let i = 0; i < rows; i++) {
        const start = i * itemsPerRow;
        const end = start + itemsPerRow;
        const rowItems = feedItems.slice(start, end);
  
        const itemRow = (
          <Row gutter={[16, 16]} key={i} justify="space-between" style={{ flexWrap: 'wrap' }}>
            {rowItems.map((feed, index) => {
              const isLastRow = i === rows - 1;
              const columnSpan = isLastRow && feedItems.length % itemsPerRow !== 0 ? 24 / (feedItems.length % itemsPerRow) : 24 / itemsPerRow;
  
              return (
                <Col key={index} span={columnSpan} style={{ marginBottom: '20px' }}>
                  <ItemCard
                    id={feed.id}
                    title={feed.itemTitle}
                    link={feed.link}
                    pubDate={feed.pubDate}
                    content={feed.images[0]}
                    description={feed.contentSnippet}
                    videos={feed.videos}
                  />
                </Col>
              );
            })}
          </Row>
        );
  
        itemRows.push(itemRow);
      }
  
      return itemRows;
    } else {
      return <p>No items found.</p>;
    }
  };

  const navigateBack = () => {
    navigate(-1);
  };

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <Button type="primary" onClick={navigateBack}>
          <ArrowLeftOutlined /> Back
        </Button>
        <h1 style={{ margin: '0 16px' }}>{feedItems.length > 0 ? feedItems[0].title : ''}</h1>
      </div>
      {renderFeedItems()}
      <Modal
        title={modalTitle}
        open={modalVisible}
        onCancel={closeModal}
        footer={[
          <Button key="close" onClick={closeModal}>
            Close
          </Button>,
        ]}
      >
        {modalContent && <p>{modalContent}</p>}
      </Modal>
    </div>
  );
}

export default ItemPage;
