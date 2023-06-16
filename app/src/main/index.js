import { app, shell, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { parseRssFeeds_LastItem, parseRssFeedForItems } from './rssParser';
import NodeCach from 'node-cache';
import fs from 'fs';

let mainWindow = null;
let appUsageStartTime = null;
let appUsageInterval = null;
let appUsageTime = 0;

const rssCache = new NodeCach({ stdTTL: 600 });
const rssFeedUrlsFile = join(app.getPath('userData'), 'rssFeedUrls.json');
const exampleFeedUrlsFile = join(app.getAppPath(), 'resources', 'exampleFeedUrls.json');
const packagesFile = join(app.getPath('userData'), 'packages.json');

function loadFile(file) {
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, '[]', 'utf-8');
    }
    const data = fs.readFileSync(file, 'utf-8');
    return JSON.parse(data) || [];
  } catch (error) {
    console.error(`Error loading File from ${file}: ${error}`);
    return [];
  }
}

function savePackages(file, packages) {
  try {
    fs.writeFileSync(file, JSON.stringify(packages), 'utf-8')
  } catch (error) {
    console.error(`Error saving Packages to ${file}: ${error}`)
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
    mainWindow.webContents.send('app-usage-time', appUsageTime);
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
let rssFeedUrls = loadFile(rssFeedUrlsFile);
let exampleFeedUrls = loadFile(exampleFeedUrlsFile);
let packages = loadFile(packagesFile);

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
    event.reply('response-rssFeeds', { error: error.message });
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

function fetchRssFeeds() {
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

ipcMain.on('subscribe-to-package', (event, packageID) => {
  const packageIndex = packages.findIndex((pkg) => pkg.id === packageID);
  if (packageIndex !== -1) {
    const pkg = packages[packageIndex];
    const packageFeeds = pkg.feeds;

    for (const feed of packageFeeds) {
      const existingFeedIndex = exampleFeedUrls.findIndex((f) => f.url === feed.url);

      if (existingFeedIndex !== -1) {
        exampleFeedUrls[existingFeedIndex].subscribed = true;
        saveRssFeedUrls(exampleFeedUrlsFile, exampleFeedUrls);
      }

      const existingUserFeed = rssFeedUrls.find((f) => f.url === feed.url);

      if (!existingUserFeed) {
        const newUserFeed = {
          id: "r" + (rssFeedUrls.length + 1),
          url: feed.url,
          description: feed.description,
          topic: feed.topic,
          subscribed: true,
        };
        rssFeedUrls.push(newUserFeed);
        saveRssFeedUrls(rssFeedUrlsFile, rssFeedUrls);
      }
    }

    const updatedPackage = { ...pkg, subscribed: true };
    packages[packageIndex] = updatedPackage;
    savePackages(packagesFile, packages);

    event.reply('response-subscribe-package', updatedPackage);
  } else {
    event.reply('response-subscribe-package', { error: 'Package not found' });
  }
});

ipcMain.on('unsubscribe-from-package', (event, packageID) => {
  const packageIndex = packages.findIndex((pkg) => pkg.id === packageID);
  if (packageIndex !== -1) {
    const pkg = packages[packageIndex];
    const packageFeeds = pkg.feeds;

    for (const feed of packageFeeds) {
      const existingFeedIndex = exampleFeedUrls.findIndex((f) => f.url === feed.url);

      if (existingFeedIndex !== -1) {
        exampleFeedUrls[existingFeedIndex].subscribed = false;
        saveRssFeedUrls(exampleFeedUrlsFile, exampleFeedUrls);
      }

      const existingUserFeedIndex = rssFeedUrls.findIndex((f) => f.url === feed.url);

      if (existingUserFeedIndex !== -1) {
        rssFeedUrls.splice(existingUserFeedIndex, 1);
        saveRssFeedUrls(rssFeedUrlsFile, rssFeedUrls);
      }
    }

    const updatedPackage = { ...pkg, subscribed: false };
    packages[packageIndex] = updatedPackage;
    savePackages(packagesFile, packages);

    event.reply('response-unsubscribe-package', updatedPackage);
  } else {
    event.reply('response-unsubscribe-package', { error: 'Package not found' });
  }
});


ipcMain.on('update-package', (event, packageID) => {
});

ipcMain.on('delete-package', (event, id) => {
  const packageIndex = packages.findIndex((pkg) => pkg.id === id);
  if (packageIndex !== -1) {
    const deletedPackage = packages[packageIndex];
    packages.splice(packageIndex, 1);
    savePackages(packagesFile, packages);
    event.reply('response-delete-package', deletedPackage);
  } else {
    event.reply('response-delete-package', { error: 'Package not found' });
  }
});

ipcMain.on('read-packages', async (event) => {
  try {
    event.sender.send('response-read-packages', packages);
  } catch (error) {
    event.reply('response-read-packages', { error: error.message });
  }
});

ipcMain.on('add-feeds-to-package', (event, id, feedIds) => {
  const packageIndex = packages.findIndex((pkg) => pkg.id === id);
  if (packageIndex !== -1) {
    const packageFeeds = packages[packageIndex].feeds;

    for (const feedId of feedIds) {
      const feed = exampleFeedUrls.find((feed) => feed.id === feedId);
      if (feed && !packageFeeds.some((pkgFeed) => pkgFeed.id === feed.id)) {
        packageFeeds.push(feed);
      }
    }

    savePackages(packagesFile, packages);
    event.reply('response-add-feeds-to-package', id, packageFeeds);
  }
});

ipcMain.on('remove-feed-from-package', (event, id, feedId) => {
  const packageIndex = packages.findIndex((pkg) => pkg.id === id);
  if (packageIndex !== -1) {
    const packageFeeds = packages[packageIndex].feeds;
    const feedIndex = packageFeeds.findIndex((feed) => feed.id === feedId);
    if (feedIndex !== -1) {
      packageFeeds.splice(feedIndex, 1);
    }
    savePackages(packagesFile, packages);
    event.reply('response-remove-feed-from-package', id, packageFeeds);
  }
});



ipcMain.on('create-package', (event, newPackage) => {
  packages.push(newPackage);
  savePackages(packagesFile, packages);
  event.reply('response-create-package', newPackage);
});