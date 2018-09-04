const mkdirp = require('mkdirp');
/**
* @param {Config} config
*/
module.exports = function(config){
	
	for (var className in config.classes) if(Object.prototype.hasOwnProperty.call(config.classes, className)){
		mkdirp.sync(config.classes[className].dir);
	}
	
}