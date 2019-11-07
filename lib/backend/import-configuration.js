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
			const srcFolder = `${sourceDirPath[0]}/toannotate`;
			if (fs.existsSync(srcFolder)) {
				loadedConfig.source.dir = srcFolder;
				const destFolder = `${sourceDirPath[0]}/annotated/`;
				if (fs.existsSync(destFolder)) {
					console.log(`${destFolder} already exists`);
				} else {
					fs.mkdirSync(destFolder);
				}

				const updatedConfig = JSON.stringify(loadedConfig).replace(/destFolder\//gi, destFolder);

				// Sanity check
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

				store.set('config', JSON.parse(updatedConfig));
			} else {
				const response = dialog.showMessageBox({message: 'Dataset structure is not valid, Please check documentation'});
				console.log(response);
				return Promise.reject();
			}
		}
	}
	// if (configFilePath) {
	// 	const loadedConfig = JSON.parse(fs.readFileSync(configFilePath[0], 'utf8'));
	// 	const sourceDirPath = dialog.showOpenDialogSync({
	// 		properties: ['openDirectory'],
	// 		title: 'CHOOSE SOURCE DIRECTORY'
	// 	});
	// 	if (sourceDirPath) {
	// 		loadedConfig.source.dir = sourceDirPath[0];
	// 	}

	// 	store.set('config', loadedConfig);
	// }

	// const updatedConfig = store.get('config');
	return Promise.resolve(store.get('config'));
};
