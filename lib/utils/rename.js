/**
* @param {Object} opts - opts
* @param {string} opts.src - src
* @param {string} opts.dest - dest
* @return {Promise.<FolderInfo>} the info about src folder
*/
const Store = require('electron-store');
const mv = require('mv');
const getAllInfo = require('../backend/get-all-info');

const store = new Store();
module.exports = function (opts) {
	const queue = [];
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
