const fs = require('fs');
const path = require('path');
/**
* @typedef {object} ClassDef
* @property {string} key the keyboard key that do this action when pressed
* @property {string} dir the output directory where to move annotated images
*/

/**
* @typedef {object} Config
* @property {boolean} sort if true the images are annotated in the filename alhpabetic order
* @property {object} source
* @property {String} [mediaType='image'] - can be 'video' or 'image'
* @property {string} source.dir
* @property {boolean} source.recursive
* @property {object.<string, ClassDef>} classes classes definition
* @example
{
	"sort": false,
	"mediaType": "image",
	"source" : {
		"dir": "./folders/source",
		"recursive": false
	},
	"classes": {
		"classA": {
			"key" : "a",
			"dir": "./folders/classADir"
		},
		"classB": {
			"key" : "b",
			"dir": "./folders/classBDir"
		}
	}
}
*/

/**
* @typedef {object} FolderInfo
* @property {number} numFiles
* @property {string} nextFilename
* @property {Array.<string>} filenames
*/

/**
* @param {Config} options
* @return {null}
*/

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
		readdir(options.source.dir, {recursive: options.source.recursive}).then(res => {
			
			let nextFilename;
			if(res.length > 0){
				let file
				if(sort){
					file = res.sort()[0]
				} else {
					file = res[Math.floor(Math.random()*res.length)]
				}
				nextFilename = path.join(`${__dirname}`,'..',file);
			}
			console.log(options.source, options.source.splitKey)
			srcInfo = {
				filenames: res,
				numFiles: res.length,
				nextFilename: nextFilename,
				mediaType: options.source.mediaType,
				splitKey: options.source.videoSplit.splitKey
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

const readdir = function(dir, {recursive = false} = {}){
	if(recursive){
		return readdir(dir).then(filenames => {
			return Promise.all(filenames.map(filename => {
				return new Promise((resolve, reject) => {
					fs.stat(filename, (err, stat) => {
						if(err){
							return reject(err);
						}
						resolve(stat);
					})
				}).then(stat => {
					if (stat && stat.isDirectory()) {
	          return readdir(filename, {recursive});
	        } else {
						return [filename];
	        }
				});
      })).then(dblArray => {
				// flatten the result
				return dblArray.reduce((a,b) => a.concat(b), []);
			});
		})
	}
	return new Promise((resolve, reject) => {
		fs.readdir(dir, (err, res) => {
			if(err){
				return reject(err);
			}
			// remove hidden files
			resolve(res.filter(item => item[0] !== '.').map(item => dir + '/' + item));
		})
	});
};
