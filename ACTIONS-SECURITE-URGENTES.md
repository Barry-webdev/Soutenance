# 🚨 ACTIONS DE SÉCURITÉ URGENTES

## ⏰ À FAIRE IMMÉDIATEMENT (15 minutes)

### 1️⃣ Générer de nouvelles clés secrètes
```bash
cd backend
node scripts/generate-secrets.js
```
**Copiez les clés générées** et gardez-les en sécurité (ne les partagez JAMAIS).

---

### 2️⃣ Changer le mot de passe MongoDB
1. Allez sur [MongoDB Atlas](https://cloud.mongodb.com/)
2. Connectez-vous
3. **Database Access** → Trouvez l'utilisateur `Barry_Dev`
4. Cliquez sur **Edit** → **Edit Password**
5. Générez un nouveau mot de passe fort (ou utilisez celui du script)
6. **Update User**

---

### 3️⃣ Régénérer les clés Cloudinary
1. Allez sur [Cloudinary](https://cloudinary.com/)
2. Connectez-vous
3. **Settings** → **Security** → **Access Keys**
4. Cliquez sur **Regenerate API Secret**
5. Copiez le nouveau secret

---

### 4️⃣ Configurer les variables d'environnement sur Render/Railway

#### Sur Render :
1. Allez sur votre service backend
2. **Environment** → **Environment Variables**
3. Ajoutez/Modifiez :
   - `JWT_SECRET` = [nouvelle clé du script]
   - `SESSION_SECRET` = [nouvelle clé du script]
   - `MONGODB_URI` = [avec le nouveau mot de passe]
   - `CLOUDINARY_API_SECRET` = [nouveau secret Cloudinary]

#### Sur Railway :
1. Allez sur votre projet
2. **Variables** → Cliquez sur votre service
3. Ajoutez/Modifiez les mêmes variables

---

### 5️⃣ Retirer les fichiers .env du Git

**⚠️ IMPORTANT : Sauvegardez d'abord vos variables d'environnement !**

#### Sur Windows :
```cmd
remove-env-from-git.bat
```

#### Sur Mac/Linux :
```bash
chmod +x remove-env-from-git.sh
./remove-env-from-git.sh
```

Puis :
```bash
git commit -m "🔒 Sécurité: Retirer les fichiers .env"
git push
```

---

### 6️⃣ Redéployer l'application
1. **Backend** : Redéployez sur Render/Railway (automatique après le push)
2. **Frontend** : Redéployez sur Vercel (automatique après le push)

---

### 7️⃣ Tester que tout fonctionne
1. Essayez de vous connecter
2. Créez un signalement
3. Vérifiez que les images s'affichent

---

## ✅ CHECKLIST DE VÉRIFICATION

- [ ] Nouvelles clés générées avec le script
- [ ] Mot de passe MongoDB changé
- [ ] Clés Cloudinary régénérées
- [ ] Variables d'environnement configurées sur la plateforme
- [ ] Fichiers .env retirés du Git
- [ ] Code pushé sur GitHub
- [ ] Application redéployée
- [ ] Tests de connexion réussis
- [ ] Tests de signalement réussis

---

## 🔐 NOUVELLES PROTECTIONS ACTIVES

Après le redéploiement, votre application sera protégée contre :

✅ **Attaques par force brute** (5 tentatives max)
✅ **Spam de signalements** (10 max par heure)
✅ **Injections NoSQL** (sanitization automatique)
✅ **Injections SQL/XSS** (détection de patterns)
✅ **IDs invalides** (validation MongoDB ObjectId)
✅ **CORS non autorisés** (whitelist stricte)
✅ **Rate limiting** (100 requêtes/15min)

---

## 📞 EN CAS DE PROBLÈME

### Si l'application ne démarre pas :
1. Vérifiez les logs sur Render/Railway
2. Vérifiez que toutes les variables d'environnement sont définies
3. Vérifiez que JWT_SECRET est bien défini (erreur critique si absent)

### Si la connexion ne fonctionne pas :
1. Vérifiez que MONGODB_URI est correct avec le nouveau mot de passe
2. Vérifiez que JWT_SECRET est identique partout

### Si les images ne s'affichent pas :
1. Vérifiez que CLOUDINARY_API_SECRET est correct
2. Vérifiez les logs Cloudinary

---

## 📚 DOCUMENTATION COMPLÈTE

Pour plus de détails, consultez **GUIDE-SECURITE.md**

---

**⏱️ Temps estimé : 15-20 minutes**
**🎯 Priorité : CRITIQUE**
