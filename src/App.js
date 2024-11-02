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
    </div>
  );
}

export default App;
