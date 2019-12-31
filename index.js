'use strict';
const electron = require('electron');

const {app} = electron;
const Store = require('electron-store');
const setupMenus = require('./lib/frontend/setup-menus');
const createWindow = require('./lib/frontend/create-window');
const listenEvents = require('./lib/backend/listen-events');

const store = new Store();

app.on('ready', () => {
	store.set('config', {});
	createWindow();
	setupMenus();
	listenEvents(store.get('config'));
});
