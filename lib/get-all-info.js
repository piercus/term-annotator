const fs = require('fs');
const path = require('path');
/**
* @param {Config} options
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
	const sort = options.sort || false;
	let srcInfo;
	return Promise.all([
		readdir(options.source.dir).then(res => {
			
			let nextFilename;
			if(res.length > 0){
				let file
				if(sort){
					file = res.sort()[0]
				} else {
					file = res[Math.floor(Math.random()*res.length)]
				}
				nextFilename = path.join(`${__dirname}`,'..',options.source.dir+'/'+file);
			}
			srcInfo = {
				filenames: res,
				numFiles: res.length,
				nextFilename: nextFilename
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
			// remove hidden files
			resolve(res.filter(item => item[0] !== '.'));
		})
	});
}
