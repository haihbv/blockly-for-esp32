const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const express = require('express');
const fs = require('fs');

let mainWindow;
let server;

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

    startServer();
    createMenu();

    mainWindow.on('closed', () => {
        mainWindow = null;
        stopServer();
    });
}

function startServer() {
    console.log('Starting ESP32 Blockly server...');

    try {
        const expressApp = express();
        const { execSync } = require('child_process');
        // Simple in-memory cache for port scanning results to avoid heavy repeated queries
        let portCache = { timestamp: 0, ports: [] };

        // Middleware
        expressApp.use(express.json({ limit: '10mb' }));
        expressApp.use(express.static('.'));

        // Routes
        expressApp.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'index.html'));
        });

        expressApp.post('/upload', async (req, res) => {
            try {
                const { code, port } = req.body;
                console.log(`Upload request: port=${port}, code length=${code.length}`);

                if (!code || !code.trim()) {
                    return res.status(400).json({ error: 'No code provided' });
                }

                // Create temp sketch directory
                const sketchDir = path.join(__dirname, 'temp_sketch');
                if (!fs.existsSync(sketchDir)) {
                    fs.mkdirSync(sketchDir, { recursive: true });
                }

                const sketchFile = path.join(sketchDir, 'temp_sketch.ino');
                fs.writeFileSync(sketchFile, code, 'utf8');

                console.log('Sketch file created:', sketchFile);

                // Use provided port or default
                const uploadPort = port || 'COM3';

                // Try Arduino CLI upload
                const compileCmd = `arduino-cli compile --fqbn esp32:esp32:esp32 "${sketchFile}"`;
                const uploadCmd = `arduino-cli upload -p ${uploadPort} --fqbn esp32:esp32:esp32 "${sketchFile}"`;

                try {
                    console.log('Compiling...');
                    execSync(compileCmd, { stdio: 'pipe', timeout: 30000 });

                    console.log('Uploading...');
                    execSync(uploadCmd, { stdio: 'pipe', timeout: 30000 });

                    res.json({
                        success: true,
                        stage: 'Upload Complete',
                        message: `Successfully uploaded to ${uploadPort}`
                    });
                } catch (cmdError) {
                    console.log('Arduino CLI not available or failed:', cmdError.message);

                    // Return success with manual instruction
                    res.json({
                        success: true,
                        stage: 'Code Generated',
                        message: `Code saved to ${sketchFile}. Please upload manually using Arduino IDE.`,
                        file: sketchFile
                    });
                }

            } catch (error) {
                console.error('Upload error:', error);
                res.status(500).json({
                    error: `Upload failed: ${error.message}`,
                    details: error.stack
                });
            }
        });

        // Compile only endpoint (no upload) --------------------
        expressApp.post('/compile', async (req, res) => {
            try {
                const { code } = req.body;
                console.log(`Compile request: code length=${code ? code.length : 0}`);

                if (!code || !code.trim()) {
                    return res.status(400).json({ error: 'No code provided' });
                }

                const sketchDir = path.join(__dirname, 'temp_sketch');
                if (!fs.existsSync(sketchDir)) {
                    fs.mkdirSync(sketchDir, { recursive: true });
                }
                const sketchFile = path.join(sketchDir, 'temp_sketch.ino');
                fs.writeFileSync(sketchFile, code, 'utf8');
                console.log('Sketch file written for compile:', sketchFile);

                const { execSync } = require('child_process');
                const compileCmd = `arduino-cli compile --fqbn esp32:esp32:esp32 "${sketchFile}"`;
                let compileOutput = '';
                try {
                    compileOutput = execSync(compileCmd, { encoding: 'utf8', stdio: 'pipe', timeout: 45000 });
                    res.json({
                        success: true,
                        stage: 'Compile Complete',
                        message: 'Compilation successful',
                        output: compileOutput,
                        file: sketchFile
                    });
                } catch (compileErr) {
                    console.log('Compile failed or arduino-cli missing:', compileErr.message);
                    res.status(200).json({
                        success: false,
                        stage: 'Compile Failed',
                        message: 'Compilation failed or arduino-cli not installed. You can still upload manually using Arduino IDE.',
                        error: compileErr.message,
                        file: sketchFile
                    });
                }
            } catch (error) {
                console.error('Compile endpoint error:', error);
                res.status(500).json({ error: `Compile failed: ${error.message}`, details: error.stack });
            }
        });

        expressApp.get('/ports', async (req, res) => {
            try {
                // Fast in-memory cache (already ensured above) still used for /ports endpoint
                const age = Date.now() - portCache.timestamp;
                if (age < 2500 && portCache.ports.length) {
                    return res.json({ ports: portCache.ports, cached: true });
                }

                // Lazy load utility to reduce initial startup time
                const { detectSerialPorts } = require('./utils/ports');
                const ports = await detectSerialPorts();
                portCache = { timestamp: Date.now(), ports };
                res.json({ ports, cached: false });
            } catch (error) {
                console.error('Port detection error:', error);
                // Fallback range (1..64)
                const fallbackPorts = Array.from({ length: 64 }, (_, i) => ({
                    path: `COM${i + 1}`,
                    manufacturer: 'Fallback',
                    description: 'Manual Select'
                }));
                res.json({ ports: fallbackPorts, fallback: true });
            }
        });

        // Start server
        server = expressApp.listen(3000, () => {
            console.log('Server running on http://localhost:3000');

            // Show window after server is ready
            setTimeout(() => {
                if (mainWindow) {
                    mainWindow.loadURL('http://localhost:3000');
                    mainWindow.show();
                    mainWindow.focus();
                }
            }, 1000);
        });

    } catch (error) {
        console.error('Error starting server:', error);

        if (mainWindow) {
            const errorHtml = `
                <html>
                    <head><title>Server Error</title></head>
                    <body style="font-family: Arial; padding: 20px; background: #f0f0f0;">
                        <h1 style="color: #e74c3c;">Server Error</h1>
                        <p><strong>Error:</strong> ${error.message}</p>
                        <p>Please check the console for more details.</p>
                        <button onclick="location.reload()">Retry</button>
                    </body>
                </html>
            `;
            mainWindow.loadURL('data:text/html,' + encodeURIComponent(errorHtml));
            mainWindow.show();
        }
    }
}

function stopServer() {
    if (server) {
        console.log('Stopping server...');
        server.close();
        server = null;
    }
}

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
app.whenReady().then(createWindow);

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