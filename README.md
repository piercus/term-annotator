# Electron Hello World

Getting Electron to a shipable app is not completely straight forward. Here's a working
repo and some terse instructions

Note: The steps below are what I did to create this repo. [See below if clone this repo](#Cloning This Repo)

1.  Install [node.js](https://nodejs.org)
2.  Open a terminal or "node command prompt"
3.  Make a folder like `myproject` (`mkdir myproject`)
4.  cd into the folder `cd myproject`
5.  Type `npm init` and except the defaults
6.  Type `npm install --save-dev electron`
6.  Type `npm install --save-dev electron-builder`
6.  Type `npm install --save-dev cross-env`
7.  Make a file called `index.js`. Inside put this

        "use strict";

        const isOSX = process.platform === 'darwin';
        const isDevMode = process.env.NODE_ENV === 'development';

        const electron = require('electron');
        const webContents = electron.webContents;
        const path = require('path');
        const fs = require('fs');

        const app = electron.app;
        const BrowserWindow = electron.BrowserWindow;
        let mainWindow = null;
        let mainWebContents = null;

        function createWindow() {
          const {width: screenWidth, height: screenHeight} = electron.screen.getPrimaryDisplay().workAreaSize;
          const space = 50;
          const x = space;
          const y = space;
          const width = screenWidth - space * 2;
          const height = screenHeight - space * 2;

          mainWindow = new BrowserWindow({
            defaultEncoding: "utf8",
            // setting to true doesn't work in Windows
            // https://github.com/electron/electron/issues/6036
            // fullscreen: false,
            fullscreenable: true,
            defaultEncoding: "utf8",
            x: x,
            y: y,
            width: width,
            height: height,
          });

          mainWindow.loadURL(`file://${__dirname}/src/index.html`);
          if (isDevMode) {
            mainWindow.webContents.openDevTools();
          }

          // open links in browser
          mainWebContents = mainWindow.webContents;
          const handleRedirect = (e, url) => {
            if(url != mainWebContents.getURL()) {
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
        }

        app.on('ready', () => {
          setupMenus();
          createWindow();
        });

        app.on('window-all-closed', () => {
          mainWebContents = null;
        });

        function setupMenus() {
          const menuTemplate = [
            {
              label: 'View',
              submenu: [
                {
                  label: 'Toggle Developer Tools',
                  accelerator: isOSX ? 'Alt+Command+I' : 'Ctrl+Shift+I',
                  click(item, focusedWindow) {
                    if (focusedWindow)
                      focusedWindow.webContents.toggleDevTools();
                  }
                },
              ]
            },
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
                  click() { app.quit(); }
                },
              ]
            });
          }

          const menu = electron.Menu.buildFromTemplate(menuTemplate);
          electron.Menu.setApplicationMenu(menu);
        }

9. Edit your package.json to look like this

        {
          "name": "myproject",
          "version": "1.0.0",
          "description": "",
          "main": "index.js",
          "scripts": {
            "start": "cross-env NODE_ENV=development electron index.js",
            "startp": "cross-env NODE_ENV=production electron index.js",
            "pack": "build --dir",
            "dist": "build"
          },
          "author": "",
          "license": "MIT",
          "devDependencies": {
            "cross-env": "^5.0.1",
            "electron": "^1.6.11",
            "electron-builder": "^19.4.2"
          }
        }

    note: the numbers inside `devDependencies` don't matter. They should
    stay whatever they were as they'll change anytime to the latest versions
    when you first follow the steps above

10. make a file `src/index.html` (as in make folder called `src` and put `index.html` inside.
    It should have this contents

        <h1>Hello World</h1>
        <div>count: <span id="count"></span></div>
        <div>time: <span id="time"></span></div>
        <script src="main.js"></script>

10. make a file `src/main.js` put this inside

        const countElem = document.querySelector("#count");
        const timeElem = document.querySelector("#time");

        let count = 0;

        function render(time) {
          time *= 0.001;  // seconds
          ++count;

          countElem.textContent = count;
          timeElem.textContent = time.toFixed(2);

          requestAnimationFrame(render);
        }
        requestAnimationFrame(render);


## Try It

Now try running it. You should be able to type `npm run start` and it should start
in a window with the devtools opened and an electron window with "Hello World" and a
time and count. Quit it and type `npm run startp` (p = production). In this case it
should open fullscreen.

## Build Executable

If it's working now you can follow the steps from the
[electron-builder "Quick Setup Guide"](https://github.com/electron-userland/electron-builder).
Like it says you should fill out the fields like "author" that
we didn't fill out above. You should also add a section called "build"
to `package.json`. The entire file should look something like this

        {
          "name": "myproject",
          "version": "1.0.0",
          "description": "",
          "main": "index.js",
          "scripts": {
            "start": "cross-env NODE_ENV=development electron index.js",
            "startp": "cross-env NODE_ENV=production electron index.js",
            "pack": "build --dir",
            "dist": "build"
          },
          "author": "",
          "license": "MIT",
          "devDependencies": {
            "cross-env": "^5.0.1",
            "electron": "^1.6.11",
            "electron-builder": "^19.4.2"
          },
          "build": {
            "appId": "your.id",
            "mac": {
              "category": "your.app.category.type"
            }
          }
        }

**PAY ATTENTION TO THE COMMAs and NO COMMAs**. If you have one in the wrong place or
are missing one from the wrong place things won't work.

After that you MUST make icons like it says and put them in a `build` folder.
To make the icons I've uploaded a 256x256 image to [this website](https://iconverticons.com/online/)
and then clicked the links to download the ICO and ICNS files and saved them as `build/icon.ico` and
`build/icon.icns`

When you're done you should have this

   +-build
   |  |
   |  +-icon.ico
   |  +-icon.icns   // if you want a mac version
   |
   +-src
   |  +-index.html
   |  +-main.js
   |
   +-index.js
   +-package.json
   +-node_modules   // there's a bunch of stuff in here installed by npm above

Now type `npm run pack`. This will make an .exe in the `dist` folder if you're on Windows or an app if you're on mac.

To make something to ship type `npm run dist`. This will make an installer if on Windows or a `.DMG` file if on mac.

Now replace `index.html` and `main.js` with your app.

Some notes:

* Be sure to check out the [electron docs](https://electron.atom.io/docs/).
* Be aware that you're not running in the browser. You're running in electron. That means you can do things
  like read and write files directly, things you can't do in a browser.
* Don't let user code run in Electron. That user code will also be able to read and write files, launch apps, etc.
* Read the [electron-builder docs](https://github.com/electron-userland/electron-builder) for how to sign your app.
  If you don't sign your app then the user will be warned that it's an untrusted app and have to take special steps
  to install it.

#Cloning this repo

If you cloned this repo follow these steps to see it work

1. Install [node.js](https://nodejs.org).
2. Open a terminal or "node command prompt"
3. Clone the repo (or download the zip and unzip)
4. cd into the repo `cd electron-hello-world`
5. type `npm install`
6. Jump to [Try It](#Try-It) above.

