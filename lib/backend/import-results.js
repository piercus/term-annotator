const electron = require('electron');

const {dialog} = electron;
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

	return Promise.resolve(importResults({destFolder: destFolder[0], sourceFolder: sourceFolder[0], resultsFilepath}));
};
