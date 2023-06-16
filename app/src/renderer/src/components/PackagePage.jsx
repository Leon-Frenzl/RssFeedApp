import React, { useState, useEffect } from 'react';
import { Row, Col, Divider, Button, Card, Input, message, List } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import './css/PackagePage.css';

function PackagePage() {
  const [packages, setPackages] = useState([]);
  const [feeds, setFeeds] = useState([]);
  const [newPackageName, setNewPackageName] = useState('');
  const [selectedFeeds, setSelectedFeeds] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const ipcRenderer = window.electron.ipcRenderer;

  const fetchFeeds = async () => {
    ipcRenderer.send('read-example-feeds');
  };

  const fetchPackages = async () => {
    ipcRenderer.send('read-packages');
  };

  useEffect(() => {
    const ipcRenderer = window.electron.ipcRenderer;
  
    const fetchFeeds = async () => {
      ipcRenderer.send('read-example-feeds');
    };
  
    const fetchPackages = async () => {
      ipcRenderer.send('read-packages');
    };
  
    const fetchFeedsWithDelay = () => {
      setTimeout(fetchFeeds, 10000); // Delay of 1 second
    };
  
    const fetchPackagesWithDelay = () => {
      setTimeout(fetchPackages, 10000); // Delay of 1 second
    };
  
    ipcRenderer.on('response-read-packages', (event, loadedPackages) => {
      if (Array.isArray(loadedPackages)) {
        setPackages([...loadedPackages]);
      } else {
        setPackages([]);
      }
    });
  
    ipcRenderer.on('response-example-feeds', (event, parsedFeeds) => {
      if (Array.isArray(parsedFeeds)) {
        setFeeds(parsedFeeds);
      } else {
        setFeeds([]);
      }
    });
  
    ipcRenderer.on('response-add-feeds-to-package', (event, packageId, updatedFeeds) => {
      const updatedPackages = packages.map((pkg) => {
        if (pkg.id === packageId) {
          return { ...pkg, feeds: updatedFeeds };
        }
        return pkg;
      });
      setPackages(updatedPackages);
    });
  
    ipcRenderer.on('response-remove-feed-from-package', (event, packageId, updatedFeeds) => {
      const updatedPackages = packages.map((pkg) => {
        if (pkg.id === packageId) {
          return { ...pkg, feeds: updatedFeeds };
        }
        return pkg;
      });
      setPackages(updatedPackages);
    });
  
    fetchFeedsWithDelay();
    fetchPackagesWithDelay();
  
    return () => {
      ipcRenderer.removeAllListeners('response-read-packages');
      ipcRenderer.removeAllListeners('response-example-feeds');
      ipcRenderer.removeAllListeners('response-package-feeds');
      ipcRenderer.removeAllListeners('response-add-feeds-to-package');
      ipcRenderer.removeAllListeners('response-remove-feed-from-package');
    };
  }, []);

  // Handle creating a new package
  const handleCreatePackage = () => {
    if (newPackageName.trim() === '') {
      message.error('Please enter a package name.');
      return;
    }

    const existingIds = packages.map((pkg) => pkg.id);
    const maxId = existingIds.length === 0 ? 0 : Math.max(...existingIds);

    const newPackage = {
      id: maxId + 1,
      name: newPackageName.trim(),
      feeds: [],
      subscribed: false,
    };

    ipcRenderer.send('create-package', newPackage);

    ipcRenderer.once('response-create-package', (event, createdPackage) => {
      setPackages([...packages, createdPackage]);
    });

    setNewPackageName('');
  };

  // Handle deleting a package
  const handleDeletePackage = (pkgID) => {
    const updatedPackages = packages.filter((pkg) => pkg.id !== pkgID);
    setPackages([...updatedPackages]);

    ipcRenderer.send('delete-package', pkgID);
  };

  // Handle adding feeds to the selected package
  const handleAddFeeds = (feeds) => {
    if (selectedPackage) {
      const updatedPackage = { ...selectedPackage, feeds };
      ipcRenderer.send('add-feeds-to-package', selectedPackage.id, feeds);
      setSelectedPackage(updatedPackage);
    }
  };

  // Handle removing a feed from the selected package
  const handleRemoveFeed = (packageId, feedId) => {
    ipcRenderer.send('remove-feed-from-package', packageId, feedId);
  };

  // Handle editing the package name
  const handleEditPackageName = (pkgId) => {
    const updatedPackages = packages.map((pkg) => {
      if (pkg.id === pkgId) {
        return { ...pkg, editing: true };
      }
      return pkg;
    });
    setPackages(updatedPackages);
  };

  // Handle saving the edited package name
  const handleSavePackageName = (pkgId, newName) => {
    const updatedPackages = packages.map((pkg) => {
      if (pkg.id === pkgId) {
        return { ...pkg, editing: false, name: newName };
      }
      return pkg;
    });
    setPackages(updatedPackages);

    ipcRenderer.send('update-package-name', pkgId, newName);
  };

  // Handle selecting a package
  const handleSelectPackage = (pkg) => {
    if (selectedPackage && selectedPackage.id === pkg.id) {
      setSelectedPackage(null); // Unselect the package if it's already selected
    } else {
      setSelectedPackage(pkg); // Select the package if it's not selected
    }
  };

  // Handle selecting/unselecting a feed
  const handleToggleFeedSelection = (feedId) => {
    if (selectedFeeds.includes(feedId)) {
      // Feed is already selected, so remove it
      const updatedFeeds = selectedFeeds.filter((id) => id !== feedId);
      setSelectedFeeds(updatedFeeds);
    } else {
      // Feed is not selected, so add it
      setSelectedFeeds([...selectedFeeds, feedId]);
    }
  };

  // Handle subscribing to a package
  const handleSubscribePackage = (pkg) => { };

  // Render the package feeds
  const renderPackageFeeds = (packageId) => {
    const pkg = packages.find((pkg) => pkg.id === packageId);

    if (pkg) {
      return (
        <List
          dataSource={pkg.feeds}
          renderItem={(feed) => {
            const { id, description } = feed;
            return (
              <List.Item
                key={id}
                actions={[
                  <Button
                    type="primary"
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveFeed(packageId, id)}
                  >
                    Remove
                  </Button>,
                ]}
              >
                <List.Item.Meta title={description} />
              </List.Item>
            );
          }}
        />
      );
    }

    return null;
  };

  return (
    <div style={{ padding: '16px' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
          <h2>Create New Package</h2>
          <Input
            placeholder="Enter package name"
            value={newPackageName}
            onChange={(e) => setNewPackageName(e.target.value)}
            style={{ marginBottom: '16px' }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreatePackage}>
            Create
          </Button>
          <Divider />
          <h2>Available Feeds</h2>
          <List
            dataSource={feeds}
            renderItem={(feed) => (
              <List.Item
                key={feed.id}
                actions={[
                  <Button
                    type={selectedFeeds.includes(feed.id) ? 'default' : 'primary'}
                    icon={<PlusOutlined />}
                    onClick={() => handleToggleFeedSelection(feed.id)}
                  >
                    {selectedFeeds.includes(feed.id) ? 'Deselect Feed' : 'Select Feed'}
                  </Button>,
                ]}
              >
                <List.Item.Meta title={feed.description} />
              </List.Item>
            )}
          />
          <Button type="primary" onClick={() => handleAddFeeds(selectedFeeds)}>
            <PlusOutlined /> Add Feeds
          </Button>
        </Col>

        <Col xs={24} sm={12} md={16} lg={16} xl={16}s>
          <h2>Packages</h2>
          <Row gutter={[16, 16]}>
            {packages.map((pkg) => (
              <Col xs={24} sm={12} md={8} lg={8} xl={8} key={pkg.id}>
                <Card
                  title={
                    pkg.editing ? (
                      <Input
                        defaultValue={pkg.name}
                        onPressEnter={(e) => handleSavePackageName(pkg.id, e.target.value)}
                        onBlur={(e) => handleSavePackageName(pkg.id, e.target.value)}
                        autoFocus
                        suffix={<CheckOutlined />}
                        style={{ marginBottom: '8px' }}
                      />
                    ) : (
                      <div>
                        <span style={{ float: 'right' }}>
                          <EditOutlined onClick={() => handleEditPackageName(pkg.id)} />
                          <DeleteOutlined onClick={() => handleDeletePackage(pkg.id)} />
                        </span>
                        <span>{pkg.name}</span>
                      </div>
                    )
                  }
                  onClick={() => handleSelectPackage(pkg)}
                  className={selectedPackage && selectedPackage.id === pkg.id ? 'selected-package' : ''}
                >
                  {renderPackageFeeds(pkg.id)}
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
