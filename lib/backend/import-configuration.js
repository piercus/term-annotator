const fs = require('fs');
const electron = require('electron');

const {dialog} = electron;
const path = require('path');
const loadConfig = require('./load-config');

const defaultConfig = './dist/default-config.json';
/**
 * Import configuration file into app
 * @returns {Promise} configuration was imported
 */

module.exports = function () {
	const sourcedirPath = dialog.showOpenDialogSync({
		properties: ['openDirectory'],
		title: 'CHOOSE SOURCE DIRECTORY'
	});
	if (!sourcedirPath) {
		return Promise.resolve();
	}

	const tmpConfigPath = `${sourcedirPath[0]}/.term-annotator`;
	if (fs.existsSync(tmpConfigPath)) {
		const configChoice = dialog.showMessageBoxSync({
			type: 'info',
			title: 'INFO',
			message: `Loading from temporary saved configuration file in \n ${sourcedirPath[0]}/.term-annotator`,
			buttons: ['Load a Previous Config', 'Load a new Config file', 'Start with an empty Config'],
			noLink: true
		});
		if (configChoice === 0) {
			return loadConfig({configPath: tmpConfigPath, sourceDirPath: sourcedirPath[0]});
		}

		if (configChoice === 2) {
			return loadConfig({configPath: path.join(`${__dirname}`, defaultConfig), sourceDirPath: sourcedirPath[0]});
		}
	} else {
		const configChoice = dialog.showMessageBoxSync({
			type: 'info',
			title: 'INFO',
			message: `Loading from temporary saved configuration file in \n ${sourcedirPath[0]}/.term-annotator`,
			buttons: ['Load a new Config file', 'Start with a Default Config'],
			noLink: true
		});
		if (configChoice === 0) {
			const configFilePath = dialog.showOpenDialogSync({
				properties: ['openFile'],
				title: 'CHOOSE CONFIGURATION FILE'
			});
			if (!configFilePath) {
				return Promise.resolve();
			}

			return loadConfig({configPath: configFilePath[0], sourceDirPath: sourcedirPath[0]});
		}

		if (configChoice === 1) {
			return loadConfig({configPath: path.join(`${__dirname}`, defaultConfig), sourceDirPath: sourcedirPath[0]});
		}
	}
};
