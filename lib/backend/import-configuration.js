const fs = require('fs');
const electron = require('electron');

const {dialog} = electron;
const loadConfig = require('./load-config');

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
			buttons: ['Continue with Saved Config', 'Continue with a new Config'],
			noLink: true
		});
		if (configChoice === 0) {
			return loadConfig({configPath: tmpConfigPath, sourceDirPath: sourcedirPath[0]});
		}
	}

	const configFilePath = dialog.showOpenDialogSync({
		properties: ['openFile'],
		title: 'CHOOSE CONFIGURATION FILE'
	});

	if (!configFilePath) {
		return Promise.resolve();
	}

	if (configFilePath && sourcedirPath) {
		return loadConfig({configPath: configFilePath[0], sourceDirPath: sourcedirPath[0]});
	}
};
