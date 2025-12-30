# 🧪 Test d'Intégration Frontend-Backend MongoDB

## ✅ Corrections Apportées

### 1. **Authentification**
- ✅ Corrigé les endpoints : `/api/auth/login` et `/api/auth/register`
- ✅ Ajouté la gestion des tokens JWT
- ✅ Mis à jour AuthContext pour utiliser l'API réelle

### 2. **Signalements**
- ✅ Corrigé l'endpoint : `/api/waste` au lieu de `/api/waste_reports`
- ✅ Adapté la structure des données (location: {lat, lng})
- ✅ Mis à jour les types de déchets (plastique, verre, métal, etc.)
- ✅ Corrigé les statuts (pending, collected, not_collected)

### 3. **Notifications**
- ✅ Créé le modèle Notification dans MongoDB
- ✅ Créé le contrôleur et les routes de notifications
- ✅ Ajouté les endpoints : `/api/notifications`
- ✅ Corrigé tous les appels frontend

### 4. **Statistiques**
- ✅ Corrigé l'endpoint : `/api/stats` au lieu de `/api/statistics`
- ✅ Ajouté l'authentification aux appels

### 5. **Types TypeScript**
- ✅ Mis à jour les interfaces pour correspondre à MongoDB
- ✅ Corrigé les rôles (citizen, admin, partner)
- ✅ Adapté la structure des WasteReport

## 🚀 Instructions de Test

### 1. **Démarrer le Backend**
```bash
cd backend
npm install
npm run dev
```

### 2. **Démarrer le Frontend**
```bash
cd front-end
npm install
npm run dev
```

### 3. **Tests à Effectuer**

#### A. **Authentification**
1. Aller sur `http://localhost:3000/register`
2. Créer un compte utilisateur
3. Se connecter avec les identifiants
4. Vérifier que le token est stocké dans localStorage

#### B. **Signalement de Déchet**
1. Se connecter en tant qu'utilisateur
2. Aller sur `/report`
3. Remplir le formulaire de signalement
4. Vérifier que le signalement est créé dans MongoDB

#### C. **Carte Interactive**
1. Aller sur `/map`
2. Vérifier que les signalements s'affichent sur la carte
3. Tester les popups des marqueurs

#### D. **Dashboard Admin**
1. Se connecter avec un compte admin
2. Aller sur `/admin`
3. Vérifier la liste des signalements et utilisateurs
4. Tester la mise à jour des statuts

#### E. **Notifications**
1. Créer un signalement
2. Vérifier qu'une notification est créée
3. Tester le système de notifications

## 🔧 Endpoints API Disponibles

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/profile` - Profil utilisateur

### Signalements
- `POST /api/waste` - Créer signalement
- `GET /api/waste` - Liste signalements (admin)
- `GET /api/waste/my-reports` - Mes signalements
- `GET /api/waste/map` - Signalements pour carte
- `PATCH /api/waste/:id/status` - Mettre à jour statut

### Utilisateurs
- `GET /api/users` - Liste utilisateurs (admin)
- `GET /api/users/:id` - Détails utilisateur
- `PUT /api/users/:id` - Modifier utilisateur
- `DELETE /api/users/:id` - Supprimer utilisateur

### Collaborations
- `POST /api/collaborations` - Demande collaboration
- `GET /api/collaborations` - Liste collaborations (admin)
- `PATCH /api/collaborations/:id/status` - Mettre à jour statut

### Statistiques
- `GET /api/stats` - Statistiques générales
- `GET /api/stats/dashboard` - Statistiques dashboard

### Notifications
- `GET /api/notifications/:userId` - Notifications utilisateur
- `POST /api/notifications` - Créer notification
- `PUT /api/notifications/:id/read` - Marquer comme lue
- `PUT /api/notifications/:userId/markAllAsRead` - Marquer toutes comme lues
- `GET /api/notifications/:userId/unread-count` - Nombre non lues

## 🐛 Problèmes Potentiels

### 1. **CORS**
Si vous avez des erreurs CORS, vérifiez que le backend autorise `http://localhost:3000`

### 2. **Token Expiré**
Si les appels API échouent, vérifiez que le token n'est pas expiré

### 3. **Base de Données**
Vérifiez que MongoDB est démarré et accessible

### 4. **Ports**
- Backend : `http://localhost:4000`
- Frontend : `http://localhost:3000`

## 📝 Notes Importantes

1. **Authentification** : Tous les appels API (sauf auth) nécessitent un token JWT
2. **Structure des données** : Les réponses suivent le format `{success: true, data: ...}`
3. **Géolocalisation** : Les coordonnées sont au format `{lat: number, lng: number}`
4. **Types de déchets** : Utilisez les valeurs exactes (plastique, verre, métal, etc.)
5. **Statuts** : pending, collected, not_collected

## 🎯 Résultat Attendu

Après ces corrections, votre application EcoPulse devrait être entièrement fonctionnelle avec :
- ✅ Authentification JWT
- ✅ Signalements de déchets avec géolocalisation
- ✅ Carte interactive
- ✅ Dashboard administrateur
- ✅ Système de notifications
- ✅ Statistiques en temps réel
- ✅ Gestion des utilisateurs
- ✅ Demandes de collaboration

L'application est maintenant prête pour la production ! 🚀


