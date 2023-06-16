import { app, shell, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { parseRssFeeds_LastItem, parseRssFeedForItems } from './rssParser';
import NodeCach from 'node-cache';
import fs from 'fs';

let mainWindow = null; // Declare mainWindow variable outside of createWindow function
let appUsageStartTime = null;
let appUsageInterval = null;
let appUsageTime = 0;

const rssCache = new NodeCach({ stdTTL: 600 });
const rssFeedUrlsFile = join(app.getPath('userData'), 'rssFeedUrls.json');
const exampleFeedUrlsFile = join(app.getAppPath(), 'resources', 'exampleFeedUrls.json');

function loadRssFeeds(file) {
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, '[]', 'utf-8');
    }
    const data = fs.readFileSync(file, 'utf-8');
    return JSON.parse(data) || [];
  } catch (error) {
    console.error(`Error loading RssFeeds from ${file}: ${error}`);
    return [];
  }
}

function saveRssFeedUrls(file, urls) {
  try {
    fs.writeFileSync(file, JSON.stringify(urls), 'utf-8');
  } catch (error) {
    console.error(`Error saving RssFeedUrls to ${file}: ${error}`);
  }
}

function startAppUsageTimer() {
  appUsageStartTime = Date.now();
  appUsageInterval = setInterval(() => {
    appUsageTime = Math.floor((Date.now() - appUsageStartTime) / 1000);
    mainWindow.webContents.send('app-usage-time', appUsageTime); // Send the app usage time to the renderer process
  }, 1000);
}

function stopAppUsageTimer() {
  clearInterval(appUsageInterval);
  const usageTime = appUsageTime;
  appUsageStartTime = null;
  appUsageInterval = null;
  appUsageTime = 0;
  return usageTime;
}

// Load Files for rssFeedUrls and exampleFeedUrls into a JSON Array
let rssFeedUrls = loadRssFeeds(rssFeedUrlsFile);
let exampleFeedUrls = loadRssFeeds(exampleFeedUrlsFile);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron');
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('get-app-dirname', () => __dirname);

ipcMain.on('read-rssFeeds', async (event) => {
  try {
    const parsedFeeds = await parseRssFeeds_LastItem(rssFeedUrls);
    event.sender.send('response-rssFeeds', parsedFeeds);
  } catch (error) {
    event.reply('response-example-feeds', { error: error.message });
  }
});

ipcMain.on('add-rssFeed', (event, rssFeedUrl, rssFeedTopic) => {
  const newRssFeed = { id: "r" + (rssFeeds.length + 1), url: rssFeedUrl, topic: rssFeedTopic };
  const cachedFeeds = rssCache.get('feeds');
  if (cachedFeeds) {
    cachedFeeds.push(newRssFeed);
    rssCache.set('feeds', cachedFeeds);
  }

  event.reply('rssFeed-added', newRssFeed);
});

ipcMain.on('delete-rss-feed', (event, rssFeedId) => {
  rssFeedUrls = rssFeedUrls.filter((feed) => feed.id !== rssFeedId);
  event.reply('rss-feed-deleted', rssFeedId);
});

ipcMain.on('update-rss-feed', (event, updatedRssFeed) => {
  const index = rssFeedUrls.findIndex((feed) => feed.id === updatedRssFeed.id);
  if (index !== -1) {
    rssFeedUrls[index] = updatedRssFeed;
    event.reply('rss-feed-updated', updatedRssFeed);
  }
});

ipcMain.on('subscribe-to-feed', (event, rssFeedUrl, description, topic) => {
  try {
    const existingFeedIndex = exampleFeedUrls.findIndex((feed) => feed.url === rssFeedUrl);

    if (existingFeedIndex !== -1) {
      exampleFeedUrls[existingFeedIndex].subscribed = true;
      saveRssFeedUrls(exampleFeedUrlsFile, exampleFeedUrls);
    }

    const existingUserFeed = rssFeedUrls.find((feed) => feed.url === rssFeedUrl);

    if (existingUserFeed) {
      event.reply('feed-subscribed', { error: 'Feed URL already exists' });
    } else {
      const newUserFeed = {
        id: "r" + (rssFeedUrls.length + 1),
        url: rssFeedUrl,
        description: description,
        topic: topic,
        subscribed: true,
      };
      rssFeedUrls.push(newUserFeed);
      saveRssFeedUrls(rssFeedUrlsFile, rssFeedUrls);

      event.reply('feed-subscribed');
    }
  } catch (error) {
    console.error('Error subscribing to the example feed:', error);
    event.reply('feed-subscribed', { error: error.message });
  }
});

ipcMain.on('unsubscribe-from-feed', (event, rssFeedUrl, topic) => {
  try {
    const userFeedIndex = rssFeedUrls.findIndex((feed) => feed.url === rssFeedUrl);
    if (userFeedIndex !== -1) {
      rssFeedUrls.splice(userFeedIndex, 1);
      saveRssFeedUrls(rssFeedUrlsFile, rssFeedUrls);
    }

    const exampleFeedIndex = exampleFeedUrls.findIndex((feed) => feed.url === rssFeedUrl);
    if (exampleFeedIndex !== -1) {
      exampleFeedUrls[exampleFeedIndex].subscribed = false;
      saveRssFeedUrls(exampleFeedUrlsFile, exampleFeedUrls);
    }

    event.reply('feed-unsubscribed', { success: true });
  } catch (error) {
    console.error('Error unsubscribing from the feed:', error);
    event.reply('feed-unsubscribed', { success: false, error: error.message });
  }
});


ipcMain.on('read-example-feeds', async (event) => {
  try {
    const parsedFeeds = await parseRssFeeds_LastItem(exampleFeedUrls);
    event.sender.send('response-example-feeds', parsedFeeds);
  } catch (error) {
    event.reply('response-example-feeds', { error: error.message });
  }
});

function fetchRssFeeds(){
  console.log("Update not implemented, right now")
}

function updateRssFeeds() {
  fetchRssFeeds().then((feeds) => {
    rssCache.set('feeds', feeds);
  });
}

setInterval(updateRssFeeds, 60 * 60 * 1000);

ipcMain.on('render-items', async (event, id) => {
  const feed = exampleFeedUrls.find((feed) => feed.id === id);

  if (feed) {
    try {
      const items = await parseRssFeedForItems(feed.url);
      event.reply('response-render-items', items);
    } catch (error) {
      event.reply('response-render-items', { error: error.message });
    }
  } else {
    const rssFeed = rssFeedUrls.find((feed) => feed.id === id);
    if (rssFeed) {
      try {
        const items = await parseRssFeedForItems(rssFeed.url);
        event.reply('response-render-items', items);
      } catch (error) {
        event.reply('response-render-items', { error: error.message });
      }
    } else {
      event.reply('response-render-items', { error: 'Feed not found' });
    }
  }
});
ipcMain.on('start-app-usage-timer', () => {
  startAppUsageTimer();
});

ipcMain.on('stop-app-usage-timer', (event) => {
  const usageTime = stopAppUsageTimer();
  event.reply('app-usage-time', usageTime);
});

ipcMain.on('create-package', (event, createGroup) => {
  event.reply('response-create-package', 'Not Implemented');
});

ipcMain.on('subscribe-to-package', (event, packageID) => {
  event.reply('response-subscribe-package', 'Not Implemented');
});

ipcMain.on('update-package', (event) => {
  event.reply('response-update-package', 'Not Implemented');
});

ipcMain.on('delete-package', (event) => {
  event.reply('response-delete-package', 'Not Implemented');
});
