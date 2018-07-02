const helpMessage = require('./help-message');
/**
* @typedef {object} ClassDef
* @property {string} key the keyboard key that do this action when pressed
* @property {string} dir the output directory where to move annotated images
*/


/**
* @typedef {object} Config
* @property {object} source
* @property {string} source.dir
* @property {boolean} source.recursive
* @property {object.<string, ClassDef>} classes classes definition
* @example
{
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
	}
}
*/

/**
* @typedef {object} FolderInfo
* @property {number} numFiles
* @property {string} randomFilename
* @property {Array.<string>} filenames
*/
/**
* @param {Config} options
* @return {null}
*/

const termAnnotator = function(options){

	let remainingImages = 0;
	let randomImage;
	let numberPerClass = {};

	const classNames = Object.keys(options.classes);

	return Promise.all([
			scanFolder(options.source).then(srcInfo => {
				remainingImages = numFiles;
				randomImage = srcInfo.randomFilename;
			}),
			Promise.all(
				classNames.map(cN => {
						return scanFolder(options.classes[cN])
							.then(n => {
								numberPerClass[cN] = n;
							})
					})
			)
		])
		.then(() => {
			if(remainingImages > 0){
				console.log(helpMessage(config));
				termImg(randomImage, {fallback});
			} else {
				console.log('That\'s all folks !')
				return Promise.resolve()
			}
		})
};

module.exports
