const electron = require('electron');

const {app} = electron;
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
