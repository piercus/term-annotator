var electron = require('electron');
var {ipcMain} = electron;
const fs = require('fs');
const mv = require('mv');
const path = require('path');
const getAllInfo = require('./get-all-info')
const splitVideo = require('./split-video')
const createFolder = require('./create-folder');
const ejs = require('ejs');

/**
* @param {Config} config
*/
module.exports = function(config){
	
	let queue = [];
	/**
	* @param {string} opts.media
	* @param {string} opts.className
	* @param {string} opts.answers - ejs dict values
	* @return {Promise.<FolderInfo>} the info about src folder
	*/
	const onCategorize = function(opts){
		if(!config.classes[opts.className].dir){
			return Promise.reject(new Error(opts.className + ' is not a valid class in config'))
		}
		let name;
		if(config.source.renaming){
			name = opts.media.replace(path.join(`${__dirname}`,'..',config.source.dir)+"/", "").replace(new RegExp(config.source.renaming.from, "g"), config.source.renaming.to);
		} else {
			name = path.basename(opts.media);
		}
		const dirname = ejs.render(config.classes[opts.className].dir,opts.answers || {})
		
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
	const rename = function(opts){

		if(typeof(opts.dest) !== 'string' || typeof(opts.src) !== 'string'){
			return Promise.reject(new Error('dest and src must be strings'))
		}
		return new Promise((resolve, reject) => {
			mv(opts.src, opts.dest, err => {
				if(err){
					return reject(err);
				}
				resolve();
			});
		}).then(getAllInfo.bind(this, config, queue));
	}
	// Listen for async message from renderer process
	/**
	* @param {string} opts.media
	* @param {string} opts.className
	* @return {Promise.<FolderInfo>} the info about src folder
	*/
	const onUncategorize = function(opts){
		return Promise.resolve().then(() => {
			if(opts.className){
				if(!config.classes[opts.className].dir){
					return Promise.reject(new Error(opts.className + ' is not a valid class in config'))
				}
				let name;
				if(config.source.renaming){
					name = opts.media.replace(path.join(`${__dirname}`,'..',config.source.dir)+"/", "").replace(new RegExp(config.source.renaming.from, "g"), config.source.renaming.to);
				} else {
					name = path.basename(opts.media);
				}
				const dirname = ejs.render(config.classes[opts.className].dir,opts.answers || {})

				return rename({
					src: dirname + '/' + name,
					dest: opts.media
				});
			} else {
				return getAllInfo(config, queue);
			}
		}).then(res => {
			res.source.nextFilename = opts.media;
			return res;
		})
	};
	// Listen for async message from renderer process
	/**
	* @param {string} opts.media
	* @param {string} opts.splitPosition
	* @return {Promise} the info about src folder
	*/
	const onSplitVideo = function({media, splitPosition}){
		return splitVideo({
			filename: media,
			splitPosition,
			startEndRegexp: config.source.videoSplit.startEndRegexp,
			minDuration: config.source.videoSplit.minDuration
		}).then(filenames => {
			queue = filenames.concat(queue);
			return getAllInfo(config, queue);
		})
	}
	
	ipcMain.on('categorize', (event, arg) => {
		onCategorize(arg).then(r => {
			event.sender.send('all-info', r);
		}, err => {
			console.log(err);
			event.sender.send('error', err);
		})
	});
	// Listen for async message from renderer process
	ipcMain.on('uncategorize', (event, arg) => {
		onUncategorize(arg).then(r => {
			event.sender.send('all-info', r);
		}, err => {
			console.log(err);

			event.sender.send('error', err);
		})
	});
	
	// Listen for async message from renderer process
	ipcMain.on('split-video', (event, arg) => {
		onSplitVideo(arg).then(r => {
			event.sender.send('all-info', r);
		}, err => {
			console.log(err);

			event.sender.send('error', err);
		})
	});	
	
	// Listen for async message from renderer process
	ipcMain.on('get-all-info', (event, arg) => {
		console.log('server, get-all-info')
		return getAllInfo(config, queue).then(r => {
			event.sender.send('all-info', r);
		}, err => {
			console.log(err);

			event.sender.send('error', err);
		})
	});
}
