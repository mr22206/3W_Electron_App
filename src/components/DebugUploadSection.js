// src/components/DebugUploadSection.js
import React, { useState, useEffect, useRef } from 'react';
import '../styles/global.css';

function DebugUploadSection() {
  const [status, setStatus] = useState('');
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
    const handleStatusUpdate = (message) => {
      setStatus(message);
    };

    const handleConsoleLog = (message) => {
      setLogs(prevLogs => [...prevLogs, message]);
    };

    if (window.arduinoAPI) {
      window.arduinoAPI.onStatusUpdate(handleStatusUpdate);
      window.arduinoAPI.onConsoleLog(handleConsoleLog);
    }

    return () => {
      if (window.arduinoAPI) {
        window.arduinoAPI.onStatusUpdate(null);
        window.arduinoAPI.onConsoleLog(null);
      }
    };
  }, []);

  return (
    <div className="section">
      <h2>Débogage et Téléversement</h2>
      
      <div className="controls">
        <button 
          className="button"
          onClick={() => {
            window.arduinoAPI.startProcess();
            setProgress(0); // Réinitialiser la progression
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