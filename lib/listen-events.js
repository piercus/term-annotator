const electron = require('electron');

const {ipcMain} = electron;
const path = require('path');
const mv = require('mv');
const ejs = require('ejs');
const Store = require('electron-store');
const getAllInfo = require('./get-all-info');
const splitVideo = require('./split-video');
const createFolder = require('./create-folder');

const store = new Store();

/**
* @param {Config} config
*/
module.exports = function (config) {
	let queue = [];
	/**
	* @param {string} opts.media
	* @param {string} opts.className
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
		const dirname = ejs.render(config.classes[opts.className].dir, opts.answers || {});

		createFolder(dirname);

		return rename({
			src: opts.media,
			dest: dirname + '/' + name
		});
	};
	/**
	* @param {string} opts.src
	* @param {string} opts.dest
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
	* @param {string} opts.media
	* @param {string} opts.className
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
	* @param {string} opts.media
	* @param {string} opts.splitPosition
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
	ipcMain.on('get-all-info', (event, arg) => {
		console.log('server, get-all-info');
		return getAllInfo(config, queue).then(r => {
			event.sender.send('all-info', r);
		}, err => {
			console.log(err);
			event.sender.send('error', err);
		});
	});

	// Listen for async message from renderer process
	ipcMain.on('src-dir', (event, arg) => {
		console.log('server, get-all-info for new src dir');
		const updatedConfig = store.get('config');
		return getAllInfo(updatedConfig, queue).then(r => {
			config = updatedConfig;
			event.sender.send('all-info', r);
		}, err => {
			console.log(err);
			event.sender.send('error', err);
		});
	});
};
