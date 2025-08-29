const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  addMeldunek: (meldunek) => ipcRenderer.send('add-meldunek', meldunek),
  getMeldunki: () => ipcRenderer.invoke('get-meldunki')
});

contextBridge.exposeInMainWorld('api', {
  // ...to co już masz (addMeldunek, getMeldunki, itd.)
  getLivePositions: () => ipcRenderer.invoke('get-live-positions')
});


