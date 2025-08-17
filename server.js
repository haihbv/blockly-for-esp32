// Standalone Express server for ESP32 Blockly
const express = require('express');
const path = require('path');
const fs = require('fs');

let serverInstance = null;

function startServer(options = {}) {
    if (serverInstance) return Promise.resolve(serverInstance);
    const port = options.port || process.env.PORT || 3000;
    console.log('[server] Starting on port', port);
    return new Promise((resolve, reject) => {
        try {
            const app = express();
            const { execSync } = require('child_process');
            let portCache = { timestamp: 0, ports: [] };

            app.use(express.json({ limit: '10mb' }));
            app.use(express.static('.'));
            app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'index.html')));

            app.post('/upload', async (req, res) => {
                try {
                    const { code, port: devicePort } = req.body;
                    if (!code || !code.trim()) return res.status(400).json({ error: 'No code provided' });
                    const sketchDir = path.join(__dirname, 'temp_sketch');
                    if (!fs.existsSync(sketchDir)) fs.mkdirSync(sketchDir, { recursive: true });
                    const sketchFile = path.join(sketchDir, 'temp_sketch.ino');
                    fs.writeFileSync(sketchFile, code, 'utf8');
                    const uploadPort = devicePort || 'COM3';
                    const compileCmd = `arduino-cli compile --fqbn esp32:esp32:esp32 "${sketchFile}"`;
                    const uploadCmd = `arduino-cli upload -p ${uploadPort} --fqbn esp32:esp32:esp32 "${sketchFile}"`;
                    try {
                        execSync(compileCmd, { stdio: 'pipe', timeout: 30000 });
                        execSync(uploadCmd, { stdio: 'pipe', timeout: 30000 });
                        res.json({ success: true, stage: 'Upload Complete', message: `Successfully uploaded to ${uploadPort}` });
                    } catch (e) {
                        console.log('[upload] fallback/manual', e.message);
                        res.json({ success: true, stage: 'Code Generated', message: `Code saved to ${sketchFile}. Upload manually via Arduino IDE.`, file: sketchFile });
                    }
                } catch (error) {
                    res.status(500).json({ error: `Upload failed: ${error.message}`, details: error.stack });
                }
            });

            app.post('/compile', async (req, res) => {
                try {
                    const { code } = req.body;
                    if (!code || !code.trim()) return res.status(400).json({ error: 'No code provided' });
                    const sketchDir = path.join(__dirname, 'temp_sketch');
                    if (!fs.existsSync(sketchDir)) fs.mkdirSync(sketchDir, { recursive: true });
                    const sketchFile = path.join(sketchDir, 'temp_sketch.ino');
                    fs.writeFileSync(sketchFile, code, 'utf8');
                    const { execSync } = require('child_process');
                    const compileCmd = `arduino-cli compile --fqbn esp32:esp32:esp32 "${sketchFile}"`;
                    try {
                        const out = execSync(compileCmd, { encoding: 'utf8', stdio: 'pipe', timeout: 45000 });
                        res.json({ success: true, stage: 'Compile Complete', message: 'Compilation successful', output: out, file: sketchFile });
                    } catch (e) {
                        res.json({ success: false, stage: 'Compile Failed', message: 'Compilation failed or arduino-cli not installed.', error: e.message, file: sketchFile });
                    }
                } catch (error) {
                    res.status(500).json({ error: `Compile failed: ${error.message}`, details: error.stack });
                }
            });

            app.get('/ports', async (_req, res) => {
                try {
                    const age = Date.now() - portCache.timestamp;
                    if (age < 2500 && portCache.ports.length) return res.json({ ports: portCache.ports, cached: true });
                    const { detectSerialPorts } = require('./utils/ports');
                    const ports = await detectSerialPorts();
                    portCache = { timestamp: Date.now(), ports };
                    res.json({ ports, cached: false });
                } catch (error) {
                    const fallbackPorts = Array.from({ length: 10 }, (_, i) => ({ path: `COM${i + 1}` }));
                    res.json({ ports: fallbackPorts, fallback: true });
                }
            });

            serverInstance = app.listen(port, () => {
                console.log(`[server] Listening: http://localhost:${port}`);
                resolve(serverInstance);
            });
            serverInstance.on('error', err => {
                if (err && err.code === 'EADDRINUSE') {
                    // Friendly message, don't dump stack
                    console.log(`[server] Port ${port} đã được dùng. Bỏ qua khởi động mới (giả định server đang chạy).`);
                    resolve(null); // treat as success (external server)
                } else {
                    console.error('[server] Unexpected error starting server:', err.message);
                    reject(err);
                }
            });
        } catch (e) { reject(e); }
    });
}

function stopServer() {
    if (serverInstance) { console.log('[server] Stopping'); serverInstance.close(); serverInstance = null; }
}

module.exports = { startServer, stopServer };

if (require.main === module) {
    startServer().catch(err => { console.error(err); process.exit(1); });
}
