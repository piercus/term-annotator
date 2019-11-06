const ejs = require('ejs');
/**
* @param {ClassDef} classDef
* @return {Promise.<Array.<String>>}
*/

module.exports = function (classDef) {
	// Const dirnames = [];
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
		return ejs.render(classDef.dir, c);
	}));
};
