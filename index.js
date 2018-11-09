"use strict";
const electron = require("electron")
const setupMenus = require('./lib/setup-menus');
const createWindow = require('./lib/create-window');
const listenEvents = require('./lib/listen-events');
const app = electron.app;
const ipcMain = electron.ipcMain;

let mainWebContents = null;

app.on('ready', () => {
  const config = require('./annotator.json')
  setupMenus();
  createWindow();
  listenEvents(config);
});
