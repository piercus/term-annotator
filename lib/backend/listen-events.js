const electron = require('electron');

const {ipcMain} = electron;
const fs = require('fs');
const path = require('path');
const mv = require('mv');
const ejs = require('ejs');
const Store = require('electron-store');
const gifFrames = require('gif-frames');
const createFolder = require('../utils/create-folder');
const createWindow = require('../utils/create-child-window.js');
const getAllInfo = require('./get-all-info');
const splitVideo = require('./split-video');
const exportResults = require('./export-results');
const importResults = require('./import-results');
const importConfiguration = require('./import-configuration');
const nextThumbnail = require('./next-thumbnail');

const store = new Store();

/**
 * @typedef {Object} Source  - source opts
 * @property {string} source.dir - source dir
 * @property {boolean} source.recursive - recursive true/false
 * @property {String} [source.subDir] - if specified, use files from : source.dir/subDir
 */

/**
 * @typedef {Object} Destination - destination options
 * @property {String} dir - dest dir
 * @property {String} [subDir]  - dest subDir
 * */

/**
 * @typedef {object} Config
 * @property {boolean} sort if true the images are annotated in the filename alhpabetic order
 * @property {Source} source - source opts
 * @property {Destination} destination - destination options
 * @property {String} [mediaType='image'] - can be 'video' or 'image'
 * @property {object.<string, ClassDef>} classes classes definition
 */

/**
 * @param {Config} config - config
 */
module.exports = function (config) {
	let queue = [];
	/**
		* @param {object} opts - opts
		* @param {string} opts.media - media type
		* @param {string} opts.className - classname
		* @param {string} opts.answers - ejs dict values
		* @return {Promise.<FolderInfo>} the info about src folder
		*/
	const onCategorize = function (opts) {
		if (!config.classes[opts.className].dir) {
			return Promise.reject(new Error(opts.className + ' is not a valid class in config'));
		}

		let name;
		if (config.source.renaming) {
			name = opts.media.replace(path.join(`${__dirname}`, '..', config.source.dir) + '/', '').replace(new RegExp(config.source.renaming.from, 'g'), config.source.renaming.to);
		} else {
			name = path.basename(opts.media);
		}

		const destFolder = (config.destination.destSubDir) ? `${config.destination.dir}/${config.destination.destSubDir}` : config.destination.dir;
		const dirname = destFolder + '/' + ejs.render(config.classes[opts.className].dir, opts.answers || {});
		createFolder(dirname);
		return new Promise((resolve, reject) => {
			const thumbnailsDir = `${dirname}/thumbnails`;
			if (!fs.existsSync(thumbnailsDir)) {
				const thumbnailName = name.replace(/gif/, 'png');
				fs.mkdirSync(thumbnailsDir);
				gifFrames({url: opts.media, frames: 0}, (err, frameData) => {
					if (err) {
						reject(err);
					}

					frameData[0].getImage().pipe(fs.createWriteStream(`${thumbnailsDir}/${thumbnailName}`));
					resolve();
				});
			} else if (fs.existsSync(thumbnailsDir)) {
				resolve();
			}
		}).then(() => {
			return rename({
				src: opts.media,
				dest: dirname + '/' + name
			});
		});
	};

	/**
	* @param {Object} opts - opts
	* @param {string} opts.src - src
	* @param {string} opts.dest - dest
	* @return {Promise.<FolderInfo>} the info about src folder
	*/
	const rename = function (opts) {
		if (typeof (opts.dest) !== 'string' || typeof (opts.src) !== 'string') {
			return Promise.reject(new Error('dest and src must be strings'));
		}

		return new Promise((resolve, reject) => {
			mv(opts.src, opts.dest, err => {
				if (err) {
					return reject(err);
				}

				resolve();
			});
		}).then(getAllInfo.bind(this, store.get('config'), queue));
	};

	// Listen for async message from renderer process
	/**
	* @param {Object} opts - opts
	* @param {string} opts.media - media type (images.video)
	* @param {string} opts.className - classname
	* @return {Promise.<FolderInfo>} the info about src folder
	*/
	const onUncategorize = function (opts) {
		return Promise.resolve().then(() => {
			if (opts.className) {
				if (!config.classes[opts.className].dir) {
					return Promise.reject(new Error(opts.className + ' is not a valid class in config'));
				}

				let name;
				if (config.source.renaming) {
					name = opts.media.replace(path.join(`${__dirname}`, '..', config.source.dir) + '/', '').replace(new RegExp(config.source.renaming.from, 'g'), config.source.renaming.to);
				} else {
					name = path.basename(opts.media);
				}

				const dirname = ejs.render(config.classes[opts.className].dir, opts.answers || {});

				return rename({
					src: dirname + '/' + name,
					dest: opts.media
				});
			}

			return getAllInfo(store.get('config'), queue);
		}).then(res => {
			res.source.nextFilename = opts.media;
			return res;
		});
	};

	// Listen for async message from renderer process
	/**
	* @param {Object} opts - opts
	* @param {string} opts.media - media type (images.video)
	* @param {string} opts.splitPosition - splitPosition
	* @return {Promise} the info about src folder
	*/
	const onSplitVideo = function ({media, splitPosition}) {
		return splitVideo({
			filename: media,
			splitPosition,
			startEndRegexp: config.source.videoSplit.startEndRegexp,
			minDuration: config.source.videoSplit.minDuration
		}).then(filenames => {
			queue = filenames.concat(queue);
			return getAllInfo(store.get('config'), queue);
		});
	};

	ipcMain.on('categorize', (event, arg) => {
		onCategorize(arg).then(r => {
			event.sender.send('all-info', r);
		}, err => {
			console.log(err);
			event.sender.send('error', err);
		});
	});
	// Listen for async message from renderer process
	ipcMain.on('uncategorize', (event, arg) => {
		onUncategorize(arg).then(r => {
			event.sender.send('all-info', r);
		}, err => {
			console.log(err);

			event.sender.send('error', err);
		});
	});

	// Listen for async message from renderer process
	ipcMain.on('split-video', (event, arg) => {
		onSplitVideo(arg).then(r => {
			event.sender.send('all-info', r);
		}, err => {
			console.log(err);

			event.sender.send('error', err);
		});
	});

	// Listen for async message from renderer process
	ipcMain.on('get-all-info', event => {
		console.log('server, get-all-info');
		return getAllInfo(config, queue).then(r => {
			event.sender.send('all-info', r);
		}, err => {
			console.log(err);
			event.sender.send('error', err);
		});
	});

	// Listen for async message from renderer process
	ipcMain.on('import-config', event => {
		console.log('server, import configuration');
		return importConfiguration().then(updatedConfig => {
			if (Object.keys(updatedConfig).length === 0 && updatedConfig.constructor === Object) {
				event.sender.send('import-config');
			} else {
				return getAllInfo(updatedConfig, queue).then(r => {
					config = updatedConfig;
					event.sender.send('all-info', r);
				});
			}
		}, err => {
			console.log(err);
			event.sender.send('error', err);
		});
	});

	ipcMain.on('export-results', event => {
		console.log('server, export results');
		return exportResults().then(() => {
			event.sender.send('export');
		}, err => {
			event.sender.send('error', err);
		});
	});
	ipcMain.on('import-results', event => {
		console.log('server, import results');
		return importResults().then(updatedConfig => {
			if (updatedConfig) {
				return getAllInfo(updatedConfig, queue).then(r => {
					config = updatedConfig;
					event.sender.send('all-info', r);
				});
			}
		}, err => {
			console.log(err);
			event.sender.send('error', err);
		});
	});
	ipcMain.on('next-thumbnail', (event, arg) => {
		console.log('server, show next thumbnail');
		return nextThumbnail(arg).then(() => {
			console.log('server, get-all-info');
			return getAllInfo(config, queue).then(r => {
				event.sender.send('all-info', r);
			});
		}, err => {
			console.log(err);
			event.sender.send('error', err);
		});
	});

	ipcMain.on('add-class-window', (event, arg) => {
		const {parenWindow, tmpl, label} = arg;
		return createWindow({parenWindow, tmpl, label}).then(() => {
			const updatedConfig = store.get('config');
			return getAllInfo(updatedConfig, queue).then(r => {
				config = updatedConfig;
				event.sender.send('all-info', r);
			}, err => {
				console.log(err);
				event.sender.send('error', err);
			});
		});
	});
};
