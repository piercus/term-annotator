const fs = require('fs');
const path = require('path');
/**
* @param {options} options
* @return {Promise.<AllInfos>}
*/

/**
* @typedef {AllInfos}
* @property {FolderInfo} source
* @property {Object.<string, FolderInfo>} classes
*/
module.exports = function(options){
	const classNames = Object.keys(options.classes);
	const perClass = {};
	let srcInfo;
	return Promise.all([
		readdir(options.source.dir).then(res => {
			let randomFilename;
			if(res.length > 0){
				randomFilename = path.join(`${__dirname}`,'..',options.source.dir+'/'+res[Math.floor(Math.random()*res.length)]);
			}
			srcInfo = {
				filenames: res,
				numFiles: res.length,
				randomFilename
			};
		}),
		Promise.all(
			classNames.map(cN => {
					return readdir(options.classes[cN].dir)
						.then(filenames => {
							perClass[cN] = {
								filenames,
								key: options.classes[cN].key,
								numFiles: filenames.length
							};
						})
				})
		)
	]).then(() => {
		return {
			source : srcInfo,
			classes: perClass
		};
	});
}

const readdir = function(dir){
	return new Promise((resolve, reject) => {
		fs.readdir(dir, (err, res) => {
			if(err){
				return reject(err);
			}
			resolve(res);
		})
	});
}
