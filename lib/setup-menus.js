const electron = require('electron');
const path = require('path');
// Const r = require('../lib/src/config/config')

const {app, BrowserWindow} = electron;
const isOSX = process.platform === 'darwin';

module.exports = function () {
	const menuTemplate = [
		{
			label: 'View',
			submenu: [
				{
					label: 'Toggle Developer Tools',
					accelerator: isOSX ? 'Alt+Command+I' : 'Ctrl+Shift+I',
					click(item, focusedWindow) {
						if (focusedWindow) {
							focusedWindow.webContents.toggleDevTools();
						}
					}
				}
			]
		}, {
			label: 'Configuration',
			submenu: [
				{
					label: 'Add video directory',
					accelerator: isOSX ? 'Alt+Command+C' : 'Ctrl+Shift+C',
					click(item, focusedWindow) {
						const top = focusedWindow;
						const win = new BrowserWindow({parent: top, title: 'ADD MEDIA DIRECTORY', width: 300, height: 300});
						win.loadURL(path.join('file://', __dirname, 'src/config/config.html'));
						win.focus();
					}
				}
			]

		}
	];

	if (isOSX) {
		const name = electron.app.getName();
		menuTemplate.unshift({
			label: name,
			submenu: [
				{
					label: 'About ' + name,
					role: 'about'
				},
				{
					type: 'separator'
				},
				{
					label: 'Quit',
					accelerator: 'Command+Q',
					click() {
						app.quit();
					}
				}
			]
		});
	}

	const menu = electron.Menu.buildFromTemplate(menuTemplate);
	electron.Menu.setApplicationMenu(menu);
};
