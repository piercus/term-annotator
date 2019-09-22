const fs = require('fs');
const path = require('path');
const getDirnames = require('./get-dirnames');
/**
* @typedef {object} ClassDef
* @property {string} key the keyboard key that do this action when pressed
* @property {string} dir the output directory where to move annotated images
* @property {Array.<ClassDefParam>} params the output directory where to move annotated images
*/
/**
* @typedef {object} ClassDefParam
* @property {string} label The label to display as a question
* @property {string} name the name to be used in ejs template
* @property {Array.<ClassDefParamChoice>} choices the available choices
*/
/**
* @typedef {object} ClassDefParamChoice
* @property {string} label The label to display as athe choice answer
* @property {string} key the keyboard key to touch for this choice
* @property {string} value value to use in ejs template
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
		"class-c": {
			"key" : "c",
			"dir": "myAnnotation/class-c-<%=isFoo%>-<%=isBar%>",
			"params" : [{
					"label": "Is it foo ?",
					"name": "isFoo",
					"choices": [{
							"key": "Y",
							"label": "yes",
							"value": "fooTrue"
						},{
							"key": "N",
							"label": "no",
							"value": "fooFalse"
					}]
				},{
					"label": "Is it bar ?",
					"name": "isBar",
					"choices": [{
							"key": "Y",
							"label": "yes",
							"value": "barTrue"
						},{
							"key": "N",
							"label": "no",
							"value": "barFalse"
					}]
				}]
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
* @typedef {AllInfos}
* @property {FolderInfo} source
* @property {Object.<string, FolderInfo>} classes
*/

/**
* @param {Config} options
* @param {Array.<filenames>} queue - queue of filenames
* @return {Promise.<AllInfos>}
*/

module.exports = function (options, queue) {
	console.log('queue is ' + JSON.stringify(queue))
	const classNames = Object.keys(options.classes);
	const perClass = {};
	const perParams = {};
	const sort = options.sort || false;
	let srcInfo;
	return Promise.all([
		readdir(options.source.dir, { recursive: options.source.recursive, filter: options.source.filter }).then(res => {

			let nextFilename;
			if (res.length > 0) {
				let file
				if (queue.length > 0) {
					file = path.relative(path.join(`${__dirname}`, '..'), queue.shift());
					if (res.indexOf(file) === -1) {
						throw (new Error(`file ${file} from queue is not existing in source dir`))
					}
				} else {
					if (sort) {
						file = res.sort()[0];
					} else {
						file = res[Math.floor(Math.random() * res.length)]
					}
				}
				nextFilename = path.join(`${__dirname}`, '..', file);
			}
			const splitKey = options.source.videoSplit ? options.source.videoSplit.splitKey : 'none';
			srcInfo = {
				filenames: res,
				queue,
				numFiles: res.length,
				nextFilename: nextFilename,
				mediaType: options.source.mediaType,
				splitKey
			};
		}),
		Promise.all(
			classNames.map(cN => {
				return getDirnames(options.classes[cN]).then(dirs => {
					return Promise.all(dirs.map(dir => {
						return readdir(options.classes[cN].dir).catch(err => {
							return []
						})
					})).then(filenames => {
						return filenames.reduce((a, b) => a.concat(b), []);
					}).then(filenames => {
						const thumbnails = filenames.filter(f => f.endsWith('.png'))
						let thumbnail;
						let numFiles;
						if (thumbnails.length === 1) {
							numFiles = filenames.length - 1
							thumbnail = thumbnails[0]
						} else if (thumbnails.length > 1) {
							console.log(`Found ${thumbnails.length}`);
							numFiles = filenames.length - thumbnails.length
							thumbnail = thumbnails[0]
						}
						else { thumbnail = null; numFiles = filenames.length }
						perClass[cN] = {
							filenames,
							key: options.classes[cN].key,
							params: options.classes[cN].params,
							numFiles,
							thumbnail
						};
					})
				})
			})

		),
		Promise.all(
			classNames.map(cN => {
				return getDirnames(options.classes[cN]).then(dirs => {
					return Promise.all(dirs.map(dir => {
						return readdir(dir).catch(err => {
							return []
						})
					})).then(filenames => {
						let main;
						let sub = [];
						if (options.classes[cN].params) {
							options.classes[cN].params.forEach((param, index) => {
								if (index === 0) {
									main = param;
								} else {
									let choices = [];
									filenames.forEach((f, ind) => {
										let numFiles;
										let thumbnail;
										const thumbnailsPerChoice = f.filter(f => f.endsWith('.png'));
										if (thumbnailsPerChoice.length === 1) {
											numFiles = f.length - 1
											thumbnail = thumbnailsPerChoice[0]
										} else if (thumbnailsPerChoice.length > 1) {
											numFiles = f.length - thumbnailsPerChoice.length
											thumbnails = thumbnailsPerChoice[0]
											console.log(`Found ${thumbnailsPerChoice.length}`);
										} else {
											thumbnails = './dist/No_Image_Available.png'; numFiles = f.length
										}
										const key = param.choices[ind]?param.choices[ind].key:param.choices[ind-param.choices.length].key
										const value = param.choices[ind]?param.choices[ind].value:param.choices[ind-param.choices.length].value
										const label = param.choices[ind]?param.choices[ind].label:param.choices[ind-param.choices.length].label
										choices.push({
											key,
											value,
											label,
											numFiles: numFiles,
											thumbnail: thumbnail
										})
									})
									const subPn = {
										label: param.label,
										name: param.name,
										choices
									}
									sub.push(subPn);
								}
							})
						}
						perParams[cN] = {
							main, sub
						}
					})
				})
			})
		)
	]).then(() => {

		return {
			source: srcInfo,
			classes: perClass,
			params: perParams
		};
	});
}

const readdir = function (dir, { recursive = false, filter = null } = {}) {
	if (recursive) {
		return readdir(dir).then(filenames => {
			return Promise.all(filenames.map(filename => {
				return new Promise((resolve, reject) => {
					fs.stat(filename, (err, stat) => {
						if (err) {
							return reject(err);
						}
						resolve(stat);
					})
				}).then(stat => {
					if (stat && stat.isDirectory()) {
						return readdir(filename, { recursive });
					} else {
						return [filename];
					}
				});
			})).then(dblArray => {
				// flatten the result
				return dblArray.reduce((a, b) => a.concat(b), []);
			}).then(filenames => {

				if (filter) {
					const reg = new RegExp(filter);
					return filenames.filter(f => f.match(reg))
				}
				return filenames;
			});
		})
	}
	return new Promise((resolve, reject) => {
		fs.readdir(dir, (err, res) => {
			if (err) {
				return reject(err);
			}
			// remove hidden files
			resolve(res.filter(item => item[0] !== '.').map(item => dir + '/' + item));
		})
	});
};
