const electron = require('electron');
const isDevMode = process.env.NODE_ENV === 'development';
const BrowserWindow = electron.BrowserWindow;

module.exports = function () {
	const {width: screenWidth, height: screenHeight} = electron.screen.getPrimaryDisplay().workAreaSize;
	const space = 50;
	const x = space;
	const y = space;
	const width = screenWidth - space * 2;
	const height = screenHeight - space * 2;

	const mainWindow = new BrowserWindow({
		defaultEncoding: 'utf8',
		// Setting to true doesn't work in Windows
		// https://github.com/electron/electron/issues/6036
		// fullscreen: false,
		fullscreenable: true,
		defaultEncoding: 'utf8',
		x,
		y,
		width,
		height
	});

	mainWindow.loadURL(`file://${__dirname}/src/index.html`);
	if (isDevMode) {
		mainWindow.webContents.openDevTools();
	}

	// Open links in browser
	const mainWebContents = mainWindow.webContents;
	const handleRedirect = (e, url) => {
		if (url != mainWebContents.getURL()) {
			e.preventDefault();
			electron.shell.openExternal(url);
		}
	};

	mainWebContents.on('will-navigate', handleRedirect);
	mainWebContents.on('new-window', handleRedirect);
	mainWebContents.on('dom-ready', () => {
		if (!isDevMode) {
			mainWindow.setFullScreen(true);
		}
	});

	return {
		mainWindow,
		mainWebContents
	};
};
