const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { execFile, spawn } = require('child_process');
const { handleArduinoProcess } = require('./arduinoHelper'); // Importez le fichier Arduino

function createWindow() {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });

  // Maximiser la fenêtre au démarrage
  mainWindow.maximize();

  mainWindow.loadURL('http://localhost:3000');

  // Ajouter un écouteur pour l'événement Arduino
  ipcMain.on('arduino:startProcess', () => {
    handleArduinoProcess(mainWindow); // Passe la fenêtre pour envoyer les mises à jour de statut
  });
}

ipcMain.handle('dialog:openFile', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
  });
  return result.filePaths;
});

ipcMain.handle('convert-file', async (event, filePath) => {
  return new Promise((resolve, reject) => {
    const process = spawn('./public/resources/convert.exe', [filePath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';

    process.stdout.on('data', (data) => {
      const message = data.toString();
      output += message;
      event.sender.send('conversion-log', message);
    });

    process.stderr.on('data', (data) => {
      const message = data.toString();
      event.sender.send('conversion-log', `ERROR: ${message}`);
    });

    process.on('close', (code) => {
      if (code === 0) {
        event.sender.send('conversion-log', 'Conversion terminée avec succès');
        resolve(output);
      } else {
        const errorMessage = `Process exited with code ${code}`;
        event.sender.send('conversion-log', `ERROR: ${errorMessage}`);
        reject(errorMessage);
      }
    });
  });
});

ipcMain.handle('open-file', async (_, filePath) => {
  try {
    // Convertir le chemin relatif en chemin absolu
    const absolutePath = path.join(process.cwd(), filePath);
    console.log('Tentative d\'ouverture du fichier:', absolutePath);
    await shell.openPath(absolutePath);
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de l\'ouverture du fichier:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-folder', async (_, folderPath) => {
  try {
    // Convertir le chemin relatif en chemin absolu
    const absolutePath = path.join(process.cwd(), folderPath);
    console.log('Tentative d\'ouverture du dossier:', absolutePath);
    await shell.openPath(absolutePath);
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de l\'ouverture du dossier:', error);
    return { success: false, error: error.message };
  }
});

app.on('ready', createWindow);
