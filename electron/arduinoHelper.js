const path = require('path');
const { spawn } = require('child_process');
const util = require('util');
const { exec, execSync } = require('child_process');
const { SerialPort } = require('serialport');
const fs = require('fs');
const { app } = require('electron');
const os = require('os');

function sendLog(mainWindow, message) {
  // console.log(message);
  mainWindow.webContents.send('console-log', message); // Envoie au renderer
}

// Rediriger tous les console.log, console.error, etc.
function setupGlobalLogging(mainWindow) {
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalConsoleInfo = console.info;

  console.log = (...args) => {
    originalConsoleLog.apply(console, args);
    mainWindow.webContents.send('console-log', util.format(...args));
  };

  console.error = (...args) => {
    originalConsoleError.apply(console, args);
    mainWindow.webContents.send('console-log', `ERROR: ${util.format(...args)}`);
  };

  console.warn = (...args) => {
    originalConsoleWarn.apply(console, args);
    mainWindow.webContents.send('console-log', `WARN: ${util.format(...args)}`);
  };

  console.info = (...args) => {
    originalConsoleInfo.apply(console, args);
    mainWindow.webContents.send('console-log', `INFO: ${util.format(...args)}`);
  };

  // Capturer les erreurs non gérées
  process.on('uncaughtException', (error) => {
    mainWindow.webContents.send('console-log', `UNCAUGHT ERROR: ${error.stack}`);
  });

  process.on('unhandledRejection', (error) => {
    mainWindow.webContents.send('console-log', `UNHANDLED REJECTION: ${error}`);
  });
}

// Exécuter une commande et capturer toute la sortie
function executeCommand(command, args, mainWindow) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, { shell: true });
    
    process.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(output);
      mainWindow.webContents.send('console-log', output);
    });

    process.stderr.on('data', (data) => {
      const output = data.toString();
      console.error(output);
      mainWindow.webContents.send('console-log', `ERROR: ${output}`);
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Process exited with code ${code}`));
      }
    });
  });
}

// Vérifie si une carte Arduino est connectée
async function checkArduinoConnection() {
  try {
    // Utilisation de SerialPort.list() pour lister les ports
    const ports = await SerialPort.list();
    const arduinoPort = ports.find(port => port.manufacturer && port.manufacturer.includes('Arduino'));
    if (arduinoPort) {
      return arduinoPort.path;
    } else {
      throw new Error('Arduino non détecté. Veuillez brancher votre Arduino.');
    }
  } catch (error) {
    console.error(`Erreur lors de la vérification de la connexion Arduino: ${error.message}`);
  }
}

// Vérifie les bibliothèques nécessaires
async function checkLibraries(libraries, mainWindow) {
  const arduinoCliPath = app.isPackaged
    ? path.join(process.resourcesPath, 'build', 'resources', 'arduino-cli', 'arduino-cli.exe')
    : path.join(__dirname, '..', 'public', 'resources', 'arduino-cli', 'arduino-cli.exe');
  
  for (let lib of libraries) {
    try {
      const command = `"${arduinoCliPath}" lib install "${lib}"`;
      sendLog(mainWindow, `Installation de la bibliothèque ${lib}...`);
      sendLog(mainWindow, `Commande exécutée : ${command}`);
      
      execSync(command, { 
        stdio: 'pipe',
        encoding: 'utf-8'
      });
      
      sendLog(mainWindow, `Bibliothèque ${lib} installée avec succès.`);
    } catch (error) {
      sendLog(mainWindow, `Erreur détaillée lors de l'installation de ${lib}:`);
      sendLog(mainWindow, `Message d'erreur: ${error.message}`);
      if (error.stdout) sendLog(mainWindow, `Sortie standard: ${error.stdout}`);
      if (error.stderr) sendLog(mainWindow, `Erreur standard: ${error.stderr}`);
    }
  }
}

// Téléverse le code sur l'Arduino
async function uploadCode(arduinoPath, sketchPath, port) {
  let sketchDir = null;
  try {
    const arduinoCliPath = app.isPackaged
      ? path.join(process.resourcesPath, 'build', 'resources', 'arduino-cli', 'arduino-cli.exe')
      : path.join(__dirname, '..', 'public', 'resources', 'arduino-cli', 'arduino-cli.exe');
    
    // Créer un dossier temporaire pour le sketch
    const tempId = Date.now();
    sketchDir = path.join(os.tmpdir(), `arduino_upload_${tempId}`);
    const sketchFile = path.join(sketchDir, `arduino_upload_${tempId}.ino`);
    
    console.log('=== Debug Upload ===');
    console.log('Arduino CLI path:', arduinoCliPath);
    console.log('Source sketch path:', sketchPath);
    console.log('Temp directory:', sketchDir);
    console.log('Temp sketch file:', sketchFile);
    
    // Créer le dossier temporaire
    fs.mkdirSync(sketchDir, { recursive: true });
    
    // Vérifier que le fichier source existe
    if (!fs.existsSync(sketchPath)) {
      throw new Error(`Le fichier source n'existe pas: ${sketchPath}`);
    }
    
    // Copier le contenu du fichier .cpp vers le fichier .ino
    fs.copyFileSync(sketchPath, sketchFile);
    
    // Compiler d'abord le sketch
    console.log('Compilation du sketch avant téléversement...');
    const compileCommand = `"${arduinoCliPath}" compile --fqbn ${arduinoPath} "${sketchDir}"`;
    console.log('Commande de compilation:', compileCommand);
    
    execSync(compileCommand, { 
      stdio: 'pipe',
      encoding: 'utf-8'
    });
    
    // Téléverser le sketch
    const uploadCommand = `"${arduinoCliPath}" upload -p ${port} --fqbn ${arduinoPath} "${sketchDir}"`;
    console.log('Commande de téléversement:', uploadCommand);
    
    execSync(uploadCommand, { 
      stdio: 'pipe',
      encoding: 'utf-8'
    });
    
    console.log('Téléversement réussi');
    
  } catch (error) {
    console.error('Erreur détaillée lors du téléversement:', error);
    throw new Error('Erreur lors du téléversement: ' + error.message);
  } finally {
    // Nettoyer le dossier temporaire
    try {
      if (sketchDir && fs.existsSync(sketchDir)) {
        fs.rmSync(sketchDir, { recursive: true, force: true });
      }
    } catch (cleanupError) {
      console.error('Erreur lors du nettoyage:', cleanupError);
    }
  }
}

// Fonction principale pour gérer l'ensemble du processus
async function handleArduinoProcess(mainWindow) {
  try {
    // Logs de débogage détaillés
    console.log('=== Debug Info ===');
    console.log('process.resourcesPath:', process.resourcesPath);
    console.log('app.getAppPath():', app.getAppPath());
    console.log('__dirname:', __dirname);
    console.log('process.cwd():', process.cwd());

    const sketchPath = app.isPackaged
      ? path.join(process.resourcesPath, 'build', 'autocompilation', 'src', 'main.cpp')
      : path.join(__dirname, '..', 'autocompilation', 'src', 'main.cpp');

    console.log('Chemin du sketch:', sketchPath);
    console.log('Le fichier existe:', fs.existsSync(sketchPath));

    const arduinoBoard = 'arduino:avr:uno';

    setupGlobalLogging(mainWindow);

    try {
      setupGlobalLogging(mainWindow);
  
      mainWindow.webContents.send('console-log', '=== Démarrage du processus Arduino ===');
      mainWindow.webContents.send('progress-update', 10);
      mainWindow.webContents.send('status', 'Initialisation...');
  
      const arduinoPort = await checkArduinoConnection();
      if (arduinoPort) {
        mainWindow.webContents.send('console-log', `Arduino détecté sur le port: ${arduinoPort}`);
      }
      mainWindow.webContents.send('progress-update', 30);
      mainWindow.webContents.send('status', 'Arduino connecté.');
  
      const requiredLibraries = ['Servo', 'Adafruit NeoPixel', 'Grove - Chainable RGB LED', 'AsyncDelay', 'DHT sensor library', 'Adafruit Unified Sensor', 'Adafruit BME280 Library', 'RTClib', 'DS1307', 'TinyGPSPlus', 'Time', 'SdFat', 'SD'];
      await checkLibraries(requiredLibraries, mainWindow);
      mainWindow.webContents.send('progress-update', 50);
      mainWindow.webContents.send('status', 'Bibliothèques vérifiées.');
  
      if (arduinoPort) {
        // Compilation
        mainWindow.webContents.send('progress-update', 70);
        mainWindow.webContents.send('status', 'Compilation en cours...');
        
        // Téléversement
        await uploadCode(arduinoBoard, sketchPath, arduinoPort);
        mainWindow.webContents.send('progress-update', 90);
        mainWindow.webContents.send('status', 'Téléversement en cours...');
        
        // Finalisation
        mainWindow.webContents.send('progress-update', 100);
        mainWindow.webContents.send('status', 'Code téléversé avec succès.');
      }
  
      mainWindow.webContents.send('console-log', '=== Processus Arduino terminé avec succès ===');
    } catch (error) {
      mainWindow.webContents.send('console-log', `=== ERREUR: ${error.message} ===`);
      mainWindow.webContents.send('status', `Erreur: ${error.message}`);
      mainWindow.webContents.send('progress-update', 0);
      mainWindow.webContents.send('process-end', true);
    }  
  } catch (error) {
    mainWindow.webContents.send('console-log', `=== ERREUR: ${error.message} ===`);
    mainWindow.webContents.send('status', `Erreur: ${error.message}`);
    mainWindow.webContents.send('progress-update', 0);
    mainWindow.webContents.send('process-end', true);
  }
}

module.exports = { handleArduinoProcess };
