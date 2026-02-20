# 🔐 Guide Étape par Étape - Changement des Credentials

## 📋 VOS NOUVELLES CLÉS GÉNÉRÉES

**⚠️ COPIEZ CES VALEURS MAINTENANT - NE LES PARTAGEZ JAMAIS !**

```
JWT_SECRET=4f8c33ccb19cb9c849e8f0e4be6264f6a56e351468d072fdb4b25e2f8dda12706e304c2cdbb8b6e87d973d6ccb8cc9f1c3eac89df04e0618cbc7e92cde448144

SESSION_SECRET=38a63d124e5d79b83a918aaa595a9493e12998fe663916f0e826926672bdc464

Mot de passe MongoDB suggéré=vNpOvsgB14Lkf1X3TsWpRz3EL0rD0Arp
```

---

## 🗂️ ÉTAPE 1 : CHANGER LE MOT DE PASSE MONGODB

### 1.1 Aller sur MongoDB Atlas
1. Ouvrez votre navigateur
2. Allez sur https://cloud.mongodb.com/
3. Connectez-vous avec votre compte

### 1.2 Accéder à Database Access
1. Dans le menu de gauche, cliquez sur **"Database Access"**
2. Vous verrez la liste des utilisateurs
3. Trouvez l'utilisateur **"Barry_Dev"**

### 1.3 Changer le mot de passe
1. Cliquez sur le bouton **"Edit"** à droite de Barry_Dev
2. Cliquez sur **"Edit Password"**
3. Choisissez **"Password"** (pas "Certificate")
4. Collez le nouveau mot de passe : `vNpOvsgB14Lkf1X3TsWpRz3EL0rD0Arp`
5. Cliquez sur **"Update User"**

### 1.4 Créer la nouvelle URI MongoDB
Votre nouvelle URI sera :
```
mongodb+srv://Barry_Dev:vNpOvsgB14Lkf1X3TsWpRz3EL0rD0Arp@cluster1.nhifcv2.mongodb.net/EcoPulse
```

**⚠️ Copiez cette URI, vous en aurez besoin !**

---

## ☁️ ÉTAPE 2 : CHANGER LES CLÉS CLOUDINARY

### 2.1 Aller sur Cloudinary
1. Ouvrez https://cloudinary.com/
2. Connectez-vous avec votre compte

### 2.2 Accéder aux paramètres de sécurité
1. Cliquez sur l'icône **"Settings"** (roue dentée) en haut à droite
2. Dans le menu de gauche, cliquez sur **"Security"**
3. Trouvez la section **"Access Keys"**

### 2.3 Régénérer l'API Secret
1. Trouvez votre clé API actuelle (665168472662122)
2. Cliquez sur **"Regenerate"** ou **"Generate New"** à côté de "API Secret"
3. **COPIEZ IMMÉDIATEMENT** le nouveau secret (il ne sera affiché qu'une fois)
4. Notez-le ici : `CLOUDINARY_API_SECRET=___________________`

---

## 🚀 ÉTAPE 3 : CONFIGURER SUR RENDER (Backend)

### 3.1 Aller sur Render
1. Ouvrez https://render.com/
2. Connectez-vous
3. Trouvez votre service backend (ecopulse-backend)

### 3.2 Accéder aux variables d'environnement
1. Cliquez sur votre service backend
2. Dans le menu de gauche, cliquez sur **"Environment"**
3. Vous verrez la liste des variables

### 3.3 Modifier les variables
Cliquez sur chaque variable et modifiez :

**JWT_SECRET** :
```
4f8c33ccb19cb9c849e8f0e4be6264f6a56e351468d072fdb4b25e2f8dda12706e304c2cdbb8b6e87d973d6ccb8cc9f1c3eac89df04e0618cbc7e92cde448144
```

**SESSION_SECRET** (Ajouter si n'existe pas) :
```
38a63d124e5d79b83a918aaa595a9493e12998fe663916f0e826926672bdc464
```

**MONGODB_URI** :
```
mongodb+srv://Barry_Dev:vNpOvsgB14Lkf1X3TsWpRz3EL0rD0Arp@cluster1.nhifcv2.mongodb.net/EcoPulse
```

**CLOUDINARY_API_SECRET** :
```
[Collez le nouveau secret que vous avez copié de Cloudinary]
```

### 3.4 Sauvegarder
1. Cliquez sur **"Save Changes"**
2. Render va automatiquement redéployer votre application
3. Attendez que le déploiement soit terminé (2-3 minutes)

---

## 📱 ÉTAPE 4 : VÉRIFIER SUR VERCEL (Frontend)

Le frontend n'a pas besoin de ces secrets, mais vérifiez que :

1. Allez sur https://vercel.com/
2. Trouvez votre projet frontend
3. Allez dans **"Settings"** → **"Environment Variables"**
4. Vérifiez que `VITE_API_URL` pointe bien vers votre backend Render

---

## 🧪 ÉTAPE 5 : TESTER L'APPLICATION

### 5.1 Attendre le redéploiement
1. Sur Render, attendez que le statut soit **"Live"** (vert)
2. Cela prend environ 2-3 minutes

### 5.2 Tester la connexion
1. Ouvrez votre application : https://ecopulse-app.vercel.app/
2. Essayez de vous connecter avec vos identifiants
3. Si ça fonctionne, c'est bon ! ✅

### 5.3 Tester un signalement
1. Créez un nouveau signalement
2. Ajoutez une photo
3. Vérifiez que l'image s'affiche correctement

### 5.4 Si ça ne fonctionne pas
1. Allez sur Render → Votre service → **"Logs"**
2. Cherchez les erreurs
3. Vérifiez que toutes les variables sont bien définies

---

## 🗑️ ÉTAPE 6 : RETIRER LES .ENV DU GIT

### 6.1 Exécuter le script
```cmd
remove-env-from-git.bat
```

### 6.2 Confirmer
1. Tapez `o` (oui) et appuyez sur Entrée
2. Les fichiers .env seront retirés du Git

### 6.3 Commit et Push
```cmd
git commit -m "🔒 Sécurité: Retirer les fichiers .env du Git"
git push
```

---

## ✅ CHECKLIST FINALE

Cochez au fur et à mesure :

- [ ] Mot de passe MongoDB changé sur MongoDB Atlas
- [ ] Nouvelle URI MongoDB créée
- [ ] Clés Cloudinary régénérées
- [ ] JWT_SECRET mis à jour sur Render
- [ ] SESSION_SECRET ajouté sur Render
- [ ] MONGODB_URI mis à jour sur Render
- [ ] CLOUDINARY_API_SECRET mis à jour sur Render
- [ ] Application redéployée sur Render
- [ ] Test de connexion réussi
- [ ] Test de signalement réussi
- [ ] Fichiers .env retirés du Git
- [ ] Changements pushés sur GitHub

---

## 🆘 EN CAS DE PROBLÈME

### Erreur "JWT_SECRET non défini"
→ Vérifiez que JWT_SECRET est bien dans les variables d'environnement Render

### Erreur de connexion MongoDB
→ Vérifiez que le mot de passe dans MONGODB_URI est correct
→ Vérifiez qu'il n'y a pas d'espaces avant/après

### Images ne s'affichent pas
→ Vérifiez CLOUDINARY_API_SECRET sur Render
→ Vérifiez les logs Cloudinary

### Application ne démarre pas
→ Allez sur Render → Logs
→ Cherchez l'erreur exacte
→ Vérifiez que toutes les variables sont définies

---

## 📞 BESOIN D'AIDE ?

Si vous êtes bloqué à une étape, dites-moi laquelle et je vous aiderai !

---

**⏱️ Temps estimé total : 15-20 minutes**
**🎯 Difficulté : Facile (suivez juste les étapes)**
