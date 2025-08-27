const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  addMeldunek: (meldunek) => ipcRenderer.send('add-meldunek', meldunek),
  getMeldunki: () => ipcRenderer.invoke('get-meldunki')
});

