"use strict";
const electron = require("electron")
const Store = require('electron-store');
const setupMenus = require('./lib/setup-menus');
const createWindow = require('./lib/create-window');
const listenEvents = require('./lib/listen-events');
const app = electron.app;
const ipcMain = electron.ipcMain;
const store = new Store();

let mainWebContents = null;

app.on('ready', () => {
  store.set('config', require('./annotator.json'));
  setupMenus();
  createWindow();
  listenEvents(store.get('config'));
});
