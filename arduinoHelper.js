const path = require('path');
const { spawn } = require('child_process');
const util = require('util');
const { exec, execSync } = require('child_process');
const { SerialPort } = require('serialport')

const fs = require('fs');

// Ajouter cette fonction au début du fichier
function sendLog(mainWindow, message) {
  console.log(message); // Garde la sortie console normale
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
      console.log(`Arduino détecté sur le port: ${arduinoPort.path}`);
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
  const arduinoCliPath = path.join(__dirname, 'resources', 'arduino-cli', 'arduino-cli.exe');
  
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

// Compile le code
async function compileCode(arduinoPath, sketchPath) {
  try {
    const arduinoCliPath = path.join(__dirname, 'resources', 'arduino-cli', 'arduino-cli.exe');
    
    // Créer un dossier temporaire pour le sketch
    const sketchDir = path.join(__dirname, 'temp_sketch');
    const sketchFile = path.join(sketchDir, 'temp_sketch.ino');
    
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(sketchDir)) {
      fs.mkdirSync(sketchDir);
    }
    
    // Copier le contenu du fichier .cpp vers le fichier .ino
    fs.copyFileSync(sketchPath, sketchFile);
    
    // Compiler le sketch
    const command = `"${arduinoCliPath}" compile --fqbn ${arduinoPath} "${sketchDir}"`;
    console.log(`Exécution de la commande : ${command}`);
    
    execSync(command, { 
      stdio: 'pipe',
      encoding: 'utf-8'
    });
    
    console.log('Compilation réussie.');
    
    // Nettoyer le dossier temporaire après compilation
    fs.rmSync(sketchDir, { recursive: true, force: true });
    
  } catch (error) {
    // Nettoyer en cas d'erreur
    if (fs.existsSync(path.join(__dirname, 'temp_sketch'))) {
      fs.rmSync(path.join(__dirname, 'temp_sketch'), { recursive: true, force: true });
    }
    console.error('Erreur lors de la compilation:', error);
    throw new Error('Échec de la compilation.');
  }
}

// Téléverse le code sur l'Arduino
async function uploadCode(arduinoPath, sketchPath, port) {
  try {
    const arduinoCliPath = path.join(__dirname, 'resources', 'arduino-cli', 'arduino-cli.exe');
    
    // Créer un dossier temporaire pour le sketch
    const sketchDir = path.join(__dirname, 'temp_sketch');
    const sketchFile = path.join(sketchDir, 'temp_sketch.ino');
    
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(sketchDir)) {
      fs.mkdirSync(sketchDir);
    }
    
    // Copier le contenu du fichier .cpp vers le fichier .ino
    fs.copyFileSync(sketchPath, sketchFile);
    
    // Téléverser le sketch
    const command = `"${arduinoCliPath}" upload -p ${port} --fqbn ${arduinoPath} "${sketchDir}"`;
    console.log(`Exécution de la commande : ${command}`);
    
    execSync(command, { 
      stdio: 'pipe',
      encoding: 'utf-8'
    });
    
    console.log('Téléversement réussi.');
    
    // Nettoyer le dossier temporaire après téléversement
    fs.rmSync(sketchDir, { recursive: true, force: true });
    
  } catch (error) {
    // Nettoyer en cas d'erreur
    if (fs.existsSync(path.join(__dirname, 'temp_sketch'))) {
      fs.rmSync(path.join(__dirname, 'temp_sketch'), { recursive: true, force: true });
    }
    console.error('Erreur lors du téléversement:', error);
    throw new Error('Échec du téléversement.');
  }
}

// Fonction principale pour gérer l'ensemble du processus
async function handleArduinoProcess(mainWindow) {
  setupGlobalLogging(mainWindow);

  try {
    mainWindow.webContents.send('console-log', '=== Démarrage du processus Arduino ===');
    
    mainWindow.webContents.send('progress-update', 10); // Début
    
    const arduinoPort = await checkArduinoConnection();
    mainWindow.webContents.send('progress-update', 30);
    mainWindow.webContents.send('status', 'Arduino connecté.');

    const requiredLibraries = ['Servo', 'Adafruit NeoPixel', 'Grove - Chainable RGB LED', 'AsyncDelay', 'DHT sensor library', 'Adafruit Unified Sensor', 'Adafruit BME280 Library', 'RTClib', 'DS1307', 'TinyGPSPlus', 'Time', 'SdFat'];
    await checkLibraries(requiredLibraries, mainWindow);
    mainWindow.webContents.send('progress-update', 60);
    mainWindow.webContents.send('status', 'Bibliothèques vérifiées.');

    // Spécifier le chemin vers votre fichier .cpp
    const sketchPath = path.join(__dirname, 'autocompilation', 'src', 'main.cpp');
    const arduinoBoard = 'arduino:avr:uno';

    await compileCode(arduinoBoard, sketchPath);
    mainWindow.webContents.send('progress-update', 80);
    mainWindow.webContents.send('status', 'Code compilé avec succès.');

    if (arduinoPort) {
      await uploadCode(arduinoBoard, sketchPath, arduinoPort);
      mainWindow.webContents.send('progress-update', 100);
      mainWindow.webContents.send('status', 'Code téléversé sur l\'Arduino.');
    }

    mainWindow.webContents.send('console-log', '=== Processus Arduino terminé avec succès ===');
  } catch (error) {
    mainWindow.webContents.send('console-log', `=== ERREUR: ${error.message} ===`);
    mainWindow.webContents.send('status', `Erreur: ${error.message}`);
    mainWindow.webContents.send('progress-update', 0);
  }
}

module.exports = { handleArduinoProcess };
