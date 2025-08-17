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
                const now = Date.now();
                // Reuse cache if younger than 3s
                if (now - portCache.timestamp < 3000 && portCache.ports.length) {
                    return res.json({ ports: portCache.ports });
                }

                console.log('Detecting serial ports (fresh scan)...');

                const portsMap = new Map(); // path -> info

                const addPort = (path, manufacturer = 'Unknown', description = 'Serial Port') => {
                    if (!path) return;
                    // Normalize like COM47 etc.
                    const normalized = path.toUpperCase().trim();
                    if (!/^COM\d+$/.test(normalized)) return; // keep only COM style for now
                    // Prefer richer description if already exists
                    if (portsMap.has(normalized)) {
                        const existing = portsMap.get(normalized);
                        if (existing && existing.description === 'Serial Port' && description !== 'Serial Port') {
                            portsMap.set(normalized, { path: normalized, manufacturer, description });
                        }
                    } else {
                        portsMap.set(normalized, { path: normalized, manufacturer, description });
                    }
                };

                // Method 1: WMI (more comprehensive, includes high COM numbers)
                try {
                    const psCommand = 'powershell -NoProfile -Command "Get-CimInstance Win32_PnPEntity | Where-Object { $_.Name -match \'[(]COM[0-9]+[)]\' } | Select-Object Name, Manufacturer | ConvertTo-Json -Depth 2"';
                    const output = execSync(psCommand, {
                        encoding: 'utf8',
                        timeout: 6000,
                        stdio: 'pipe'
                    });
                    if (output.trim()) {
                        let data = JSON.parse(output);
                        if (!Array.isArray(data)) data = [data];
                        data.forEach(d => {
                            if (d && d.Name) {
                                const match = d.Name.match(/\(COM(\d+)\)/i);
                                if (match) {
                                    addPort(`COM${match[1]}`, d.Manufacturer || 'WMI', d.Name.replace(/\s*\(COM\d+\)\s*/i, '').trim() || 'Serial Device');
                                }
                            }
                        });
                    }
                } catch (e) {
                    console.log('WMI PnPEntity detection failed:', e.message);
                }

                // Method 2: Legacy Win32_SerialPort (may give DeviceID COMxx)
                if (portsMap.size === 0) {
                    try {
                        const psCommand2 = 'powershell -NoProfile -Command "Get-CimInstance -ClassName Win32_SerialPort | Select-Object DeviceID, Description, Manufacturer | ConvertTo-Json"';
                        const output2 = execSync(psCommand2, {
                            encoding: 'utf8',
                            timeout: 5000,
                            stdio: 'pipe'
                        });
                        if (output2.trim()) {
                            let psData = JSON.parse(output2);
                            if (!Array.isArray(psData)) psData = [psData];
                            psData.forEach(p => addPort(p.DeviceID, p.Manufacturer || 'WMI', p.Description || 'Serial Port'));
                        }
                    } catch (e2) {
                        console.log('Win32_SerialPort detection failed:', e2.message);
                    }
                }

                // Method 3: Registry enumeration
                try {
                    const regCommand = 'reg query HKLM\\HARDWARE\\DEVICEMAP\\SERIALCOMM';
                    const regOutput = execSync(regCommand, {
                        encoding: 'utf8',
                        timeout: 3000,
                        stdio: 'pipe'
                    });
                    regOutput.split(/\r?\n/).forEach(line => {
                        const match = line.match(/\s+(COM\d+)\s*$/i);
                        if (match) addPort(match[1], 'Registry', 'Serial Port');
                    });
                } catch (regErr) {
                    console.log('Registry detection failed:', regErr.message);
                }

                // Method 4: mode command (lists present devices)
                try {
                    const modeOutput = execSync('mode', { encoding: 'utf8', timeout: 3000, stdio: 'pipe' });
                    modeOutput.split(/\r?\n/).forEach(line => {
                        const m = line.match(/^(COM\d+):/i);
                        if (m) addPort(m[1], 'mode', 'Serial Port');
                    });
                } catch (modeErr) {
                    console.log('mode enumeration failed:', modeErr.message);
                }

                // Method 5: Targeted scan (always probe COM1..64 to catch any missed ports)
                console.log('Active probing COM1..64 (incremental)...');
                for (let i = 1; i <= 64; i++) {
                    const name = `COM${i}`;
                    if (portsMap.has(name)) continue; // skip already found
                    try {
                        execSync(`mode ${name}:`, { encoding: 'utf8', timeout: 400, stdio: 'pipe' });
                        addPort(name, 'Probe', 'Available Serial Port');
                    } catch (_) {
                        // silent
                    }
                }

                // Fallback defaults if still nothing
                if (portsMap.size === 0) {
                    // Nothing positively detected: offer a full selectable range for manual choice
                    for (let i = 1; i <= 64; i++) {
                        addPort(`COM${i}`, 'Common', 'Manual Select');
                    }
                }

                // Convert to array & sort numerically
                const detectedPorts = Array.from(portsMap.values()).sort((a, b) => parseInt(a.path.replace(/\D/g, '')) - parseInt(b.path.replace(/\D/g, '')));

                console.log('Final port list:', detectedPorts);
                portCache = { timestamp: Date.now(), ports: detectedPorts };
                res.json({ ports: detectedPorts });
            } catch (error) {
                console.error('Port detection error:', error);
                const fallbackPorts = Array.from({ length: 64 }, (_, i) => ({
                    path: `COM${i + 1}`,
                    manufacturer: 'Fallback',
                    description: 'Manual Select'
                }));
                res.json({ ports: fallbackPorts });
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