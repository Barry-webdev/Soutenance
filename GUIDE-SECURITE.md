# 🔒 Guide de Sécurité - EcoPulse

## ⚠️ ACTIONS URGENTES À FAIRE IMMÉDIATEMENT

### 1. **CHANGER LE JWT_SECRET** (CRITIQUE)
Votre JWT_SECRET actuel est exposé dans le code. **Changez-le immédiatement !**

```bash
# Générer une nouvelle clé sécurisée (64 caractères minimum)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copiez le résultat et mettez-le dans vos variables d'environnement :
- **Render/Railway** : Variables d'environnement → `JWT_SECRET`
- **Vercel** : Environment Variables → `JWT_SECRET`

### 2. **SÉCURISER MONGODB** (CRITIQUE)
Votre connexion MongoDB est exposée avec le mot de passe en clair.

**Actions à faire :**
1. Connectez-vous à MongoDB Atlas
2. Allez dans **Database Access**
3. **Changez le mot de passe** de l'utilisateur `Barry_Dev`
4. Mettez à jour `MONGODB_URI` dans vos variables d'environnement

### 3. **RÉGÉNÉRER LES CLÉS CLOUDINARY** (ÉLEVÉ)
Vos credentials Cloudinary sont exposés.

**Actions à faire :**
1. Connectez-vous à Cloudinary
2. Allez dans **Settings → Security**
3. **Régénérez l'API Secret**
4. Mettez à jour les variables d'environnement

### 4. **AJOUTER .env AU .gitignore** (CRITIQUE)
Vos fichiers `.env` ne doivent JAMAIS être dans Git !

```bash
# Vérifier que .env est ignoré
cat .gitignore | grep .env

# Si absent, ajouter :
echo ".env" >> backend/.gitignore
echo ".env.production" >> backend/.gitignore
echo ".env.local" >> front-end/.gitignore

# Supprimer les fichiers .env du Git
git rm --cached backend/.env
git rm --cached backend/.env.production
git rm --cached front-end/.env
git rm --cached front-end/.env.production
git commit -m "🔒 Sécurité: Retirer les fichiers .env du Git"
git push
```

---

## 🛡️ PROTECTIONS AJOUTÉES

### ✅ **1. Protection contre les attaques par force brute**
- **Limitation stricte** : 5 tentatives de connexion par 15 minutes
- **Appliqué sur** : `/api/auth/login` et `/api/auth/register`

### ✅ **2. Protection contre le spam de signalements**
- **Limitation** : 10 signalements maximum par heure
- **Appliqué sur** : `/api/waste` (POST)

### ✅ **3. Protection contre les injections NoSQL**
- **Sanitization** : Nettoyage automatique des entrées utilisateur
- **Blocage** : Opérateurs MongoDB dangereux (`$where`, `$regex`, etc.)

### ✅ **4. Protection contre les injections SQL/XSS**
- **Détection** : Patterns suspects dans les requêtes
- **Logging** : Activités suspectes enregistrées

### ✅ **5. Validation stricte des IDs MongoDB**
- **Format** : Vérification du format ObjectId (24 caractères hex)
- **Appliqué sur** : Toutes les routes avec paramètre `:id`

### ✅ **6. CORS Sécurisé**
- **Whitelist** : Seules les origines autorisées peuvent accéder
- **Origines autorisées** :
  - `http://localhost:3002`
  - `http://localhost:5173`
  - `https://ecopulse-app.vercel.app`
  - `https://ecopulse-wine.vercel.app`

### ✅ **7. Headers de sécurité (Helmet)**
- **Content Security Policy** : Protection contre XSS
- **X-Frame-Options** : Protection contre clickjacking
- **X-Content-Type-Options** : Protection contre MIME sniffing

### ✅ **8. Rate Limiting Global**
- **Limitation** : 100 requêtes par 15 minutes par IP
- **Appliqué sur** : Toutes les routes `/api/*`

---

## 📋 CHECKLIST DE SÉCURITÉ

### Avant le déploiement :
- [ ] JWT_SECRET changé (64+ caractères aléatoires)
- [ ] Mot de passe MongoDB changé
- [ ] Cloudinary API Secret régénéré
- [ ] Fichiers .env retirés du Git
- [ ] Variables d'environnement configurées sur la plateforme de déploiement
- [ ] CORS configuré avec les bonnes origines
- [ ] Rate limiting activé
- [ ] Helmet activé

### Après le déploiement :
- [ ] Tester la connexion avec les nouvelles credentials
- [ ] Vérifier que les anciennes credentials ne fonctionnent plus
- [ ] Tester le rate limiting (5 tentatives de connexion échouées)
- [ ] Vérifier les logs pour détecter les activités suspectes

---

## 🚨 DÉTECTION D'INTRUSION

### Logs à surveiller :
```bash
# Activités suspectes
grep "ACTIVITÉ SUSPECTE" logs/*.log

# Tentatives de connexion échouées
grep "USER_LOGIN_FAILED" logs/*.log

# Rate limiting déclenché
grep "Trop de requêtes" logs/*.log
```

### Patterns suspects détectés automatiquement :
- Opérateurs MongoDB : `$where`, `$regex`, `$ne`, `$gt`, `$lt`
- SQL Injection : `union`, `select`, `insert`, `update`, `delete`
- XSS : `<script>`, `javascript:`, `onerror=`, `onload=`
- Path Traversal : `../`, `..\\`

---

## 🔐 BONNES PRATIQUES

### 1. **Mots de passe**
- Minimum 12 caractères
- Mélange de majuscules, minuscules, chiffres, symboles
- Utiliser un gestionnaire de mots de passe

### 2. **Tokens JWT**
- Durée de vie courte (24h maximum)
- Stockage sécurisé (localStorage avec précautions)
- Renouvellement automatique

### 3. **Variables d'environnement**
- Jamais dans le code source
- Jamais dans Git
- Différentes pour dev/staging/production

### 4. **Uploads de fichiers**
- Validation stricte du type MIME
- Limitation de taille (15MB images, 5MB audio)
- Scan antivirus recommandé en production

### 5. **Base de données**
- Connexion chiffrée (SSL/TLS)
- Utilisateur avec privilèges minimaux
- Sauvegardes régulières

---

## 📞 EN CAS D'INCIDENT

### Si vous détectez une intrusion :

1. **Immédiat** :
   - Changer tous les mots de passe
   - Régénérer toutes les clés API
   - Bloquer l'IP suspecte

2. **Court terme** :
   - Analyser les logs
   - Identifier les données compromises
   - Notifier les utilisateurs si nécessaire

3. **Long terme** :
   - Renforcer les protections
   - Audit de sécurité complet
   - Formation de l'équipe

---

## 🔄 MISES À JOUR DE SÉCURITÉ

### Dépendances à surveiller :
```bash
# Vérifier les vulnérabilités
npm audit

# Corriger automatiquement
npm audit fix

# Mettre à jour les dépendances
npm update
```

### Dépendances critiques :
- `jsonwebtoken` : Gestion des tokens
- `bcryptjs` : Hashage des mots de passe
- `helmet` : Headers de sécurité
- `express-rate-limit` : Limitation de taux
- `mongoose` : ORM MongoDB

---

## 📚 RESSOURCES

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)

---

## ✅ RÉSUMÉ DES FICHIERS MODIFIÉS

1. `backend/middlewares/authMiddleware.js` - Suppression du fallback secret
2. `backend/models/userModel.js` - Vérification JWT_SECRET obligatoire
3. `backend/server.js` - CORS strict + Rate limiting amélioré
4. `backend/middlewares/securityMiddleware.js` - **NOUVEAU** - Protections avancées
5. `backend/routes/authRoute.js` - Protection force brute
6. `backend/routes/wasteRoute.js` - Protection spam + validation IDs
7. `backend/.env.example` - **NOUVEAU** - Template sécurisé

---

**🔒 La sécurité est un processus continu, pas un état final !**
