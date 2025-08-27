const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { addMeldunek, getMeldunki } = require('./utils/db');


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


