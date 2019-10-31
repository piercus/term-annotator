const fs = require('fs');

const readdir = function (dir) {
	return new Promise((resolve, reject) => {
		fs.readdir(dir, (err, res) => {
			if (err) {
				return reject(err);
			}

			// Remove hidden files
			resolve(res.filter(item => item[0] !== '.').map(item => dir + '/' + item));
		});
	});
};

module.exports = function (dir, {recursive = false, filter = null} = {}) {
	if (recursive) {
		return readdir(dir).then(filenames => {
			return Promise.all(filenames.map(filename => {
				return new Promise((resolve, reject) => {
					fs.stat(filename, (err, stat) => {
						if (err) {
							return reject(err);
						}

						resolve(stat);
					});
				}).then(stat => {
					if (stat && stat.isDirectory()) {
						return readdir(filename, {recursive});
					}

					return [filename];
				});
			})).then(dblArray => {
				// Flatten the result
				return dblArray.reduce((a, b) => a.concat(b), []);
			}).then(filenames => {
				if (filter) {
					const reg = new RegExp(filter);
					return filenames.filter(f => f.match(reg));
				}

				return filenames;
			});
		});
	}

	return readdir(dir);
};
