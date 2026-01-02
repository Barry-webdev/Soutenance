#!/usr/bin/env node

// Script de démarrage pour Render
// Ce script change le répertoire vers backend et lance le serveur

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Démarrage du backend EcoPulse sur Render...');
console.log('📁 Répertoire courant:', process.cwd());
console.log('📁 Répertoire backend:', path.join(process.cwd(), 'backend'));

// Changer vers le répertoire backend
process.chdir(path.join(process.cwd(), 'backend'));

console.log('📁 Nouveau répertoire courant:', process.cwd());

// Lancer le serveur
const server = spawn('node', ['server.js'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production'
  }
});

server.on('error', (err) => {
  console.error('❌ Erreur lors du démarrage du serveur:', err);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`🔚 Serveur fermé avec le code ${code}`);
  process.exit(code);
});

// Gérer les signaux de fermeture
process.on('SIGTERM', () => {
  console.log('📡 Signal SIGTERM reçu, fermeture du serveur...');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('📡 Signal SIGINT reçu, fermeture du serveur...');
  server.kill('SIGINT');
});