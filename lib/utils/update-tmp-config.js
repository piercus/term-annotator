const fs = require('fs');
const Store = require('electron-store');

const store = new Store();
/**
 * @param
 * @returns {} tmp config is upated
 */

module.exports = function () {
	const config = store.get('config');

	const tmpConfigPath = `${config.source.dir}/.term-annotator`;
	fs.writeFileSync(tmpConfigPath, JSON.stringify(config, null, 4));
};
