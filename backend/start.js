#!/usr/bin/env node

/**
 * Script de démarrage optimisé pour Render - Fix BufferList
 */

// Forcer Node.js à utiliser les modules internes corrects
process.env.NODE_OPTIONS = '--max-old-space-size=512 --no-experimental-fetch';

// Vérifier la version Node.js
const nodeVersion = process.version;
console.log(`🚀 Démarrage avec Node.js ${nodeVersion}`);

// Vérifier que nous sommes sur Node 18.x pour éviter BufferList
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
if (majorVersion < 18 || majorVersion > 18) {
    console.warn(`⚠️ Version Node.js ${nodeVersion} détectée. Recommandé: 18.x`);
}

// Vérifier les variables d'environnement critiques
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('❌ Variables d\'environnement manquantes:', missingVars);
    process.exit(1);
}

// Configurer le port
const PORT = process.env.PORT || 10000;
console.log(`🔌 Port configuré: ${PORT}`);

// Démarrer le serveur avec gestion d'erreurs BufferList
try {
    console.log('🔄 Chargement du serveur...');
    
    // Import dynamique pour éviter les erreurs de modules
    const serverModule = await import('./server.js');
    
    console.log('✅ Serveur chargé avec succès');
} catch (error) {
    console.error('❌ Erreur lors du démarrage:', error.message);
    
    // Si erreur BufferList, essayer une approche alternative
    if (error.message.includes('BufferList') || error.message.includes('internal/streams')) {
        console.log('🔄 Tentative de démarrage alternatif...');
        try {
            // Forcer l'utilisation des modules Node.js intégrés
            delete require.cache[require.resolve('./server.js')];
            require('./server.js');
        } catch (fallbackError) {
            console.error('❌ Échec du démarrage alternatif:', fallbackError.message);
            process.exit(1);
        }
    } else {
        process.exit(1);
    }
}