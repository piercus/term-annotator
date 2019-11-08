const electron = require('electron');
const fs = require('fs');

const {dialog} = electron;
const Store = require('electron-store');

const store = new Store();
const importResults = require('../helpers/import-results');

/**
 * @returns files are moved from source directory to dest directories, that are specified in the result-file
 */

module.exports = function () {
	const resultsFilepath = dialog.showOpenDialogSync({
		properties: ['openFile'],
		title: 'CHOOSE EXISTED ANNOTATION FILE'
	})[0];

	const sourceFolder = dialog.showOpenDialogSync({
		properties: ['openDirectory'],
		title: 'CHOOSE SOURCE DIRECTORY'
	});

	const destFolder = dialog.showOpenDialogSync({
		properties: ['openDirectory'],
		title: 'CHOOSE DIRECTORY TO OUTPUT FILES'
	});

	if (!destFolder || !sourceFolder || !resultsFilepath) {
		console.log('Input/Output/Annotation should be chousen');
		return Promise.resolve();
	}

	return importResults({destFolder: destFolder[0], sourceFolder: sourceFolder[0], resultsFilepath}).then(() => {
		// Import config: temporary workaround before #29
		const config = require(resultsFilepath).termAnnotatorConfig;
		if (config) {
			const srcFolder = sourceFolder[0];
			config.source.dir = srcFolder;
			const destinationFolder = destFolder[0];
			console.log(destinationFolder);
			config.destination.dir = destinationFolder;
			// Sanity check
			if (fs.existsSync(destinationFolder)) {
				const destFiles = [];
				const folders = fs.readdirSync(destinationFolder);
				folders.forEach(folder => {
					const files = fs.readdirSync(`${destinationFolder}/${folder}`);
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
		}

		return Promise.resolve(store.get('config'));
	});
};
