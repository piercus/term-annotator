
const fs = require('fs');

/**
 * @param {Object} opts
 * @param {String} opts.destFolder  - folder with annotated files
 * @param {String} opts.resultsFilepath  - a path where should be saved result-file
 * @returns {} result-file is saved
 */

/**
 * @typedef {String} epoch - timestamp, shows when result was generated
 * @example "2019-11-06T16:32:27.712Z"
 */

/**
 * @typedef {Array.<String>} filenames - a list of filenames
 * @example ["111111_23_24-2-1570481465391-person-5c468.gif", ..]
 */
/**
 * @typedef {String} thumbnail - a name of thumbnail
 * @example "111111_23_24-2-1570481465391-person-5c468.png"
 */

/**
 * @typedef {String} folderName the name of a folder
 * @example "1" , "not-clean"
 */

/**
 * @typedef {Object.<filenames,thumbnail>} folderData - info about each folder's content
 */

/**
 * @typedef {Object.<folderName,folderData} foldersData - info about each folder
 */

/**
 * @typedef {Object.<epoch,foldersData>} result - result of the annotation
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
			thumbnail = thumbnails[0];
		}

		result.folders[folder] = {
			filenames,
			thumbnail
		};
	});
	fs.writeFileSync(resultsFilepath, JSON.stringify(result, null, 2), 'utf-8');
};
