const ejs = require('ejs');

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
* @property {string} value value to use in ejs template
*/

/**
* @typedef {object} ClassDef
* @property {string} key the keyboard key that do this action when pressed
* @property {string} dir the output directory where to move annotated images
* @property {Array.<ClassDefParam>} params the output directory where to move annotated images
*/

/**
* @param {ClassDef} classDef
* @param {String} destDir - a path to a destination folder
* @return {Promise.<Array.<String>>}
*/

module.exports = function (classDef, destDir) {
	let combinatory = [{}];
	if (Array.isArray(classDef.params)) {
		const names = [];
		classDef.params.forEach(p => {
			names.push(p.name);
			const values = [];
			p.choices.forEach(c => {
				values.push(c.value);
			});
			const newCombinatory = [];
			combinatory.forEach(combi => {
				values.forEach(v => {
					const opt = {};
					opt[p.name] = v;
					newCombinatory.push(Object.assign({}, combi, opt));
				});
			});
			combinatory = newCombinatory;
		});
	}

	return Promise.resolve(combinatory.map(c => {
		return destDir + '/' + ejs.render(classDef.dir, c);
	}));
};
