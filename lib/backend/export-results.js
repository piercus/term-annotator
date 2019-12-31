const electron = require('electron');
const fs = require('fs');

const {dialog} = electron;

const exportResults = require('../helpers/export-results');

/**
 * @returns results of the annotation process are saved locally in a json format
 */
module.exports = function () {
	const sourceDirPath = dialog.showOpenDialogSync({
		properties: ['openDirectory'],
		title: 'CHOOSE MAIN DATASET DIRECTORY'
	});
	if (!sourceDirPath) {
		return Promise.resolve();
	}

	const resultsFilepath = dialog.showSaveDialogSync({
		defaultPath: '~/annotation.json',
		title: 'save annotation'
	});
	if (!resultsFilepath) {
		return Promise.resolve();
	}

	let destFolder;
	// Check for subdir
	const tmpConfigPath = `${sourceDirPath[0]}/.term-annotator`;
	const config = JSON.parse(fs.readFileSync(tmpConfigPath, 'utf8'));
	if (config.destination.destSubDir) {
		destFolder = `${sourceDirPath[0]}/${config.destination.destSubDir}`;
	} else {
		const destDirPath = dialog.showOpenDialogSync({
			properties: ['openDirectory'],
			title: 'CHOOSE DIRECTORY WITH ANNOTATED FILES'
		});
		if (destDirPath) {
			destFolder = destDirPath[0];
		} else {
			return Promise.resolve();
		}
	}

	if (destFolder && resultsFilepath) {
		exportResults({destFolder, resultsFilepath});
		return Promise.resolve();
	}
};
