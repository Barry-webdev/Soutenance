# Guide de Dépannage CORS - EcoPulse

## 🚨 Problème Actuel
- **Frontend Vercel**: https://ecopulse-app-web.vercel.app
- **Backend Render**: https://ecopulse-backend-00i3.onrender.com
- **Erreur**: "Non autorisé par CORS"

## ✅ Corrections Appliquées

### 1. Configuration CORS Backend (server.js)
```javascript
// CORS permissif pour tous les domaines Vercel
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (origin.includes('localhost')) return callback(null, true);
        if (origin.includes('vercel.app')) return callback(null, true);
        callback(null, true); // Permissif en production
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
```

### 2. URLs Frontend Corrigées
- ✅ AuthContext utilise `buildApiUrl()`
- ✅ NotificationContext utilise `buildApiUrl()`
- ✅ Images utilisent `buildImageUrl()`

### 3. Variables d'Environnement Vercel
```
VITE_API_URL=https://ecopulse-backend-00i3.onrender.com
```

## 🔧 Étapes de Vérification

### 1. Vérifier le Redéploiement Render
1. Allez sur [render.com](https://render.com)
2. Ouvrez votre service backend
3. Vérifiez que le dernier commit est déployé
4. Regardez les logs de déploiement

### 2. Forcer le Redéploiement (si nécessaire)
1. Dans Render Dashboard
2. Cliquez sur "Manual Deploy"
3. Sélectionnez "Deploy latest commit"

### 3. Vérifier les Variables Vercel
1. Vercel Dashboard > Settings > Environment Variables
2. Vérifiez que `VITE_API_URL` est définie
3. Redéployez Vercel si nécessaire

### 4. Test de Connexion
```bash
# Tester depuis votre machine
node test-cors-production.js
```

## 🚀 Solution Temporaire (si CORS persiste)

Si le problème persiste, ajoutez cette configuration ultra-permissive temporairement :

```javascript
// Dans backend/server.js - TEMPORAIRE SEULEMENT
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});
```

## 📋 Checklist de Dépannage

- [ ] Backend Render redéployé avec nouvelle config CORS
- [ ] Frontend Vercel redéployé avec URLs corrigées
- [ ] Variable `VITE_API_URL` configurée dans Vercel
- [ ] Test de connexion réussi
- [ ] Login admin/citoyen fonctionnel
- [ ] Images s'affichent correctement

## 🆘 Si Rien ne Fonctionne

1. **Vérifiez les logs Render** pour voir les erreurs CORS
2. **Testez l'API directement** avec Postman/curl
3. **Vérifiez la console navigateur** pour les erreurs détaillées
4. **Contactez-moi** avec les logs d'erreur spécifiques

## 📞 Commandes de Test Rapide

```bash
# Test backend disponible
curl https://ecopulse-backend-00i3.onrender.com/health

# Test CORS avec Origin
curl -H "Origin: https://ecopulse-app-web.vercel.app" \
     -H "Content-Type: application/json" \
     -X POST \
     https://ecopulse-backend-00i3.onrender.com/api/auth/login \
     -d '{"email":"admin@ecopulse.com","password":"admin123"}'
```