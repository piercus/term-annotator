const electron = require('electron');

const {dialog} = electron;
const Store = require('electron-store');

const store = new Store();
const importResults = require('../helpers/import-results');
const updateTmpConfig = require('../utils/update-tmp-config');

/**
 * @returns files are moved from source directory to dest directories, that are specified in the result-file
 */

module.exports = function () {
	const resultsFilepath = dialog.showOpenDialogSync({
		properties: ['openFile'],
		title: 'CHOOSE EXISTED ANNOTATION FILE'
	});
	if (!resultsFilepath) {
		return Promise.resolve();
	}

	const sourceDirPath = dialog.showOpenDialogSync({
		properties: ['openDirectory'],
		title: 'CHOOSE SOURCE DIRECTORY'
	});

	if (!sourceDirPath) {
		return Promise.resolve();
	}

	let config;
	const resultConfig = require(resultsFilepath[0]).termAnnotatorConfig;
	if (resultConfig) {
		config = resultConfig;
	} else {
		const configFilePath = dialog.showOpenDialogSync({
			properties: ['openFile'],
			title: 'CHOOSE CONFIGURATION FILE'
		});
		if (configFilePath) {
			config = require(configFilePath[0]);
		} else {
			return Promise.resolve();
		}
	}

	if (config) {
		const sourceFolder = (config.source.subDir) ? `${sourceDirPath[0]}/${config.source.subDir}` : sourceDirPath[0];
		let destFolder;
		let destDir;
		if (config.destination.destSubDir) {
			destFolder = `${sourceDirPath[0]}/${config.destination.destSubDir}`;
			destDir = sourceDirPath[0];
		} else {
			const destDirPath = dialog.showOpenDialogSync({
				properties: ['openDirectory'],
				title: 'CHOOSE DIRECTORY TO OUTPUT FILES'
			});
			if (destDirPath) {
				destFolder = destDirPath[0];
				destDir = destDirPath[0];
			} else {
				return Promise.resolve();
			}
		}

		config.source.dir = sourceDirPath[0];
		config.destination.dir = destDir;
		return importResults({destFolder, sourceFolder, resultsFilepath: resultsFilepath[0]}).then(() => {
			store.set('config', config);
			updateTmpConfig();
			return Promise.resolve(store.get('config'));
		});
	}

	return Promise.resolve();
};
