import React, { useState } from 'react';
import { Row, Col, Divider, Button, Card, Input, message } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons';

// Example feed data
const feeds = [
  {
    id: 'feed1',
    title: 'Feed 1',
    author: 'Author 1',
    topic: 'Technology',
    length: 10,
    image: 'https://picsum.photos/400/400',
    description: 'This is a sample feed description.',
  },
  {
    id: 'feed2',
    title: 'Feed 2',
    author: 'Author 2',
    topic: 'Finance',
    length: 5,
    image: 'https://picsum.photos/400/400',
    description: 'This is another sample feed description.',
  },
  // Add more feed data as needed
];

function PackagePage() {
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedFeeds, setSelectedFeeds] = useState([]);
  const [editingPackageName, setEditingPackageName] = useState(false);
  const [newPackageName, setNewPackageName] = useState('');

  // Handle creating a new package
  const handleCreatePackage = () => {
    const newPackage = {
      id: `package${packages.length + 1}`,
      name: `Package ${packages.length + 1}`,
      feeds: [],
    };
    setPackages([...packages, newPackage]);
    setSelectedPackage(newPackage);
    setSelectedFeeds([]);
  };

  // Handle deleting a package
  const handleDeletePackage = () => {
    setPackages(packages.filter((pkg) => pkg !== selectedPackage));
    setSelectedPackage(null);
    setSelectedFeeds([]);
  };

  // Handle adding feeds to the selected package
  const handleAddFeeds = () => {
    const feedIds = selectedPackage.feeds.map((feed) => feed.id);
    const uniqueFeeds = selectedFeeds.filter((feed) => !feedIds.includes(feed.id));

    if (uniqueFeeds.length === 0) {
      message.info('Feeds already exist in the package.');
      return;
    }

    const updatedPackage = {
      ...selectedPackage,
      feeds: [...selectedPackage.feeds, ...uniqueFeeds],
    };
    setPackages(packages.map((pkg) => (pkg === selectedPackage ? updatedPackage : pkg)));
    setSelectedFeeds([]);
    setSelectedPackage(updatedPackage); // Update selectedPackage to reflect the added feeds
  };

  // Handle removing a feed from the selected package
  const handleRemoveFeed = (feedId) => {
    const updatedPackage = {
      ...selectedPackage,
      feeds: selectedPackage.feeds.filter((feed) => feed.id !== feedId),
    };
    const updatedPackages = packages.map((pkg) => {
      if (pkg.id === selectedPackage.id) {
        return updatedPackage;
      }
      return pkg;
    });
    setPackages(updatedPackages);
    setSelectedPackage(updatedPackage);
  };

  // Handle editing the package name
  const handleEditPackageName = () => {
    setNewPackageName(selectedPackage.name);
    setEditingPackageName(true);
  };

  // Handle saving the edited package name
  const handleSavePackageName = () => {
    const updatedPackage = { ...selectedPackage, name: newPackageName };
    setPackages(packages.map((pkg) => (pkg === selectedPackage ? updatedPackage : pkg)));
    setSelectedPackage(updatedPackage);
    setEditingPackageName(false);
  };

  // Handle selecting a package
  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    setSelectedFeeds([]);
    setEditingPackageName(false);
  };

  // Handle selecting/unselecting a feed
  const handleToggleFeedSelection = (feedId) => {
    setSelectedFeeds((prevSelectedFeeds) => {
      const isFeedSelected = prevSelectedFeeds.some((feed) => feed.id === feedId);
      if (!isFeedSelected) {
        // Feed is not selected, add it to the selected feeds
        const feedToAdd = feeds.find((feed) => feed.id === feedId);
        return [...prevSelectedFeeds, feedToAdd];
      } else {
        // Feed is already selected, remove it from the selected feeds
        return prevSelectedFeeds.filter((feed) => feed.id !== feedId);
      }
    });
  };

  // Handle subscribing to a package
  const handleSubscribePackage = (pkg) => {
    console.log(`Subscribed to package: ${pkg.name}`);
    // You can perform further actions here, such as API calls or dispatching events.
  };

  return (
    <div style={{ padding: '16px' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card title="Create Package" style={{ height: '100%' }}>
            {/* Create Package UI */}
            <Button type="primary" onClick={handleCreatePackage} style={{ marginBottom: '16px' }}>
              <PlusOutlined /> Create New Package
            </Button>
            {selectedPackage && (
              <>
                <Divider />
                {editingPackageName ? (
                  <>
                    <Input value={newPackageName} onChange={(e) => setNewPackageName(e.target.value)} style={{ marginBottom: '8px' }} />
                    <Button type="primary" onClick={handleSavePackageName}>
                      <CheckOutlined /> Save Name
                    </Button>
                  </>
                ) : (
                  <>
                    <h3>{selectedPackage.name}</h3>
                    <Button onClick={handleEditPackageName}>
                      <EditOutlined /> Edit Name
                    </Button>
                    <Button danger onClick={handleDeletePackage} style={{ marginLeft: '8px' }}>
                      <DeleteOutlined /> Delete Package
                    </Button>
                  </>
                )}
                {selectedPackage.feeds.length > 0 && (
                  <>
                    <Divider />
                    <h3>Feeds</h3>
                    {selectedPackage.feeds.map((feed) => (
                      <div key={feed.id}>
                        <h4>{feed.title}</h4>
                        <Button danger onClick={() => handleRemoveFeed(feed.id)} style={{ marginLeft: '8px' }}>
                          <DeleteOutlined /> Remove
                        </Button>
                      </div>
                    ))}
                  </>
                )}
                {feeds.length > 0 && (
                  <>
                    <Divider />
                    <h3>Add Feeds</h3>
                    {feeds.map((feed) => (
                      <div key={feed.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <h4>{feed.title}</h4>
                        <Button
                          onClick={() => handleToggleFeedSelection(feed.id)}
                          style={{
                            background: selectedFeeds.some((f) => f.id === feed.id) ? 'green' : 'white',
                            marginLeft: '8px',
                          }}
                        >
                          {selectedFeeds.some((f) => f.id === feed.id) ? (
                            <>
                              <CheckOutlined /> Selected
                            </>
                          ) : (
                            'Add'
                          )}
                        </Button>
                      </div>
                    ))}
                    <Button type="primary" onClick={handleAddFeeds} style={{ marginTop: '8px' }}>
                      <PlusOutlined /> Add Selected Feeds
                    </Button>
                  </>
                )}
              </>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} md={16}>
          <Row gutter={[16, 16]}>
            {packages.map((pkg) => (
              <Col key={pkg.id} xs={24} sm={12} md={8}>
                <Card
                  hoverable
                  title={pkg.name}
                  onClick={() => handleSelectPackage(pkg)}
                  style={{ height: '100%' }}
                  extra={
                    <Button type="primary" onClick={() => handleSubscribePackage(pkg)}>
                      <PlusOutlined /> Subscribe
                    </Button>
                  }
                >
                  {pkg.feeds.length > 0 ? (
                    pkg.feeds.map((feed) => (
                      <div key={feed.id}>
                        <h4>{feed.title}</h4>
                      </div>
                    ))
                  ) : (
                    <p>No feeds in this package.</p>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </div>
  );
}

export default PackagePage;
