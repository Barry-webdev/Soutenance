# 🖼️ CONFIGURATION CLOUDINARY POUR IMAGES

## 🎯 Problème identifié :
Les images ne s'affichent pas car elles sont stockées localement sur Render (système éphémère).
Solution : Utiliser Cloudinary pour stockage persistant.

## 📋 Étapes de configuration :

### 1. **Compte Cloudinary :**
- Va sur https://cloudinary.com
- Crée un compte gratuit (si pas déjà fait)
- Va sur le Dashboard
- Note ces informations :

```
Cloud Name: [ton_cloud_name]
API Key: [ton_api_key] 
API Secret: [ton_api_secret]
```

### 2. **Configuration sur Render :**
- Va sur ton dashboard Render
- Clique sur ton service backend
- Va dans "Environment"
- Ajoute/modifie ces variables :

```env
CLOUDINARY_CLOUD_NAME=ton_cloud_name_reel
CLOUDINARY_API_KEY=ton_api_key_reel
CLOUDINARY_API_SECRET=ton_api_secret_reel
```

### 3. **Redéploiement :**
- Sauvegarde les variables
- Redéploie le service
- Les nouvelles images utiliseront Cloudinary

## 🔍 **Test de fonctionnement :**

### Après configuration :
1. Créer un nouveau signalement avec image
2. Vérifier que l'URL de l'image commence par "https://res.cloudinary.com"
3. L'image reste visible même après redéploiement

## ⚠️ **Images existantes :**
Les anciennes images (stockées localement) seront perdues.
Seules les nouvelles images (après config Cloudinary) seront persistantes.

## 🚀 **Avantages Cloudinary :**
- ✅ Stockage persistant (ne disparaît pas)
- ✅ CDN rapide mondial
- ✅ Optimisation automatique des images
- ✅ Redimensionnement à la volée
- ✅ 25GB gratuits par mois