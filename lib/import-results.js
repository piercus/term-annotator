const fs = require('fs');
const electron = require('electron');

const {dialog} = electron;
const Store = require('electron-store');

const store = new Store();
const gifFrames = require('gif-frames');
const rename = require('./rename');
const createFolder = require('./create-folder');
// Const importConfiguration = require('./import-configuration')

module.exports = function () {
	const annotationPath = dialog.showOpenDialogSync({
		properties: ['openFile'],
		title: 'CHOOSE EXISTED ANNOTATION FILE'
	})[0];

	const inputDir = dialog.showOpenDialogSync({
		properties: ['openDirectory'],
		title: 'CHOOSE SOURCE DIRECTORY'
	});

	const outputDir = dialog.showOpenDialogSync({
		properties: ['openDirectory'],
		title: 'CHOOSE DIRECTORY TO OUTPUT FILES'
	});

	const configFilePath = dialog.showOpenDialogSync({
		properties: ['openFile'],
		title: 'CHOOSE CONFIGURATION FILE'
	});

	if (!inputDir || !outputDir || !annotationPath || !configFilePath) {
		console.log('Input/Output/Annotation should be chousen');
		return Promise.resolve();
	}

	const loadedConfig = JSON.parse(fs.readFileSync(configFilePath[0], 'utf8'));
	loadedConfig.source.dir = inputDir[0];

	const opt = JSON.parse(fs.readFileSync(annotationPath, 'utf8'));

	const classNames = Object.keys(opt.categories);
	return Promise.all(classNames.map(cN => {
		if (opt.categories[cN][0].choices) {
			const match = loadedConfig.classes[cN].dir.match(/(\S*)\/(\S*)$/);
			if (match) {
				const subDir = new RegExp(match[1]);
				console.log(subDir);
				console.log(loadedConfig.classes[cN].dir.replace(subDir, outputDir));
				loadedConfig.classes[cN].dir = loadedConfig.classes[cN].dir.replace(subDir, outputDir);
			}

			opt.categories[cN][0].choices.forEach(choice => {
				createFolder(`${outputDir}/${choice.dir}`);
				return new Promise((resolve, reject) => {
					if (choice.thumbnail) {
						createFolder(`${outputDir}/${choice.dir}/thumbnails`);
						const thumbnailGif = inputDir + '/' + choice.thumbnail.replace(/.png/, '.gif');
						gifFrames({url: thumbnailGif, frames: 0, outputType: 'png'}, (err, frameData) => {
							if (err) {
								reject(err);
							}

							if (frameData) {
								frameData[0].getImage().pipe(fs.createWriteStream(`${outputDir}/${choice.dir}/thumbnails/${choice.thumbnail}`));
							}

							return resolve();
						});
					} else {
						return resolve();
					}
				}).then(() => {
					choice.filenames.forEach(f => {
						return rename({
							src: `${inputDir}/${f}`,
							dest: `${outputDir}/${choice.dir}/${f}`
						});
					});
				});
			});
		} else {
			return new Promise((resolve, reject) => {
				loadedConfig.classes[cN].dir = `${outputDir}/${opt.categories[cN][0].dir}`;
				if (opt.categories[cN][0].thumbnail) {
					createFolder(`${outputDir}/${opt.categories[cN][0].dir}/thumbnails`);
					const thumbnailGif = inputDir + '/' + opt.categories[cN][0].thumbnail.replace(/.png/, '.gif');
					gifFrames({url: thumbnailGif, frames: 0}, (err, frameData) => {
						if (err) {
							reject(err);
						}

						frameData[0].getImage().pipe(fs.createWriteStream(`${outputDir}/${opt.categories[cN][0].dir}/thumbnails/${opt.categories[cN][0].thumbnail}`));
						resolve();
					});
				} else {
					resolve();
				}
			}).then(() => {
				createFolder(`${outputDir}/${opt.categories[cN][0].dir}`);
				opt.categories[cN][0].filenames.forEach(f => {
					return rename({
						src: `${inputDir}/${f}`,
						dest: `${outputDir}/${opt.categories[cN][0].dir}/${f}`
					});
				});
			});
		}
		// Store.set('config', loadedConfig);

		// const updatedConfig = store.get('config');
		// // return Promise.resolve(updatedConfig);
		return null;
	})).then(() => {
		store.set('config', loadedConfig);
		const updatedConfig = store.get('config');
		return Promise.resolve(updatedConfig);
	});
};
