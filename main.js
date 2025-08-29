const express = require('express');
const http = require('http');
const os = require('os');
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { addMeldunek, getMeldunki } = require('./utils/db');

// ========= LIVE TRACKING (telefony) =========
const appServer = express();
appServer.use(express.json());

// Serwuj stronę trackera dla telefonów
const trackerDir = path.join(__dirname, 'tracker');
appServer.use(express.static(trackerDir));

// Pamięć bieżących pozycji (w RAM)
const livePositions = new Map(); // key = unit, val = {unit, lat, lon, acc, spd, ts}

// Endpoint: zapis pozycji z telefonu
appServer.post('/api/pos', (req, res) => {
  const { unit, lat, lon, acc, spd, ts } = req.body || {};
  if (typeof lat !== 'number' || typeof lon !== 'number') {
    return res.status(400).json({ ok:false, error:'lat/lon wymagane (number)' });
  }
  const name = (unit || 'NIEZNANA').toString().slice(0, 64);
  const record = { unit: name, lat, lon, acc: acc ?? null, spd: spd ?? null, ts: ts || Date.now() };
  livePositions.set(name, record);
  res.json({ ok: true });
});

// Endpoint: pobranie wszystkich aktualnych pozycji (opcjonalnie do testów w przeglądarce)
appServer.get('/api/positions', (_req, res) => {
  res.json(Array.from(livePositions.values()));
});

// Uruchom serwer HTTP (na wszystkich interfejsach – żeby telefony widziały)
const SERVER_PORT = 3000;
const server = http.createServer(appServer);
server.listen(SERVER_PORT, '0.0.0.0', () => {
  // Wypisz lokalne adresy IP – ułatwi wejście z telefonu
  const nets = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) ips.push(net.address);
    }
  }
  console.log(`Serwer tracker działa na:`);
  ips.forEach(ip => console.log(`  http://${ip}:${SERVER_PORT}/phone-client.html`));
});

// IPC dla renderera – pobieranie pozycji do mapy
ipcMain.handle('get-live-positions', async () => {
  return Array.from(livePositions.values());
});
// ========= /LIVE TRACKING =========

ipcMain.on('add-meldunek', (event, meldunek) => {
  addMeldunek(meldunek);
});

ipcMain.handle('get-meldunki', async () => {
  return new Promise((resolve) => {
    getMeldunki((rows) => {
      resolve(rows);
    });
  });
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile('renderer/index.html');
}

app.whenReady().then(createWindow);

// IPC – odbieranie meldunku z renderera
// ipcMain.handle('add-meldunek', async (event, meldunek) => {
//   try {
//     addMeldunek(meldunek);
//     return { success: true };
//   } catch (error) {
//     console.error('Błąd przy dodawaniu meldunku:', error);
//     return { success: false, error: error.message };
//   }
// });


