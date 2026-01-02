# Guide de Déploiement Vercel - EcoPulse Frontend

## Étapes de Déploiement

### 1. Préparation du Code
✅ Package.json nettoyé (dépendances front-end uniquement)
✅ Configuration Vite optimisée
✅ Configuration Vercel mise à jour

### 2. Configuration des Variables d'Environnement sur Vercel

Dans votre dashboard Vercel :
1. Allez dans **Settings** > **Environment Variables**
2. Ajoutez ces variables :

```
VITE_API_URL=https://ecopulse-backend-00i3.onrender.com
VITE_GOOGLE_MAPS_API_KEY=votre_cle_api_google_maps
VITE_FIREBASE_API_KEY=votre_cle_firebase
VITE_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre-projet-id
```

### 3. Déploiement via Git

```bash
# Dans le dossier front-end
git add .
git commit -m "Fix: Configuration Vercel optimisée"
git push origin main
```

### 4. Configuration Vercel Dashboard

1. **Build Command**: `npm run build`
2. **Output Directory**: `dist`
3. **Install Command**: `npm install`
4. **Root Directory**: `front-end`

### 5. Vérifications Post-Déploiement

- [ ] L'application se charge correctement
- [ ] Les appels API fonctionnent
- [ ] Le routing React fonctionne
- [ ] Les assets sont chargés

## Problèmes Courants et Solutions

### Erreur "Module not found"
- Vérifiez que toutes les dépendances sont dans `dependencies` (pas `devDependencies`)
- Relancez `npm install`

### Variables d'environnement non définies
- Vérifiez qu'elles sont configurées dans Vercel Dashboard
- Redéployez après ajout des variables

### Erreur de build
- Vérifiez les logs de build dans Vercel
- Testez localement avec `npm run build`

### Routing ne fonctionne pas
- Le `vercel.json` avec rewrites est configuré
- Vérifiez que React Router est bien configuré

## Commandes Utiles

```bash
# Test local du build
npm run build
npm run preview

# Vérification des dépendances
npm audit
npm update
```

## Support

Si le déploiement échoue encore :
1. Vérifiez les logs Vercel
2. Testez le build localement
3. Vérifiez la configuration des variables d'environnement