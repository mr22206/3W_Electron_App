import React, { useState, useEffect, useRef } from 'react';
import '../styles/global.css';

function DataRecoverySection() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(true);
  const [progress, setProgress] = useState(0);
  const logsEndRef = useRef(null);
  const [csvGenerated, setCsvGenerated] = useState(false);
  const [csvPath, setCsvPath] = useState('');

  useEffect(() => {
    // Écouter les logs de conversion
    const handleConversionLog = (message) => {
      setLogs(prevLogs => [...prevLogs, message]);
    };

    if (window.electronAPI) {
      window.electronAPI.onConversionLog(handleConversionLog);
    }

    return () => {
      if (window.electronAPI) {
        window.electronAPI.onConversionLog(null);
      }
    };
  }, []);

  const handleFileSelect = async () => {
    try {
      const filePaths = await window.electronAPI.openFileDialog();
      if (filePaths && filePaths.length > 0) {
        setSelectedFile(filePaths[0]);
        addLog(`Fichier sélectionné : ${filePaths[0]}`);
      }
    } catch (error) {
      addLog(`Erreur lors de la sélection du fichier : ${error.message}`);
    }
  };

  const handleConversion = async () => {
    if (!selectedFile) {
      addLog('Erreur : Aucun fichier sélectionné');
      return;
    }

    try {
      addLog('Début de la conversion...');
      const result = await window.electronAPI.convertBinaryToCSV(selectedFile);
      
      // Extraire le chemin du fichier CSV du résultat
      const match = result.match(/converted_files[/\\][^"\n]+\.csv/);
      if (match) {
        let csvPath = match[0];
        csvPath = csvPath.replace('.bin.csv', '.csv');
        setCsvPath(csvPath);
        setCsvGenerated(true);
        addLog(`Fichier CSV généré : ${csvPath}`);
      }
      
      addLog('Conversion réussie !');
    } catch (error) {
      addLog(`Erreur lors de la conversion : ${error}`);
    }
  };

  const handleOpenCsvFile = async () => {
    try {
      await window.electronAPI.openFile(csvPath);
      addLog('Ouverture du fichier CSV');
    } catch (error) {
      addLog(`Erreur lors de l'ouverture du fichier : ${error}`);
    }
  };

  const handleOpenCsvFolder = async () => {
    try {
      await window.electronAPI.openFolder('converted_files');
      addLog('Ouverture du dossier contenant le fichier CSV');
    } catch (error) {
      addLog(`Erreur lors de l'ouverture du dossier : ${error}`);
    }
  };

  const addLog = (message) => {
    setLogs(prevLogs => [...prevLogs, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  return (
    <div className="section">
      <h2>Récupération des Données</h2>
      
      <div className="controls">
        <button 
          className="button"
          onClick={handleFileSelect}
        >
          Sélectionner un fichier
        </button>
        <button 
          className="button"
          onClick={handleConversion}
          disabled={!selectedFile}
        >
          Convertir
        </button>
        <button 
          className="button"
          onClick={handleOpenCsvFile}
          disabled={!csvGenerated}
        >
          📄 Ouvrir le fichier CSV
        </button>
        <button 
          className="button"
          onClick={handleOpenCsvFolder}
          disabled={!csvGenerated}
        >
          📁 Ouvrir l'emplacement
        </button>
        <button 
          className="button toggle-logs"
          onClick={() => setShowLogs(!showLogs)}
        >
          {showLogs ? '🔽 Masquer les logs' : '🔼 Afficher les logs'}
        </button>
      </div>

      {selectedFile && (
        <div className="file-info">
          <span>📁 Fichier sélectionné :</span>
          <strong>{selectedFile}</strong>
        </div>
      )}

      {progress > 0 && (
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}>
            {progress}%
          </div>
        </div>
      )}

      <div className={`console-container ${showLogs ? 'show' : 'hide'}`}>
        <div className="console-output">
          {logs.map((log, index) => (
            <div key={index} className="console-line">
              {log}
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
        
        <button 
          className="button clear-button"
          onClick={() => setLogs([])}
        >
          Effacer les logs
        </button>
      </div>
    </div>
  );
}

export default DataRecoverySection;
