const electron = require('electron');
const Store = require('electron-store');

const {remote} = electron;
const {dialog} = electron.remote;

const store = new Store();
const updateTmpConfig = require('../utils/update-tmp-config');

const addClass = function () {									// eslint-disable-line no-unused-vars
	const classname = document.querySelector('#classname').value.replace(/ /g, '_');
	const key = document.querySelector('#key').value;
	if (key.length > 1 || !key) {
		const alert = dialog.showMessageBoxSync(remote.getCurrentWindow(), {
			type: 'error',
			title: 'Error',
			message: 'Key field is not filled correctly',
			buttons: ['OK'],
			noLink: true
		});
		console.log(alert);
		throw new Error('error');
	}

	if (!classname) {
		const alert = dialog.showMessageBoxSync(remote.getCurrentWindow(), {
			type: 'error',
			title: 'Error',
			message: 'Classname field is not filled correctly',
			buttons: ['OK'],
			noLink: true
		});
		console.log(alert);
		throw new Error('error');
	}

	const description = document.querySelector('#description').value;
	store.set(`config.classes.${classname}.key`, key);
	store.set(`config.classes.${classname}.dir`, classname);
	store.set(`config.classes.${classname}.description`, description);
	updateTmpConfig();
	const window = remote.getCurrentWindow();
	window.close();
};
