import { app, shell, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import { parseRssFeed } from './rssParser';

// Dummy data for RSS feeds
let rssFeeds = [
  { id: 1, url: 'https://example.com/rss/feed1' },
  { id: 2, url: 'https://example.com/rss/feed2' },
];

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: false,
    ...(process.platform === 'linux' ? { icon } : {}),
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

// CRUD endpoints for RSS feeds
ipcMain.on('request-rss-feeds', (event) => {
  event.reply('response-rss-feeds', rssFeeds);
});

ipcMain.on('add-rss-feed', (event, rssFeedUrl) => {
  const newRssFeed = { id: rssFeeds.length + 1, url: rssFeedUrl };
  rssFeeds.push(newRssFeed);
  event.reply('rss-feed-added', newRssFeed);
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