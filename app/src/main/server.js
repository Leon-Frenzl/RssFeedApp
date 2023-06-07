import express from 'express';
import Parser from 'rss-parser';
import fs from 'fs';
import { app } from 'electron';
import { join } from 'path';

const apiApp = express();
const parser = new Parser();
const savedFeedsPath = join(app.getPath('userData'), 'savedFeeds.json');

const saveFeedToFile = (feeds) => {
  const filePath = savedFeedsPath;
  const feedsData = JSON.stringify(feeds, null, 2);

  fs.writeFile(filePath, feedsData, 'utf8', (err) => {
    if (err) {
      console.error(`Error saving feeds to file: ${err}`);
    } else {
      console.log(`Feeds saved to file: ${filePath}`);
    }
  });
};

const loadSavedFeeds = () => {
  try {
    const feedsData = fs.readFileSync(savedFeedsPath, 'utf8');
    return JSON.parse(feedsData);
  } catch (error) {
    console.error(`Error loading saved feeds: ${error}`);
    return [];
  }
};

const saveFeed = async (feed, fileName, groupName) => {
  const savedFeeds = loadSavedFeeds();

  // Check if the feed already exists
  const existingFeed = savedFeeds.find((f) => f.fileName === fileName);
  if (existingFeed) {
    console.log(`Feed '${fileName}' already exists. Skipping...`);
    return savedFeeds;
  }

  const newFeed = {
    id: savedFeeds.length + 1,
    fileName,
    url: feed.link,
    lastItem: feed.items[feed.items.length - 1]
  };

  if (groupName) {
    const groupIndex = savedFeeds.findIndex((g) => g.name === groupName);
    if (groupIndex !== -1) {
      savedFeeds[groupIndex].feeds.push(newFeed);
    } else {
      savedFeeds.push({
        name: groupName,
        feeds: [newFeed]
      });
    }
  } else {
    savedFeeds.push({
      feeds: [newFeed]
    });
  }

  saveFeedToFile(savedFeeds);

  return savedFeeds;
};

const updateFeed = async (groupId, feedId, url, fileName) => {
  const savedFeeds = loadSavedFeeds();
  const groupIndex = savedFeeds.findIndex((g) => g.name === groupId);

  if (groupIndex !== -1) {
    const feedIndex = savedFeeds[groupIndex].feeds.findIndex((f) => f.id === feedId);
    if (feedIndex !== -1) {
      const updatedFeed = await parser.parseURL(url);
      const updatedLastItem = updatedFeed.items[updatedFeed.items.length - 1];

      if (updatedLastItem.pubDate !== savedFeeds[groupIndex].feeds[feedIndex].lastItem.pubDate) {
        savedFeeds[groupIndex].feeds[feedIndex] = {
          ...savedFeeds[groupIndex].feeds[feedIndex],
          url,
          fileName,
          lastItem: updatedLastItem
        };

        saveFeedToFile(savedFeeds);
      }
    }
  }
};

// Create a new group
apiApp.post('/api/groups', (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Missing required parameter: name' });
      return;
    }

    const savedFeeds = loadSavedFeeds();
    const existingGroup = savedFeeds.find((g) => g.name === name);
    if (existingGroup) {
      res.status(409).json({ error: 'Group already exists' });
      return;
    }

    savedFeeds.push({ name, feeds: [] });
    saveFeedToFile(savedFeeds);
    res.json(savedFeeds);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// Read all groups
apiApp.get('/api/groups', (_, res) => {
  const savedFeeds = loadSavedFeeds();
  const groups = savedFeeds.map((g) => g.name);
  res.json(groups);
});

// Read a specific group by group name
apiApp.get('/api/groups/:groupName', (req, res) => {
  const savedFeeds = loadSavedFeeds();
  const groupName = req.params.groupName;

  const group = savedFeeds.find((g) => g.name === groupName);
  if (group) {
    res.json(group);
  } else {
    res.status(404).json({ error: 'Group not found' });
  }
});

// Update a specific group by group name
apiApp.put('/api/groups/:groupName', (req, res) => {
  try {
    const { newName } = req.body;
    if (!newName) {
      res.status(400).json({ error: 'Missing required parameter: newName' });
      return;
    }

    const groupName = req.params.groupName;
    const savedFeeds = loadSavedFeeds();
    const groupIndex = savedFeeds.findIndex((g) => g.name === groupName);

    if (groupIndex !== -1) {
      savedFeeds[groupIndex].name = newName;
      saveFeedToFile(savedFeeds);
      res.json(savedFeeds);
    } else {
      res.status(404).json({ error: 'Group not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update group' });
  }
});

// Delete a specific group by group name
apiApp.delete('/api/groups/:groupName', (req, res) => {
  const groupName = req.params.groupName;
  const savedFeeds = loadSavedFeeds();
  const groupIndex = savedFeeds.findIndex((g) => g.name === groupName);

  if (groupIndex !== -1) {
    savedFeeds.splice(groupIndex, 1);
    saveFeedToFile(savedFeeds);
    res.json(savedFeeds);
  } else {
    res.status(404).json({ error: 'Group not found' });
  }
});

// Create a new feed
apiApp.post('/api/feeds', async (req, res) => {
  try {
    const { url, fileName, groupName } = req.body;
    if (!url || !fileName) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }

    const feed = await parser.parseURL(url);
    const savedFeeds = await saveFeed(feed, fileName, groupName);
    res.json(savedFeeds);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create feed' });
  }
});

// Read all feeds
apiApp.get('/api/feeds', (_, res) => {
  const savedFeeds = loadSavedFeeds();
  res.json(savedFeeds);
});

// Read a specific feed by feed ID
apiApp.get('/api/feeds/:feedId', (req, res) => {
  const savedFeeds = loadSavedFeeds();
  const feedId = parseInt(req.params.feedId);

  for (const group of savedFeeds) {
    const feed = group.feeds.find((f) => f.id === feedId);
    if (feed) {
      res.json(feed);
      return;
    }
  }

  res.status(404).json({ error: 'Feed not found' });
});

// Update a specific feed by feed ID
apiApp.put('/api/feeds/:feedId', async (req, res) => {
  try {
    const feedId = parseInt(req.params.feedId);
    const { url, fileName, groupName } = req.body;
    if (!url || !fileName) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }

    await updateFeed(groupName, feedId, url, fileName);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update feed' });
  }
});

// Delete a specific feed by feed ID
apiApp.delete('/api/feeds/:feedId', (req, res) => {
  const feedId = parseInt(req.params.feedId);
  const savedFeeds = loadSavedFeeds();

  for (const group of savedFeeds) {
    const feedIndex = group.feeds.findIndex((f) => f.id === feedId);
    if (feedIndex !== -1) {
      group.feeds.splice(feedIndex, 1);
      saveFeedToFile(savedFeeds);
      res.json(savedFeeds);
      return;
    }
  }

  res.status(404).json({ error: 'Feed not found' });
});

// Check if a specific feed has been updated
apiApp.get('/api/feeds/:groupId/:feedId/updated', async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const feedId = parseInt(req.params.feedId);
    const url = req.query.url;

    const savedFeeds = loadSavedFeeds();
    const group = savedFeeds.find((g) => g.name === groupId);

    if (group) {
      const feed = group.feeds.find((f) => f.id === feedId);
      if (feed) {
        const updatedFeed = await parser.parseURL(url);
        const updatedLastItem = updatedFeed.items[updatedFeed.items.length - 1];

        if (updatedLastItem.pubDate !== feed.lastItem.pubDate) {
          feed.lastItem = updatedLastItem;
          saveFeedToFile(savedFeeds);
          res.json({ updated: true });
        } else {
          res.json({ updated: false });
        }
        return;
      }
    }

    res.status(404).json({ error: 'Feed not found' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check feed update' });
  }
});

const apiServer = apiApp.listen(3000, () => {
  console.log('API server running on port 3000');
});

export default apiServer;
