#!/usr/bin/env node

/**
 * Script de démarrage robuste pour Render
 */

// Vérifier la version Node.js
const nodeVersion = process.version;
console.log(`🚀 Démarrage avec Node.js ${nodeVersion}`);

// Vérifier les variables d'environnement critiques
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('❌ Variables d\'environnement manquantes:', missingVars);
    process.exit(1);
}

// Configurer les options Node.js pour éviter les erreurs de mémoire
process.env.NODE_OPTIONS = '--max-old-space-size=512';

// Démarrer le serveur
try {
    console.log('🔄 Chargement du serveur...');
    await import('./server.js');
} catch (error) {
    console.error('❌ Erreur lors du démarrage:', error);
    process.exit(1);
}