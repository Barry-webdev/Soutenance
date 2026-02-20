@echo off
REM Script pour retirer les fichiers .env du Git (Windows)
REM ATTENTION: Exécutez ce script APRÈS avoir sauvegardé vos variables d'environnement ailleurs !

echo.
echo 🔒 Retrait des fichiers .env du Git...
echo.
echo ⚠️  ATTENTION: Assurez-vous d'avoir sauvegardé vos variables d'environnement !
echo ⚠️  Les fichiers seront retirés du Git mais resteront sur votre disque local.
echo.
set /p confirm="Continuer ? (o/n): "

if /i "%confirm%"=="o" (
    echo.
    echo Retrait des fichiers .env...
    
    git rm --cached backend\.env 2>nul || echo backend\.env déjà retiré
    git rm --cached backend\.env.production 2>nul || echo backend\.env.production déjà retiré
    git rm --cached front-end\.env 2>nul || echo front-end\.env déjà retiré
    git rm --cached front-end\.env.production 2>nul || echo front-end\.env.production déjà retiré
    git rm --cached front-end\.env.local 2>nul || echo front-end\.env.local déjà retiré
    
    echo.
    echo ✅ Fichiers .env retirés du Git
    echo.
    echo 📋 Prochaines étapes:
    echo 1. Vérifiez que .gitignore contient bien .env
    echo 2. Commitez les changements: git commit -m "🔒 Sécurité: Retirer les fichiers .env"
    echo 3. Pushez: git push
    echo 4. Configurez les variables d'environnement sur votre plateforme de déploiement
    echo.
) else (
    echo.
    echo ❌ Opération annulée
    echo.
)

pause
