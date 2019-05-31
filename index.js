'use strict';
const electron = require('electron');

const {app} = electron;
const Store = require('electron-store');
const setupMenus = require('./lib/setup-menus');
const createWindow = require('./lib/create-window');
const listenEvents = require('./lib/listen-events');

const store = new Store();
const defaultConf = require('./config.json');

app.on('ready', () => {
	store.set('config', defaultConf);
	createWindow();
	setupMenus();
	listenEvents(store.get('config'));
});
