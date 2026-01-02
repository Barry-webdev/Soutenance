#!/bin/bash

echo "🚀 Démarrage du backend EcoPulse..."
echo "📁 Répertoire courant: $(pwd)"

# Aller dans le dossier backend
cd backend

echo "📁 Changement vers: $(pwd)"
echo "📦 Contenu du dossier:"
ls -la

# Vérifier que server.js existe
if [ -f "server.js" ]; then
    echo "✅ server.js trouvé"
    echo "🔄 Lancement du serveur..."
    node server.js
else
    echo "❌ server.js non trouvé"
    exit 1
fi