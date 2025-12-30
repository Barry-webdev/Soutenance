# 🚀 Guide de Lancement du Backend - EcoPulse App

## 📋 **Étapes de Lancement**

### **1. Installation des Dépendances**

```bash
# Naviguer vers le dossier backend
cd backend

# Installer toutes les dépendances (y compris les nouvelles)
npm install
```

**Dépendances importantes ajoutées :**
- `sharp` : Traitement d'images
- `multer` : Upload de fichiers
- `uuid` : Génération d'identifiants uniques

### **2. Configuration de l'Environnement**

Créez un fichier `.env` dans le dossier `backend` :

```bash
# backend/.env
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://localhost:27017/ecopulse
JWT_SECRET=votre_secret_jwt_tres_securise
FRONTEND_URL=http://localhost:3000
```

### **3. Vérification de MongoDB**

Assurez-vous que MongoDB est démarré :

```bash
# Windows (si installé localement)
net start MongoDB

# Ou via MongoDB Compass
# Ou via Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### **4. Lancement du Backend**

#### **Option A : Mode Développement (Recommandé)**
```bash
cd backend
npm run dev
```

#### **Option B : Mode Production**
```bash
cd backend
npm start
```

## ✅ **Résultat Attendu**

Si tout fonctionne correctement, vous devriez voir :

```
✅ Connexion à MongoDB Réussi !
🚀 Serveur démarré sur le port 4000
📊 Environnement: development
🌐 URL: http://localhost:4000
```

## 🔧 **Dépannage**

### **Erreur : "Cannot find module"**
```bash
# Réinstaller les dépendances
cd backend
rm -rf node_modules package-lock.json
npm install
```

### **Erreur : "MongoDB connection failed"**
```bash
# Vérifier que MongoDB est démarré
# Vérifier l'URL dans .env
# Tester la connexion : mongosh
```

### **Erreur : "Port 4000 already in use"**
```bash
# Changer le port dans .env
PORT=4001

# Ou tuer le processus
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:4000 | xargs kill -9
```

## 📁 **Structure des Dossiers**

Après le lancement, la structure devrait être :

```
backend/
├── uploads/                    # Dossier créé automatiquement
│   └── waste-reports/         # Images des signalements
├── node_modules/              # Dépendances
├── models/                     # Modèles MongoDB
├── controllers/               # Contrôleurs
├── routes/                    # Routes API
├── middlewares/               # Middlewares
├── services/                  # Services (imageService.js)
├── config/                    # Configuration
├── server.js                  # Point d'entrée
├── package.json               # Dépendances
└── .env                       # Variables d'environnement
```

## 🧪 **Test de Fonctionnement**

### **Test 1 : API de Base**
```bash
# Ouvrir un navigateur ou utiliser curl
curl http://localhost:4000/

# Réponse attendue :
{
  "success": true,
  "message": "Bienvenue sur Waste Management App API",
  "version": "1.0.0"
}
```

### **Test 2 : Upload d'Images**
```bash
# Tester l'upload d'image
curl -X POST http://localhost:4000/api/waste \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "description=Test" \
  -F "wasteType=plastique" \
  -F "location={\"lat\":11.0591,\"lng\":-12.3953}" \
  -F "image=@/path/to/image.jpg"
```

### **Test 3 : Vérifier les Images**
```bash
# Vérifier que le dossier uploads existe
ls -la backend/uploads/waste-reports/
```

## 🚀 **Scripts Disponibles**

```bash
# Développement avec rechargement automatique
npm run dev

# Production
npm start

# Tests
npm test

# Tests en mode watch
npm run test:watch
```

## 📊 **Monitoring**

### **Logs en Temps Réel**
Le backend affiche des logs détaillés :
- ✅ Connexions réussies
- ❌ Erreurs de validation
- 📸 Traitement d'images
- 🔐 Authentification
- 📊 Requêtes API

### **Endpoints Disponibles**
- `GET /` : Page d'accueil API
- `POST /api/auth/login` : Connexion
- `POST /api/auth/register` : Inscription
- `POST /api/waste` : Créer signalement (avec image)
- `GET /api/waste` : Liste signalements
- `GET /api/stats` : Statistiques
- `GET /uploads/*` : Servir les images

## 🎯 **Prochaines Étapes**

1. **Lancer le backend** : `npm run dev`
2. **Lancer le frontend** : `cd ../front-end && npm run dev`
3. **Tester l'application** : `http://localhost:3000`
4. **Tester l'upload d'images** : Aller sur `/report`

## 🆘 **Support**

Si vous rencontrez des problèmes :

1. **Vérifiez les logs** dans la console
2. **Vérifiez MongoDB** : `mongosh`
3. **Vérifiez les ports** : `netstat -an | findstr :4000`
4. **Réinstallez les dépendances** : `npm install`

**Votre backend EcoPulse est maintenant prêt avec le système d'images complet !** 🚀📸


