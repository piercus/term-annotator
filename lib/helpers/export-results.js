
const fs = require('fs');

/**
 * @typedef {String} Epoch - timestamp, shows when result was generated
 * @example "2019-11-06T16:32:27.712Z"
 */

/**
 * @typedef {String} Filename -a name of a file
 * @example "111111_23_24-2-1570481465391-person-5c468.gif", "111111_23_24-2-1570481465391-person-5c468.png"
 */

/**
 * @typedef {String} FolderName the name of a folder
 * @example "1" , "not-clean"
 */

/**
 * @typedef {Object} FolderData - info about each folder's content
 * @property {Array.<Filename>} filenames
 * @property {Filename} thumbnail
 */

/**
 * @typedef {Object.<FolderName,FolderData>} FoldersData - info about each folder
 */

/**
 * @typedef {Object} Result - result of the annotation
 * @property {Epoch} epoch
 * @property {FoldersData} folders - an info about all folders
 * @example
 * ```
 * {
 *  "epoch": "2019-11-06T16:32:27.712Z",
 *  "folders": {
 *   "1": {
 *    "filenames": [
 *      "111111_23_24-2-1570481465391-person-5c468.gif"
 *    ],
 *    "thumbnail": "111111_23_24-2-1570481465391-person-5c468.png"
 *     },
 *  "3": {
 *     "filenames": [
 *      "111111_23_24-2-1570481465391-person-72e80.gif"
 *     ],
 *     "thumbnail": "111111_23_24-2-1570481465391-person-72e80.png"
 *   }
 *  }
 * }
 * ```
 */

/**
 * @param {Object} opts
 * @param {String} opts.destFolder  - folder with annotated files
 * @param {String} opts.resultsFilepath  - a path where should be saved result-file
 * @returns {Result} result-file is saved
 */

module.exports = function ({destFolder, resultsFilepath}) {
	const folders = fs.readdirSync(destFolder);
	const result = {};
	result.epoch = new Date().toISOString();
	result.folders = {};
	folders.forEach(folder => {
		const filenames = fs.readdirSync(`${destFolder}/${folder}`).filter(file => !file.endsWith('thumbnails')); // Exclude thumbnails dir
		let thumbnail;
		const thumbnails = fs.readdirSync(`${destFolder}/${folder}/thumbnails`);
		if (thumbnails.length === 0) {
			thumbnail = null;
		} else {
			thumbnail = thumbnails[0].replace(/(-\d{1,2}.png)/, '.png');
		}

		result.folders[folder] = {
			filenames,
			thumbnail
		};
	});
	fs.writeFileSync(resultsFilepath, JSON.stringify(result, null, 2), 'utf-8');
};
