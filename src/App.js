// src/App.js
import React from 'react';
import DebugUploadSection from './components/DebugUploadSection';
import DataRecoverySection from './components/DataRecoverySection';
import './styles/global.css';

function App() {
  return (
    <div className="app-container">
      <h1>Station Météo Embarquée</h1>
      <DebugUploadSection />
      <DataRecoverySection />
      
      {/* Section des crédits */}
      <div className="credits-section">
        <h3 className="credits-title">Développé par</h3>
        <ul className="credits-list">
          <li className="credit-item">Mohammad Rezki</li>
          <li className="credit-item">Kieran Webb</li>
          <li className="credit-item">Dylan Rafiliposon</li>
          <li className="credit-item">Lucas Garcias</li>
        </ul>
      </div>
    </div>
  );
}

export default App;
