const fs = require('fs');
const electron = require('electron');
const Store = require('electron-store');

const store = new Store();
const {dialog} = electron;
const updateTmpConfig = require('../utils/update-tmp-config');

/**
 * @param {Object} opts
 * @param {String} opts.configPath  - a path to the Config file
 * @param {String} opts.sourceDirPath  - a path to the data set
 * @returns {Promise} - config is loaded
 */

module.exports = function ({configPath, sourceDirPath}) {
	const loadedConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
	const config = loadedConfig.termAnnotatorConfig ? loadedConfig.termAnnotatorConfig : loadedConfig; // Import config: temporary workaround before #29
	if (sourceDirPath) {
		const srcFolder = (config.source.subDir) ? `${sourceDirPath}/${config.source.subDir}` : sourceDirPath;
		if (fs.existsSync(srcFolder)) {
			config.source.dir = sourceDirPath;
			let destFolder;
			let destDir;
			if (config.destination.destSubDir) {
				destFolder = `${sourceDirPath}/${config.destination.destSubDir}`;
				destDir = sourceDirPath;
			} else {
				const destDirPath = dialog.showOpenDialogSync({
					properties: ['openDirectory'],
					title: 'CHOOSE DESTINATION DIRECTORY'
				});
				if (destDirPath) {
					destFolder = destDirPath[0];
					destDir = destDirPath[0];
				} else {
					return Promise.resolve(store.get('config'));
				}
			}

			config.destination.dir = destDir;

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
			updateTmpConfig();
		} else {
			const response = dialog.showMessageBox({message: 'Dataset structure is not valid, Please check documentation'});
			console.log(response);
			return Promise.reject();
		}
	}

	return Promise.resolve(store.get('config'));
};
