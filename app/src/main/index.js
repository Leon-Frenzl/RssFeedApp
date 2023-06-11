import { app, shell, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import Parser from 'rss-parser';
import NodeCach from 'node-cache';
import fs from 'fs';

const rssCache = new NodeCach({stdTTL: 600});
const rssFeedUrlsFile = join(app.getPath('userData'), 'rssFeedUrls.json');
const exampleFeedUrlsFile = join(app.getAppPath(), 'resources', 'exampleFeedUrls.json');

// File Storage Funktionen für die User und Beispiel Feeds
function loadRssFeeds(file) {
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, '[]', 'utf-8');
    }
    const data = fs.readFileSync(file, 'utf-8');
    return JSON.parse(data) || [];
  } catch (error) {
    console.error("Error loading RssFeeds:" + error);
    return [];
  }
}

function saveRssFeedUrl(file){
  try{
    fs.writeFileSync(file, JSON.stringify(rssFeedUrls), 'utf-8');
  }catch (error){
    console.error('Error Saving Rss Feed: ' + error);
  }
}

let rssFeedUrls = loadRssFeeds(rssFeedUrlsFile);
let rssFeeds = [];
const exampleFeedUrls = loadRssFeeds(exampleFeedUrlsFile);

function createWindow() {
  const mainWindow = new BrowserWindow({
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

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('get-app-dirname', (event) => {
  return __dirname;
});

// API Endpunkte für Rss Feeds des Users
ipcMain.on('read-rssFeeds', async (event, pageNumber, itemsPerPage) => {
  const startIndex = (pageNumber - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  if (rssFeeds && rssFeeds.length > 0) {
    const paginatedFeeds = rssFeeds.slice(startIndex, endIndex);
    event.reply('response-rssFeeds', paginatedFeeds);
  } else {
    try {
      const feeds = await fetchRssFeeds();
      rssFeeds = feeds;

      if (rssFeeds && rssFeeds.length > 0) {
        const paginatedFeeds = rssFeeds.slice(startIndex, endIndex);
        event.reply('response-rssFeeds', paginatedFeeds);
      } else {
        event.reply('response-rssFeeds', []);
      }
    } catch (error) {
      event.reply('response-rssFeeds', []);
    }
  }
});


ipcMain.on('add-rssFeed', (event, rssFeedUrl, rssFeedTopic) => {
  const newRssFeed = { id: rssFeeds.length + 1, url: rssFeedUrl, topic: rssFeedTopic};
  const cachedFeeds = rssCache.get('feeds');
  if (cachedFeeds){
    cachedFeeds.push(newRssFeed);
    rssCache.set('feeds', cachedFeeds);
  }

  event.reply('rssFeed-added', newRssFeed)
});

ipcMain.on('delete-rss-feed', (event, rssFeedId) => {
  rssFeeds = rssFeeds.filter((feed) => feed.id !== rssFeedId);
  event.reply('rss-feed-deleted', rssFeedId);
});

ipcMain.on('update-rss-feed', (event, updatedRssFeed) => {
  const index = rssFeeds.findIndex((feed) => feed.id === updatedRssFeed.id);
  if (index !== -1) {
    rssFeeds[index] = updatedRssFeed;
    event.reply('rss-feed-updated', updatedRssFeed);
  }
});

ipcMain.on('subscribe-to-example-feed', (event, rssFeedUrl) => {
   rssFeedUrls.push(rssFeedUrl);
   saveRssFeedUrl(rssFeedUrlsFile);
   event.reply('feed-subscribed');
})

// API Endpunkte für Beispiel Feeds
ipcMain.on('read-example-feeds', async (event) => {
  try{
    const parsedFeeds = [];
    const parser = new Parser();

    for (const urlObj of exampleFeedUrls){
      const url = urlObj.url;
      const feed = await parser.parseURL(url);
      const feedItem = feed.items[feed.items.length -1];
      const feedImage = feed.image && feed.image.url ? feed.image.url : urlObj.image;
      const parsedFeed = {
        url: url,
        topic: urlObj.topic,
        title: feedItem.title,
        description: urlObj.description,
        link: feedItem.link,
        pubDate: feedItem.isoDate,
        author: feedItem.author,
        image: feedImage,
        overallDescription: feedItem.contentSnippet.replace(/\[(link|comments)\]/g, ''),
      };
      parsedFeeds.push(parsedFeed);
    }
    event.sender.send('response-example-feeds', parsedFeeds)
  }
  catch(error){
    event.reply('response-example-feeds', {error: error.message})
  }
  
})

async function fetchRssFeeds() {
  const parser = new Parser();
  const fetchPromises = rssFeedUrls.map(async (urlObj) => {
    try {
      const feed = await parser.parseURL(urlObj.url);
      const feedItem = feed.items[feed.items.length - 1];
      const feedImage = feed.image && feed.image.url ? feed.image.url : urlObj.image;
      const parsedFeed = {
        url: urlObj.url,
        topic: urlObj.topic,
        title: feedItem.title,
        description: urlObj.description,
        link: feedItem.link,
        pubDate: feedItem.isoDate,
        author: feedItem.author,
        image: feedImage,
        overallDescription: feedItem.contentSnippet.replace(/\[(link|comments)\]/g, ''),
      };
      return parsedFeed;
    } catch (error) {
      // Handle any errors that occur while fetching or parsing the feed
      console.error(`Error fetching RSS feed: ${urlObj.url}`, error);
      return null; // Return null for failed feeds
    }
  });

  const feeds = await Promise.all(fetchPromises);
  return feeds.filter((feed_1) => feed_1 !== null);
}


//Updating RssFeeds, dass sie Aktuell sind
function updateRssFeeds(){
   fetchRssFeeds().then((feeds) => {rssCache.set('feeds', feeds)})
}

setInterval(updateRssFeeds, 60*60*1000);

// Api Endpunkte für Gruppen
ipcMain.on('create-group', (event, createGroup) => {event.reply('response-create-groups', "Not Implemented")})

ipcMain.on('read-groups', (event) => {event.reply('response-read-groups', "Not Implemented")})

ipcMain.on('update-groups', (event) => {event.reply('response-update-groups', "Not Implemented")})

ipcMain.on('delet-groups', (event) => {event.reply('response-delet-groups', "Not Implemented")})