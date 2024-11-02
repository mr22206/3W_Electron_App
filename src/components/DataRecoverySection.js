// src/components/DataRecoverySection.js
import React, { useState, useEffect, useRef } from 'react';
import '../styles/global.css';

function DataRecoverySection() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(true);
  const [progress, setProgress] = useState(0);
  const logsEndRef = useRef(null);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

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
      addLog('Conversion réussie !');
      addLog(result);
    } catch (error) {
      addLog(`Erreur lors de la conversion : ${error}`);
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
