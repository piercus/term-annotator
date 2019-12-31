const fs = require('fs');
const path = require('path');

const getDirnames = require('../utils/get-dirnames');
const readDir = require('../utils/read-dir');

/**
* @typedef {object} ClassDef
* @property {string} key the keyboard key that do this action when pressed
* @property {string} dir the output directory where to move annotated images
* @property {string} description - a description of a calss
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
* @property {string} description - a description of a calss
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
			"dir": "./folders/classADir",
			"description":"about classA"
		},
		"classB": {
			"key" : "b",
			"dir": "./folders/classBDir",
			"description":""
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
							"value": "fooTrue",
							"description":""
						},{
							"key": "N",
							"label": "no",
							"value": "fooFalse",
							"description":""
					}]
				},{
					"label": "Is it bar ?",
					"name": "isBar",
					"choices": [{
							"key": "Y",
							"label": "yes",
							"value": "barTrue",
							"description":""
						},{
							"key": "N",
							"label": "no",
							"value": "barFalse",
							"description":""
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
* @param {Config} config
* @return {null}
*/

/**
* @typedef {AllInfos}
* @property {FolderInfo} source
* @property {Object.<string, FolderInfo>} classes
*/

/**
* @param {Config} config
* @param {Array.<filenames>} queue - queue of filenames
* @return {Promise.<AllInfos>}
*/

module.exports = function (config, queue) {
	console.log('queue is ' + JSON.stringify(queue));
	const classNames = Object.keys(config.classes);
	const perClass = {};
	const perParams = {};
	const sort = config.sort || false;
	const srcFolder = (config.source.subDir) ? `${config.source.dir}/${config.source.subDir}` : config.source.dir;
	const destFolder = (config.destination.destSubDir) ? `${config.destination.dir}/${config.destination.destSubDir}` : config.destination.dir;
	let srcInfo;
	return Promise.all([
		readDir(srcFolder, {recursive: config.source.recursive, filter: config.source.filter}).then(res => {
			let nextFilename;
			if (res.length > 0) {
				let file;
				if (queue.length > 0) {
					file = path.relative(path.join(`${__dirname}`, '..'), queue.shift());
					if (res.indexOf(file) === -1) {
						throw (new Error(`file ${file} from queue is not existing in source dir`));
					}
				} else if (sort) {
					file = res.sort()[0];
				} else {
					file = res[Math.floor(Math.random() * res.length)];
				}

				nextFilename = file;
			}

			const splitKey = config.source.videoSplit ? config.source.videoSplit.splitKey : 'none';
			srcInfo = {
				filenames: res,
				queue,
				numFiles: res.length,
				nextFilename,
				mediaType: config.source.mediaType,
				splitKey
			};
		}),
		Promise.all(
			classNames.map(cN => {
				return getDirnames(config.classes[cN], destFolder).then(dirs => {
					return Promise.all(dirs.map(() => {
						return readDir(destFolder + '/' + config.classes[cN].dir).catch(error => { // eslint-disable-line no-unused-vars
							// Console.log(error);
							return [];
						});
					})).then(filenames => {
						return filenames.reduce((a, b) => a.concat(b), []);
					}).then(filenames => {
						let thumbnail;
						let numFiles;
						const thumbnailsDir = filenames.filter(file => file.endsWith('thumbnails'));
						if (thumbnailsDir.length === 0) {
							numFiles = filenames.length;
							thumbnail = null;
						} else if (thumbnailsDir.length === 1) {
							const thumbnails = fs.readdirSync(thumbnailsDir[0]).map(item => `${thumbnailsDir}/${item}`);
							if (thumbnails.length === 0) {
								thumbnail = null;
							} else {
								thumbnail = thumbnails[0];
							}

							numFiles = filenames.length - 1;
						} else {
							throw new Error(`found ${thumbnailsDir.length} thumbnailsDir, should be (1) `);
						}

						perClass[cN] = {
							filenames,
							key: config.classes[cN].key,
							description: config.classes[cN].description,
							params: config.classes[cN].params,
							numFiles,
							thumbnail
						};
					});
				});
			})

		),
		Promise.all(
			classNames.map(cN => {
				return getDirnames(config.classes[cN], destFolder).then(dirs => {
					return Promise.all(dirs.map(dir => {
						return readDir(dir).catch(error => { // eslint-disable-line no-unused-vars
							return [];
						});
					})).then(filenames => {
						let main;
						const sub = [];
						if (config.classes[cN].params) {
							config.classes[cN].params.forEach((param, index) => {
								if (index === 0 && config.classes[cN].params.length > 1) {
									main = param;
								} else {
									const choices = [];
									filenames.forEach((f, ind) => {
										let numFiles;
										let thumbnail;
										const thumbnailsDir = f.filter(file => file.endsWith('thumbnails'));
										if (thumbnailsDir.length === 0) {
											numFiles = f.length;
											thumbnail = null;
										} else if (thumbnailsDir.length === 1) {
											const thumbnails = fs.readdirSync(thumbnailsDir[0]).map(item => `${thumbnailsDir}/${item}`);
											if (thumbnails.length === 0) {
												thumbnail = null;
											} else {
												thumbnail = thumbnails[0];
											}

											numFiles = f.length - 1;
										} else {
											throw new Error(`found ${thumbnailsDir.length} thumbnailsDir, should be (1) `);
										}

										const key = param.choices[ind] ? param.choices[ind].key : param.choices[ind - param.choices.length].key;
										const description = param.choices[ind] ? param.choices[ind].description : param.choices[ind - param.choices.length].description;
										const value = param.choices[ind] ? param.choices[ind].value : param.choices[ind - param.choices.length].value;
										const label = param.choices[ind] ? param.choices[ind].label : param.choices[ind - param.choices.length].label;
										choices.push({
											key,
											value,
											label,
											numFiles,
											thumbnail,
											description
										});
									});
									const subPn = {
										label: param.label,
										name: param.name,
										choices
									};
									sub.push(subPn);
								}
							});
						}

						perParams[cN] = {
							main, sub
						};
					});
				});
			})
		)
	]).then(() => {
		return {
			source: srcInfo,
			classes: perClass,
			params: perParams
		};
	});
};
