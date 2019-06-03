const electron = require('electron');

const {remote} = electron;
const Store = require('electron-store');

const store = new Store();

const addfolder = function () {									// eslint-disable-line no-unused-vars
	const srcFolder = document.querySelector('#path').value;
	store.set('config.source.dir', srcFolder);
	const window = remote.getCurrentWindow();
	window.getParentWindow().send('config', srcFolder);
	window.close();
};

const cancel = function () {									// eslint-disable-line no-unused-vars
	const window = remote.getCurrentWindow();
	window.close();
};
