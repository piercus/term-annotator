const fs = require('fs');
const gifFrames = require('gif-frames');
const createFolder = require('../utils/create-folder');

/**
 * @param {Object} opts
 * @param {String} opts.destFolder  - a path to a folder with annotated files
 * @param {String} opts.sourceFolder  - a path to a folder with files to annotate (dataset)
 * @param {String} opts.resultsFilepath  - a path to the result-file
 * @returns {}  files are moved from source directory to dest directories, that are specified in the result-file
 */

module.exports = function ({destFolder, sourceFolder, resultsFilepath}) {
	if (fs.existsSync(destFolder)) {
		if (fs.readdirSync(destFolder).length > 0) {
			throw new Error(`dest directory (${destFolder}) should be empty`);
		}
	} else {
		createFolder(destFolder);
	}

	const results = require(resultsFilepath);

	const foldersNames = Object.keys(results.folders);
	foldersNames.forEach(fN => {
		const folder = `${destFolder}/${fN}`;
		createFolder(folder);

		results.folders[fN].filenames.forEach(f => {
			const src = `${sourceFolder}/${f}`;
			const dest = `${destFolder}/${fN}/${f}`;
			fs.renameSync(src, dest);
		});

		const {thumbnail} = results.folders[fN];
		if (thumbnail) {
			const thumbnailPath = `${destFolder}/${fN}/thumbnails`;
			createFolder(thumbnailPath);
			const thumbnailGif = `${destFolder}/${fN}/${thumbnail.replace(/.png/, '.gif')}`;
			gifFrames(
				{url: thumbnailGif, frames: '0', outputType: 'png'},
				(err, frameData) => {
					if (err) {
						throw err;
					}

					frameData.forEach(frame => {
						frame.getImage().pipe(fs.createWriteStream(`${thumbnailPath}/${thumbnail}`));
					});
				});
		}
	});
};
