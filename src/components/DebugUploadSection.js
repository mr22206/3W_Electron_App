// src/components/DebugUploadSection.js
import React, { useState, useEffect, useRef } from 'react';
import '../styles/global.css';

function DebugUploadSection() {
  const [status, setStatus] = useState('');
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const logsEndRef = useRef(null);


  useEffect(() => {
    const handleStatusUpdate = (message) => {
      setStatus(message);
    };

    const handleConsoleLog = (message) => {
      setLogs(prevLogs => [...prevLogs, message]);
    };

    const handleProgressUpdate = (value) => {
      setProgress(value);
    };

    if (window.arduinoAPI) {
      window.arduinoAPI.onStatusUpdate(handleStatusUpdate);
      window.arduinoAPI.onConsoleLog(handleConsoleLog);
      window.arduinoAPI.onProgressUpdate(handleProgressUpdate);
      window.arduinoAPI.onProcessEnd(() => {
        setIsProcessing(false);
      });
    }

    return () => {
      if (window.arduinoAPI) {
        window.arduinoAPI.onStatusUpdate(null);
        window.arduinoAPI.onConsoleLog(null);
        window.arduinoAPI.onProgressUpdate(null);
        window.arduinoAPI.onProcessEnd(null);
      }
    };
  }, []);

  useEffect(() => {
    if (progress === 100) {
      setTimeout(() => {
        setProgress(0);
        setIsComplete(true);
        setIsProcessing(false);
        setTimeout(() => setIsComplete(false), 3000);
      }, 500);
    }
  }, [progress]);

  return (
    <div className="section">
      {isProcessing && (
        <div className="processing-overlay">
          <div className="processing-message">
            <h3>Processus en cours...</h3>
            <p>Veuillez patienter et ne pas interagir avec l'application</p>
            <p>Progression : {progress}%</p>
          </div>
        </div>
      )}

      <h2>Débogage et Téléversement</h2>
      
      <div className="controls">
        <button 
          className="button"
          onClick={() => {
            setIsProcessing(true);
            window.arduinoAPI.startProcess();
            setProgress(0);
          }}
        >
          Lancer le processus
        </button>
        <button 
          className="button toggle-logs"
          onClick={() => setShowLogs(!showLogs)}
        >
          {showLogs ? '🔽 Masquer les logs' : '🔼 Afficher les logs'}
        </button>
      </div>

      <div className="status-bar">
        {status || 'En attente...'}
      </div>

      {progress > 0 && (
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}>
            {progress}%
          </div>
        </div>
      )}

      {isComplete && (
        <div className="success-message">
          ✅ Processus terminé avec succès !
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

export default DebugUploadSection;