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

	const sourceDirPath = dialog.showOpenDialogSync({
		properties: ['openDirectory'],
		title: 'CHOOSE SOURCE DIRECTORY'
	});

	if (configFilePath && sourceDirPath) {
		const loadedConfig = JSON.parse(fs.readFileSync(configFilePath[0], 'utf8'));
		const config = loadedConfig.termAnnotatorConfig ? loadedConfig.termAnnotatorConfig : loadedConfig; // Import config: temporary workaround before #29
		if (sourceDirPath) {
			const srcFolder = (config.source.subDir) ? `${sourceDirPath[0]}/${config.source.subDir}` : sourceDirPath[0];
			if (fs.existsSync(srcFolder)) {
				config.source.dir = srcFolder;
				let destFolder;
				if (config.destination.destSubDir) {
					destFolder = `${sourceDirPath[0]}/${config.destination.destSubDir}`;
				} else {
					const destDirPath = dialog.showOpenDialogSync({
						properties: ['openDirectory'],
						title: 'CHOOSE DESTINATION DIRECTORY'
					});
					if (destDirPath) {
						destFolder = destDirPath[0];
					} else {
						return Promise.resolve(store.get('config'));
					}
				}

				config.destination.dir = destFolder;

				// Sanity check
				if (fs.existsSync(destFolder)) {
					const destFiles = [];
					const folders = fs.readdirSync(destFolder);
					folders.forEach(folder => {
						const files = fs.readdirSync(`${destFolder}/${folder}`);
						destFiles.push(...files);
					});

					const srcFiles = fs.readdirSync(srcFolder);
					const duplicates = srcFiles.filter(f => destFiles.indexOf(f) !== -1);
					console.log('Duplicates:', duplicates);
					if (duplicates.length > 0) {
						const responseOnDuplicates = dialog.showMessageBox({message: 'Dataset is corrupted, duplicated files, please contact administrator'});
						console.log(responseOnDuplicates);
						return Promise.reject();
					}
				}

				store.set('config', config);
			} else {
				const response = dialog.showMessageBox({message: 'Dataset structure is not valid, Please check documentation'});
				console.log(response);
				return Promise.reject();
			}
		}
	}

	return Promise.resolve(store.get('config'));
};
