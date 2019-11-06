const electron = require('electron');

const {dialog} = electron;

const exportResults = require('../helpers/export-results');

/**
 * @returns results of the annotation process are saved locally in a json format
 */
module.exports = function () {
	const destFolder = dialog.showOpenDialogSync({
		properties: ['openDirectory'],
		title: 'CHOOSE DIRECTORY WITH ANNOTATED FILES'
	});

	const resultsFilepath = dialog.showSaveDialogSync({
		defaultPath: '~/annotation.json',
		title: 'save annotation'
	});

	if (destFolder && resultsFilepath) {
		exportResults({destFolder: destFolder[0], resultsFilepath});
		return Promise.resolve();
	}
};
