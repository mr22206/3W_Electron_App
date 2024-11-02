// renderer.js
document.getElementById('launchButton').addEventListener('click', () => {
    document.getElementById('status').textContent = 'Statut : Démarrage du processus Arduino...';
    window.arduinoAPI.startProcess(); // Lance le processus Arduino
  });
  
  // Mise à jour du statut dans l'interface
  window.arduinoAPI.onStatusUpdate((message) => {
    document.getElementById('status').textContent = `Statut : ${message}`;
  });
  