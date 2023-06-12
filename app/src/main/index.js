import { app, shell, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { parseRssFeeds_LastItem } from './rssParser';
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
ipcMain.on('read-rssFeeds', async (event) => {
  try{
    const parsedFeeds = await parseRssFeeds_LastItem(rssFeedUrls);
    event.sender.send('response-rssFeeds', parsedFeeds)
  }catch (error){
    event.reply('response-example-feeds', {error: error.message})
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

ipcMain.on('subscribe-to-example-feed', (event, rssFeedUrl, description, topic) => {
  try {
    const existingFeed = rssFeedUrls.find(feed => feed.url === rssFeedUrl);

    if (existingFeed) {
      event.reply('feed-subscribed', { error: 'Feed URL already exists' });
    } else {
      const newFeedUrl = {
        id: rssFeedUrls.length +1,
        url: rssFeedUrl,
        description: description,
        topic: topic
      };
      rssFeedUrls.push(newFeedUrl);
      saveRssFeedUrl(rssFeedUrlsFile);
      event.reply('feed-subscribed');
    }
  } catch (error) {
    console.error('Error subscribing to the example feed:', error);
    event.reply('feed-subscribed', { error: error.message });
  }
});

// API Endpunkte für Beispiel Feeds
ipcMain.on('read-example-feeds', async (event) => {
  try{
    const parsedFeeds = await parseRssFeeds_LastItem(exampleFeedUrls);
    event.sender.send('response-example-feeds', parsedFeeds)
  }
  catch(error){
    event.reply('response-example-feeds', {error: error.message})
  }
  
})


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