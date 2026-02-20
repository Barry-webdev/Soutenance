#!/bin/bash
# Script pour retirer les fichiers .env du Git
# ⚠️ ATTENTION: Exécutez ce script APRÈS avoir sauvegardé vos variables d'environnement ailleurs !

echo "🔒 Retrait des fichiers .env du Git..."
echo ""
echo "⚠️  ATTENTION: Assurez-vous d'avoir sauvegardé vos variables d'environnement !"
echo "⚠️  Les fichiers seront retirés du Git mais resteront sur votre disque local."
echo ""
read -p "Continuer ? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]
then
    # Retirer les fichiers .env du Git (mais les garder localement)
    git rm --cached backend/.env 2>/dev/null || echo "backend/.env déjà retiré"
    git rm --cached backend/.env.production 2>/dev/null || echo "backend/.env.production déjà retiré"
    git rm --cached front-end/.env 2>/dev/null || echo "front-end/.env déjà retiré"
    git rm --cached front-end/.env.production 2>/dev/null || echo "front-end/.env.production déjà retiré"
    git rm --cached front-end/.env.local 2>/dev/null || echo "front-end/.env.local déjà retiré"
    
    echo ""
    echo "✅ Fichiers .env retirés du Git"
    echo ""
    echo "📋 Prochaines étapes:"
    echo "1. Vérifiez que .gitignore contient bien .env"
    echo "2. Commitez les changements: git commit -m '🔒 Sécurité: Retirer les fichiers .env'"
    echo "3. Pushez: git push"
    echo "4. Configurez les variables d'environnement sur votre plateforme de déploiement"
    echo ""
else
    echo "❌ Opération annulée"
fi
