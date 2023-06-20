import React, { useState } from 'react';
import { Input, Select, Switch } from 'antd';

const { Option } = Select;

const FilterFeedComponent = ({ feeds, setFilteredFeeds }) => {
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSubscribed, setShowSubscribed] = useState(false);

  const handleTopicChange = (value) => {
    setSelectedTopic(value);
    applyFilters(value, searchTerm, showSubscribed);
  };

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    applyFilters(selectedTopic, value, showSubscribed);
  };

  const handleSubscribedChange = (checked) => {
    setShowSubscribed(checked);
    applyFilters(selectedTopic, searchTerm, checked);
  };

  const applyFilters = (topic, search, subscribed) => {
    const filtered = feeds.filter(
      (feed) =>
        (topic === 'All' || feed.topic === topic) &&
        (feed.title.toLowerCase().includes(search.toLowerCase()) ||
          feed.description.toLowerCase().includes(search.toLowerCase())) &&
        (!subscribed || feed.subscribed === subscribed)
    );
    setFilteredFeeds(filtered);
  };

  const topics = ['All', ...Array.from(new Set(feeds.map((feed) => feed.topic))).sort()];

  return (
    <div style={{ display: 'flex', width: '100%', marginBottom: '16px' }}>
      <Input
        placeholder="Search feeds"
        value={searchTerm}
        onChange={handleSearch}
        style={{ flex: 1, marginRight: '16px' }}
      />
      <Select value={selectedTopic} onChange={handleTopicChange} style={{ width: '200px', marginRight: '16px' }}>
        {topics.map((topic) => (
          <Option key={topic} value={topic}>
            {topic}
          </Option>
        ))}
      </Select>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: '8px' }}>Show Subscribed Feeds</span>
        <Switch checked={showSubscribed} onChange={handleSubscribedChange} />
      </div>
    </div>
  );
};

export default FilterFeedComponent;
