// Script de démarrage robuste pour Render
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { chdir, cwd } from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Démarrage du backend EcoPulse...');
console.log('📁 Répertoire actuel:', cwd());

try {
  // Changer vers le répertoire backend
  const backendPath = join(__dirname, 'backend');
  console.log('📁 Changement vers:', backendPath);
  
  chdir(backendPath);
  console.log('✅ Nouveau répertoire:', cwd());
  
  // Importer et lancer le serveur
  console.log('🔄 Import du serveur...');
  await import('./backend/server.js');
  
} catch (error) {
  console.error('❌ Erreur lors du démarrage:', error);
  process.exit(1);
}