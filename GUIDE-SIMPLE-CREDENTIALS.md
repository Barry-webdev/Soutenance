# 🔐 Guide Ultra-Simple - Changement des Credentials

## 🎯 OBJECTIF
Changer vos mots de passe et clés pour sécuriser l'application.

---

## 📝 VOS NOUVELLES CLÉS (À COPIER)

```
JWT_SECRET:
4f8c33ccb19cb9c849e8f0e4be6264f6a56e351468d072fdb4b25e2f8dda12706e304c2cdbb8b6e87d973d6ccb8cc9f1c3eac89df04e0618cbc7e92cde448144

SESSION_SECRET:
38a63d124e5d79b83a918aaa595a9493e12998fe663916f0e826926672bdc464

Nouveau mot de passe MongoDB:
vNpOvsgB14Lkf1X3TsWpRz3EL0rD0Arp
```

---

## 🔄 ÉTAPE 1/4 : MONGODB (5 minutes)

### Où aller ?
👉 https://cloud.mongodb.com/

### Que faire ?
1. **Connectez-vous**
2. Cliquez sur **"Database Access"** (menu gauche)
3. Trouvez **"Barry_Dev"** dans la liste
4. Cliquez sur **"Edit"** (bouton à droite)
5. Cliquez sur **"Edit Password"**
6. Collez : `vNpOvsgB14Lkf1X3TsWpRz3EL0rD0Arp`
7. Cliquez sur **"Update User"**

✅ **Terminé !** MongoDB est sécurisé.

---

## ☁️ ÉTAPE 2/4 : CLOUDINARY (3 minutes)

### Où aller ?
👉 https://cloudinary.com/

### Que faire ?
1. **Connectez-vous**
2. Cliquez sur l'icône **⚙️ Settings** (en haut à droite)
3. Cliquez sur **"Security"** (menu gauche)
4. Trouvez la section **"Access Keys"**
5. Cliquez sur **"Regenerate"** à côté de "API Secret"
6. **COPIEZ** le nouveau secret immédiatement
7. Notez-le quelque part (vous en aurez besoin à l'étape 3)

✅ **Terminé !** Cloudinary est sécurisé.

---

## 🚀 ÉTAPE 3/4 : RENDER (7 minutes)

### Où aller ?
👉 https://render.com/

### Que faire ?
1. **Connectez-vous**
2. Cliquez sur votre service **backend** (ecopulse-backend)
3. Cliquez sur **"Environment"** (menu gauche)
4. Modifiez ces 4 variables :

#### Variable 1 : JWT_SECRET
- Cliquez sur **"Edit"** à droite de JWT_SECRET
- Effacez l'ancienne valeur
- Collez : `4f8c33ccb19cb9c849e8f0e4be6264f6a56e351468d072fdb4b25e2f8dda12706e304c2cdbb8b6e87d973d6ccb8cc9f1c3eac89df04e0618cbc7e92cde448144`
- Cliquez sur **"Save"**

#### Variable 2 : MONGODB_URI
- Cliquez sur **"Edit"** à droite de MONGODB_URI
- Effacez l'ancienne valeur
- Collez : `mongodb+srv://Barry_Dev:vNpOvsgB14Lkf1X3TsWpRz3EL0rD0Arp@cluster1.nhifcv2.mongodb.net/EcoPulse`
- Cliquez sur **"Save"**

#### Variable 3 : CLOUDINARY_API_SECRET
- Cliquez sur **"Edit"** à droite de CLOUDINARY_API_SECRET
- Effacez l'ancienne valeur
- Collez le nouveau secret que vous avez copié de Cloudinary
- Cliquez sur **"Save"**

#### Variable 4 : SESSION_SECRET (Nouvelle variable)
- Cliquez sur **"Add Environment Variable"**
- Key : `SESSION_SECRET`
- Value : `38a63d124e5d79b83a918aaa595a9493e12998fe663916f0e826926672bdc464`
- Cliquez sur **"Save"**

5. Cliquez sur **"Save Changes"** (en haut)
6. **Attendez 2-3 minutes** que Render redéploie automatiquement

✅ **Terminé !** Render est configuré.

---

## 🧪 ÉTAPE 4/4 : TESTER (2 minutes)

### Que faire ?
1. Attendez que Render affiche **"Live"** (vert)
2. Ouvrez votre application : https://ecopulse-app.vercel.app/
3. Essayez de vous **connecter**
4. Essayez de créer un **signalement**

### Ça fonctionne ?
✅ **OUI** → Parfait ! Vous avez terminé !
❌ **NON** → Regardez les logs sur Render (onglet "Logs")

---

## 🗑️ BONUS : RETIRER .ENV DU GIT (2 minutes)

### Que faire ?
1. Ouvrez le terminal dans votre projet
2. Tapez : `remove-env-from-git.bat`
3. Tapez `o` et appuyez sur Entrée
4. Tapez : `git commit -m "Sécurité: Retirer .env"`
5. Tapez : `git push`

✅ **Terminé !** Les fichiers .env sont retirés du Git.

---

## ⏱️ RÉSUMÉ

| Étape | Temps | Difficulté |
|-------|-------|------------|
| 1. MongoDB | 5 min | ⭐ Facile |
| 2. Cloudinary | 3 min | ⭐ Facile |
| 3. Render | 7 min | ⭐⭐ Moyen |
| 4. Tester | 2 min | ⭐ Facile |
| **TOTAL** | **17 min** | **⭐ Facile** |

---

## 🆘 PROBLÈMES COURANTS

### "L'application ne démarre pas"
→ Allez sur Render → Logs
→ Vérifiez que JWT_SECRET est bien défini

### "Impossible de se connecter"
→ Vérifiez MONGODB_URI sur Render
→ Vérifiez qu'il n'y a pas d'espaces

### "Les images ne s'affichent pas"
→ Vérifiez CLOUDINARY_API_SECRET sur Render

---

## ✅ CHECKLIST RAPIDE

- [ ] MongoDB : Mot de passe changé
- [ ] Cloudinary : API Secret régénéré
- [ ] Render : JWT_SECRET mis à jour
- [ ] Render : MONGODB_URI mis à jour
- [ ] Render : CLOUDINARY_API_SECRET mis à jour
- [ ] Render : SESSION_SECRET ajouté
- [ ] Application testée et fonctionne
- [ ] .env retiré du Git

---

**🎉 Une fois terminé, votre application sera 100% sécurisée !**
