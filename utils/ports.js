// Optimized serial port detection for Windows using multiple strategies with caching.
// Falls back gracefully and avoids blocking the event loop with long sync exec calls.

const { exec } = require('child_process');

// Cache structure
let cache = { ts: 0, ports: [] };
const CACHE_TTL = 2500; // ms

function uniquePush(list, port) {
    if (!port || !port.path) return;
    if (!/^COM\d+$/i.test(port.path)) return; // limit to COM style
    if (!list.find(p => p.path === port.path)) {
        list.push(port);
    }
}

function parseWmiJson(jsonStr) {
    try {
        if (!jsonStr.trim()) return [];
        let data = JSON.parse(jsonStr);
        if (!Array.isArray(data)) data = [data];
        return data.map(d => {
            const match = d.Name && d.Name.match(/\(COM(\d+)\)/i);
            if (match) {
                return {
                    path: 'COM' + match[1],
                    manufacturer: d.Manufacturer || 'WMI',
                    description: d.Name.replace(/\s*\(COM\d+\)\s*/i, '').trim() || 'Serial Device'
                };
            }
            return null;
        }).filter(Boolean);
    } catch (_) {
        return [];
    }
}

function run(cmd, timeout = 4000) {
    return new Promise(resolve => {
        exec(cmd, { timeout }, (err, stdout) => {
            if (err) return resolve('');
            resolve(stdout || '');
        });
    });
}

async function detectSerialPorts() {
    const now = Date.now();
    if (now - cache.ts < CACHE_TTL && cache.ports.length) {
        return cache.ports;
    }

    const ports = [];

    // 1. WMI PnPEntity
    const wmi = await run('powershell -NoProfile -Command "Get-CimInstance Win32_PnPEntity | Where-Object { $_.Name -match \"[(]COM[0-9]+[)]\" } | Select-Object Name, Manufacturer | ConvertTo-Json -Depth 2"');
    parseWmiJson(wmi).forEach(p => uniquePush(ports, p));

    // 2. Legacy SerialPort
    if (!ports.length) {
        const wmi2 = await run('powershell -NoProfile -Command "Get-CimInstance -ClassName Win32_SerialPort | Select-Object DeviceID, Description, Manufacturer | ConvertTo-Json"');
        try {
            let data = JSON.parse(wmi2);
            if (!Array.isArray(data)) data = [data];
            data.forEach(d => {
                if (d.DeviceID) uniquePush(ports, { path: d.DeviceID.trim(), manufacturer: d.Manufacturer || 'WMI', description: d.Description || 'Serial Port' });
            });
        } catch (_) { }
    }

    // 3. Registry
    const reg = await run('reg query HKLM\\HARDWARE\\DEVICEMAP\\SERIALCOMM');
    reg.split(/\r?\n/).forEach(line => {
        const m = line.match(/\s+(COM\d+)\s*$/i);
        if (m) uniquePush(ports, { path: m[1], manufacturer: 'Registry', description: 'Serial Port' });
    });

    // 4. mode command quick parse
    const mode = await run('mode');
    mode.split(/\r?\n/).forEach(line => {
        const m = line.match(/^(COM\d+):/i);
        if (m) uniquePush(ports, { path: m[1], manufacturer: 'mode', description: 'Serial Port' });
    });

    // 5. Active probing limited: only probe up to existing highest+5 or COM64 (cap) to cover extended ranges
    let maxFound = 0;
    ports.forEach(p => { const n = parseInt(p.path.replace(/\D/g, '')); if (!isNaN(n) && n > maxFound) maxFound = n; });
    const probeMax = Math.min(Math.max(maxFound + 5, 8), 64); // extend cap to 64 per requirement
    const probePromises = [];
    for (let i = 1; i <= probeMax; i++) {
        if (ports.find(p => p.path === 'COM' + i)) continue;
        // Use a tiny powershell test rather than mode which can be slower
        probePromises.push(run(`mode COM${i}:`, 500).then(out => {
            if (/status for device/i.test(out)) {
                uniquePush(ports, { path: 'COM' + i, manufacturer: 'Probe', description: 'Available Serial Port' });
            }
        }));
    }
    await Promise.allSettled(probePromises);

    // Fallback: if still empty, supply manual range 1..64
    if (!ports.length) {
        for (let i = 1; i <= 64; i++) {
            uniquePush(ports, { path: 'COM' + i, manufacturer: 'Fallback', description: 'Manual Select' });
        }
    }

    // Sort numerically
    ports.sort((a, b) => parseInt(a.path.replace(/\D/g, '')) - parseInt(b.path.replace(/\D/g, '')));
    cache = { ts: Date.now(), ports };
    return ports;
}

module.exports = { detectSerialPorts };
