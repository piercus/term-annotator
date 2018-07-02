var electron = require('electron');
var {ipcMain} = electron;
const fs = require('fs');
const path = require('path');
const getAllInfo = require('./get-all-info')
/**
* @param {Config} config
*/
module.exports = function(config){
	/**
	* @param {string} opts.image
	* @param {string} opts.className
	* @return {Promise.<FolderInfo>} the info about src folder
	*/
	const onCategorize = function(opts){
		if(!config.classes[opts.className].dir){
			return Promise.reject(new Error(opts.className + ' is not a valid class in config'))
		}
		const name = path.basename(opts.image);
		return rename({
			src: opts.image,
			dest: config.classes[opts.className].dir + '/' + name
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
			fs.rename(opts.src, opts.dest, err => {
				if(err){
					return reject(err);
				}
				resolve();
			});
		}).then(getAllInfo.bind(this, config));
	}
	// Listen for async message from renderer process
	/**
	* @param {string} opts.image
	* @param {string} opts.className
	* @return {Promise.<FolderInfo>} the info about src folder
	*/
	const onUncategorize = function(opts){
		if(!config.classes[opts.className].dir){
			return Promise.reject(new Error(opts.className + ' is not a valid class in config'))
		}
		const name = path.basename(opts.image);
		return rename({
			src: config.classes[opts.className].dir + '/' + name,
			dest: opts.image
		});
	};
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
	ipcMain.on('get-all-info', (event, arg) => {
		console.log('server, get-all-info')
		return getAllInfo(config).then(r => {
			event.sender.send('all-info', r);
		}, err => {
			console.log(err);

			event.sender.send('error', err);
		})
	});
}
