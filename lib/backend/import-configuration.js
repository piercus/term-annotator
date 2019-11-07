const fs = require('fs');
const electron = require('electron');

const {dialog} = electron;
const Store = require('electron-store');

const store = new Store();

/**
 * Import configuration file into app
 * @returns {Promise} configuration was imported
 */

module.exports = function () {
	const configFilePath = dialog.showOpenDialogSync({
		properties: ['openFile'],
		title: 'CHOOSE CONFIGURATION FILE'
	});
	if (configFilePath) {
		const loadedConfig = JSON.parse(fs.readFileSync(configFilePath[0], 'utf8'));
		const sourceDirPath = dialog.showOpenDialogSync({
			properties: ['openDirectory'],
			title: 'CHOOSE SOURCE DIRECTORY'
		});
		if (sourceDirPath) {
			loadedConfig.source.dir = sourceDirPath[0];
		}

		store.set('config', loadedConfig);
	}

	const updatedConfig = store.get('config');
	return Promise.resolve(updatedConfig);
};
