const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const { handleArduinoProcess } = require('./arduinoHelper');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true
    },
  });

  mainWindow.maximize();

  if (app.isPackaged) {
    // Utiliser path.resolve pour obtenir le chemin absolu
    const indexPath = path.resolve(__dirname, '../build/index.html');
    console.log('Loading:', indexPath);
    mainWindow.loadFile(indexPath);
    

  } else {
    mainWindow.loadURL('http://localhost:3000');
  }
}

ipcMain.on('arduino:startProcess', (event) => {
  try {
    handleArduinoProcess(event.sender.getOwnerBrowserWindow());
  } catch (error) {
    console.error('Erreur lors du lancement du processus Arduino:', error);
    event.sender.send('status', 'Erreur: ' + error.message);
  }
});

ipcMain.handle('dialog:openFile', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
  });
  return result.filePaths;
});

ipcMain.handle('convert-file', async (event, filePath) => {
  return new Promise((resolve, reject) => {
    console.log('Démarrage de la conversion pour:', filePath);
    
    const convertExePath = app.isPackaged
      ? path.join(process.resourcesPath, 'build', 'resources', 'convert.exe')
      : path.join(__dirname, '..', 'public', 'resources', 'convert.exe');
    
    console.log('Chemin de convert.exe:', convertExePath);
    console.log('Vérification existence:', fs.existsSync(convertExePath));

    const convertProcess = spawn(convertExePath, [filePath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';

    convertProcess.stdout.on('data', (data) => {
      const message = data.toString();
      console.log('Sortie standard:', message);
      output += message;
      event.sender.send('conversion-log', message);
    });

    convertProcess.stderr.on('data', (data) => {
      const message = data.toString();
      console.error('Erreur standard:', message);
      event.sender.send('conversion-log', `ERROR: ${message}`);
    });

    convertProcess.on('error', (error) => {
      console.error('Erreur de processus:', error);
      event.sender.send('conversion-log', `ERROR: ${error.message}`);
      reject(error.message);
    });

    convertProcess.on('close', (code) => {
      console.log('Code de sortie:', code);
      if (code === 0) {
        event.sender.send('conversion-log', 'Conversion terminée avec succès');
        resolve(output);
      } else {
        const errorMessage = `Process exited with code ${code}`;
        console.error(errorMessage);
        event.sender.send('conversion-log', `ERROR: ${errorMessage}`);
        reject(errorMessage);
      }
    });
  });
});

ipcMain.handle('open-file', async (_, filePath) => {
  try {
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
