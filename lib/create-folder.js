const mkdirp = require('mkdirp');
/**
* @param {Config} config
*/
module.exports = function(dir){
	mkdirp.sync(dir);
}