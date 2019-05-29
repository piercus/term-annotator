const electron = require('electron');

const {remote} = electron;
const Store = require('electron-store');

const store = new Store();

const addfolder = function () {
	const srcFolder = document.getElementById('path').value;
	store.set('config.source.dir', srcFolder);
	const window = remote.getCurrentWindow();
	window.getParentWindow().send('config', srcFolder);
	window.close();
};
const cancel = function () {
	const window = remote.getCurrentWindow();
	window.close();
};
