const { contextBridge, ipcRenderer } = require('electron');

console.log("preload.js loaded");

contextBridge.exposeInMainWorld('electronAPI', {
  openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
  convertBinaryToCSV: (filePath) => ipcRenderer.invoke('convert-file', filePath),
  onConversionLog: (callback) => ipcRenderer.on('conversion-log', (event, message) => callback(message)),
  openFile: (filePath) => ipcRenderer.invoke('open-file', filePath),
  openFolder: (folderPath) => ipcRenderer.invoke('open-folder', folderPath),
});

// Exposer les fonctions pour la gestion de l'Arduino
contextBridge.exposeInMainWorld('arduinoAPI', {
  startProcess: () => ipcRenderer.send('arduino:startProcess'),
  onStatusUpdate: (callback) => ipcRenderer.on('status', (event, message) => callback(message)),
  onConsoleLog: (callback) => ipcRenderer.on('console-log', (event, message) => callback(message)),
  onProgressUpdate: (callback) => ipcRenderer.on('progress-update', (_, value) => callback(value)),
});

