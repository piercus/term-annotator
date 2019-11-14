const path = require('path');
const electron = require('electron');

const {BrowserWindow} = electron;
/**
 * @param {Object} opts
 * @param {Object} opts.parentWindow - a main window instance
 * @param {String} opts.tmpl - a path to html
 * @param {String} opts.label - a title of a new window
 */
module.exports = function ({parentWindow, tmpl, label}) {
	let addCategoryWin;
	// If AddCategoryWin does not already exist
	return new Promise(resolve => {
		// Create a new Add Category window
		if (!addCategoryWin) {
			addCategoryWin = new BrowserWindow({
				width: 600,
				height: 600,
				parent: parentWindow,
				label,
				webPreferences: {
					nodeIntegration: true
				}
			});
			addCategoryWin.loadURL(path.join('file://', __dirname, tmpl));
			addCategoryWin.on('closed', () => {
				addCategoryWin = null;
				return resolve();
			});
		} else if (addCategoryWin) {
			resolve();
		}
	});
};
