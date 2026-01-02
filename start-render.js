#!/usr/bin/env node

// Script de démarrage simplifié pour Render
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Démarrage du backend EcoPulse sur Render...');
console.log('📁 Répertoire courant:', process.cwd());

try {
  // Changer vers le répertoire backend et lancer le serveur
  const backendPath = path.join(process.cwd(), 'backend');
  console.log('📁 Changement vers:', backendPath);
  
  process.chdir(backendPath);
  console.log('✅ Répertoire changé vers:', process.cwd());
  
  // Lancer le serveur directement
  console.log('🔄 Lancement du serveur...');
  require('./server.js');
  
} catch (error) {
  console.error('❌ Erreur:', error);
  process.exit(1);
}