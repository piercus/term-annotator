const fs = require('fs');
const electron = require('electron');

const {dialog} = electron;

const getDirnames = require('./get-dirnames');
const readDir = require('./read-dir');

module.exports = function (options) {
	const classNames = Object.keys(options.classes);
	const categories = {};
	return Promise.all(classNames.map(cN => {
		return getDirnames(options.classes[cN]).then(dirs => {
			return Promise.all(dirs.map(dir => {
				return readDir(dir).catch(error => { // eslint-disable-line no-unused-vars
					return [];
				}).then(filenames => {
					return {filenames, dir: escapeFilename(dir)};
				});
			})).then(data => {
				const sub = [];

				if (options.classes[cN].params) {
					options.classes[cN].params.forEach((param, index) => {
						if (index !== 0) {
							const choices = [];
							data.forEach(f => {
								let thumbnail;
								let files;
								const thumbnailsDir = f.filenames.filter(file => file.endsWith('thumbnails'));
								if (thumbnailsDir.length === 0) {
									thumbnail = null;
									files = f.filenames;
								} else if (thumbnailsDir.length === 1) {
									const thumbnails = fs.readdirSync(thumbnailsDir[0]).map(item => `${thumbnailsDir}/${item}`);
									if (thumbnails.length === 0) {
										thumbnail = null;
									} else {
										thumbnail = escapeThumbname(thumbnails[0]);
									}

									files = f.filenames.filter(file => !file.endsWith('thumbnails'));
								} else {
									throw new Error(`found ${thumbnailsDir.length} thumbnailsDir, should be (1) `);
								}

								const {dir} = f;
								choices.push({
									thumbnail,
									filenames: escapeFilename(files),
									dir
								});
							});
							const subPn = {
								choices
							};
							sub.push(subPn);
						}
					});
				} else {
					const files = data[0].filenames.filter(file => !file.endsWith('thumbnails'));
					sub.push({
						filenames: escapeFilename(files),
						thumbnail: null,
						dir: data[0].dir
					});
				}

				categories[cN] = sub;
			});
		});
	})).then(() => {
		const annotationRes = {};
		annotationRes.epoch = new Date().toISOString();
		annotationRes.categories = categories;
		const savePath = dialog.showSaveDialogSync({
			defaultPath: '~/annotation.json',
			title: 'save annotation'
		});
		if (savePath) {
			fs.writeFileSync(savePath, JSON.stringify(annotationRes, null, 2), 'utf-8');
		}
	});
};

const escapeFilename = function (filenames) {
	if (Array.isArray(filenames)) {
		return filenames.map(f => f.match(/[-_.0-9a-z]*$/)[0].replace(/-([.0-9]{1,4}).gif$/, '.gif'));
	}

	return filenames.match(/[-_.0-9a-z]*$/)[0].replace(/-([.0-9]{1,4}).gif$/, '.gif');
};

const escapeThumbname = function (filenames) {
	if (Array.isArray(filenames)) {
		return filenames.map(f => f.match(/[-_.0-9a-z]*$/)[0].replace(/-([.0-9]{1,4}).png$/, '.png'));
	}

	return filenames.match(/[-_.0-9a-z]*$/)[0].replace(/-([.0-9]{1,4}).png$/, '.png');
};

