const mkdirp = require('mkdirp');
/**
* @param {String} dir - directory path
*/
module.exports = function (dir) {
	mkdirp.sync(dir);
};
