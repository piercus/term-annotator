const fs = require('fs');
const gifFrames = require('gif-frames');

/**
 * @param {Object} opts
 * @param {String} folderPath - path to a folder with a thumbnail;
 * @returns {Promise} a new thumbnail was extracted
 * @example "../annotated/not-clean"
 */
module.exports = function ({folderPath}) {
	const dest = `${folderPath}/thumbnails`;
	const oldThumbnail = fs.readdirSync(dest)[0];
	fs.unlinkSync(`${dest}/${oldThumbnail}`);
	const gifs = fs.readdirSync(folderPath).filter(gif => gif.match(/.gif$/));
	const gif = `${folderPath}/${gifs[Math.floor(Math.random() * gifs.length)]}`;
	const gifName = gif.match(/([-._a-z0-9]*).gif$/)[1];
	return new Promise((resolve, reject) => {
		gifFrames({url: gif, frames: 'all', outputType: 'png', cumulative: true}, (err, frameData) => {
			if (err) {
				reject(err);
			}

			const no = Math.floor(Math.random() * frameData.length);
			const thumbnail = `${dest}/${gifName}-${no}.png`;
			frameData[no].getImage().pipe(fs.createWriteStream(thumbnail));
			resolve();
		});
	}).then(() => {
		return Promise.resolve();
	});
};
