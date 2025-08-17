const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { startServer, stopServer } = require('./server');

let mainWindow;
let serverReady = false;
let serverPort = process.env.PORT || 3000;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 700,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false
        },
        title: 'ESP32 Blockly IDE',
        show: false,
        icon: path.join(__dirname, 'assets', 'icon.png') // Add icon if you have one
    });

    createMenu();
    if (serverReady) {
        mainWindow.loadURL(`http://localhost:${serverPort}`);
        mainWindow.show();
    }
    mainWindow.on('closed', () => { mainWindow = null; stopServer(); });
}

// server logic moved to server.js

function createMenu() {
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New Project',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        if (mainWindow) {
                            mainWindow.reload();
                        }
                    }
                },
                {
                    label: 'Save Project',
                    accelerator: 'CmdOrCtrl+S',
                    click: () => {
                        // TODO: Implement save functionality
                        console.log('Save project (not implemented yet)');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Exit',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About ESP32 Blockly IDE',
                    click: () => {
                        const aboutWindow = new BrowserWindow({
                            width: 400,
                            height: 300,
                            parent: mainWindow,
                            modal: true,
                            webPreferences: {
                                nodeIntegration: false
                            }
                        });

                        const aboutHtml = `
                            <html>
                                <head><title>About</title></head>
                                <body style="font-family: Arial; padding: 20px; text-align: center; background: #f8f9fa;">
                                    <h2 style="color: #2c3e50;">ESP32 Blockly IDE</h2>
                                    <p>Version 1.0.0</p>
                                    <p>Visual programming environment for ESP32</p>
                                    <p style="margin-top: 30px; color: #7f8c8d; font-size: 12px;">
                                        Built with Blockly, Electron, and Node.js
                                    </p>
                                </body>
                            </html>
                        `;

                        aboutWindow.loadURL('data:text/html,' + encodeURIComponent(aboutHtml));
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady()
    .then(async () => {
        process.env.PORT = serverPort;
        await startServer({ port: serverPort });
        serverReady = true; // even if null (handled internal)
    })
    .finally(() => createWindow());

app.on('window-all-closed', () => {
    stopServer();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.on('before-quit', () => {
    stopServer();
});

// Handle certificate errors for development
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    if (url.startsWith('http://localhost:')) {
        event.preventDefault();
        callback(true);
    } else {
        callback(false);
    }
});