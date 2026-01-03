# 🚀 FORCER LE REDÉPLOIEMENT RENDER

## 📋 Étapes pour redéployer manuellement :

### 1. **Dashboard Render :**
- Connecte-toi à https://dashboard.render.com
- Trouve ton service backend
- Clique sur le service

### 2. **Déploiement manuel :**
- Clique sur "Manual Deploy" 
- Sélectionne la branche "main"
- Clique "Deploy"

### 3. **Surveiller les logs :**
- Regarde les logs de build
- Attendre que le statut passe à "Live"
- Vérifier qu'il n'y a pas d'erreurs

### 4. **Test post-déploiement :**
```bash
# Health check
curl https://ton-backend.render.com/api/health

# Test nouvelles routes
curl https://ton-backend.render.com/api/users/manage \
  -H "Authorization: Bearer <token>"
```

## ⚠️ **Si le déploiement échoue :**

### Vérifier les variables d'environnement :
- `MONGODB_URI` : Correcte ?
- `JWT_SECRET` : Définie ?
- `NODE_ENV` : production
- `FRONTEND_URL` : URL Vercel correcte

### Logs d'erreur courants :
- Erreur MongoDB : Vérifier l'URI
- Erreur modules : Vérifier package.json
- Erreur CORS : Vérifier FRONTEND_URL

## 🎯 **Une fois redéployé :**
- Tester l'approbation des collaborations
- Vérifier la gestion des utilisateurs
- Confirmer que tout fonctionne