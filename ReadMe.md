# Waste Management App - Backend API

## Description du Projet

Backend pour l'application de gestion des déchets dans la préfecture de Pita, Guinée. Cette API permet aux citoyens de signaler des déchets, aux administrateurs de gérer les collectes, et aux partenaires de collaborer pour un environnement plus propre.

## Démarrage Rapide

### Prérequis
- **Node.js** (v18 ou supérieur)
- **MongoDB** (local ou Atlas)
- **Postman** (pour tester l'API)

### Installation

1. **Cloner le repository**
```bash
git clone <votre-repo>
cd backend
Installer les dépendances

bash
npm install
Configurer l'environnement

bash
cp .env.example .env
Editez le fichier .env :

Contenue du fichier .env:
NODE_ENV=development
PORT=4000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/wastemanage

# JWT
JWT_SECRET=votre_super_secret_jwt_très_long_et_complexe

# Frontend
FRONTEND_URL=http://localhost:3000

# Google Maps (optionnel)
GOOGLE_MAPS_API_KEY=votre_cle_api_google_maps

# Firebase (pour notifications)
FIREBASE_SERVICE_ACCOUNT=chemin/vers/firebase-config.json


bash
# Développement
npm run dev

# Production
npm start
🧪 Guide Complet de Test avec Postman
📋 Prérequis pour les tests
Créer une collection Postman

Nouvelle collection : "Waste Management App"

Variables d'environnement :

baseUrl : http://localhost:4000/api

token : (sera automatiquement rempli après login)

Structure des dossiers dans Postman

text
Waste Management App/
├── 🔐 Authentication
├── 🗑️ Waste Reports
├── 🤝 Collaborations
├── 👥 Users (Admin)
├── 📊 Statistics (Admin)
└── 🛡️ Security Tests
🔐 AUTHENTIFICATION
POST - Inscription Utilisateur
text
POST {{baseUrl}}/auth/register
Body (JSON):

json
{
    "name": "John Doe",
    "email": "john.citizen@email.com",
    "password": "password123",
    "role": "citizen"
}
Rôles disponibles : citizen, admin, partner

POST - Inscription Admin (pour tests)
json
{
    "name": "Admin User",
    "email": "admin@wastemanage.com",
    "password": "admin123",
    "role": "admin"
}
POST - Connexion
text
POST {{baseUrl}}/auth/login
Body:

json
{
    "email": "john.citizen@email.com",
    "password": "password123"
}
GET - Profil Utilisateur
text
GET {{baseUrl}}/auth/profile
Headers:

text
Authorization: Bearer {{token}}
🗑️ SIGNALEMENTS DE DÉCHETS
POST - Créer un Signalement (Citoyen)
text
POST {{baseUrl}}/waste
Headers:

text
Authorization: Bearer {{citizen_token}}
Content-Type: application/json
Body:

json
{
    "description": "Déchets plastiques abandonnés près du marché central",
    "imageUrl": "https://example.com/plastic-waste.jpg",
    "location": {
        "lat": 10.8065,
        "lng": -12.8347
    },
    "wasteType": "plastique"
}
Types de déchets disponibles : plastique, verre, métal, organique, papier, dangereux, autre

GET - Mes Signalements (Citoyen)
text
GET {{baseUrl}}/waste/my-reports
Headers:

text
Authorization: Bearer {{citizen_token}}
GET - Tous les Signalements (Admin)
text
GET {{baseUrl}}/waste?page=1&limit=10
Headers:

text
Authorization: Bearer {{admin_token}}
GET - Signalements sur Carte
text
GET {{baseUrl}}/waste/map?lat=10.8065&lng=-12.8347&radius=5000
Headers:

text
Authorization: Bearer {{token}}
PATCH - Mettre à jour Statut (Admin)
text
PATCH {{baseUrl}}/waste/{{waste_report_id}}/status
Headers:

text
Authorization: Bearer {{admin_token}}
Content-Type: application/json
Body:

json
{
    "status": "collected"
}
Statuts disponibles : pending, collected, not_collected

🤝 COLLABORATIONS
POST - Soumettre une Demande de Collaboration (Public)
text
POST {{baseUrl}}/collaborations
Body:

json
{
    "organizationName": "Green Earth ONG",
    "contactPerson": "Marie Koné",
    "email": "contact@greenearth.org",
    "phone": "+224 623 45 67 89",
    "type": "ONG"
}
Types disponibles : ONG, Mairie, Entreprise

GET - Toutes les Demandes (Admin)
text
GET {{baseUrl}}/collaborations?status=pending
Headers:

text
Authorization: Bearer {{admin_token}}
PATCH - Mettre à jour Statut Collaboration (Admin)
text
PATCH {{baseUrl}}/collaborations/{{collaboration_id}}/status
Headers:

text
Authorization: Bearer {{admin_token}}
Content-Type: application/json
Body:

json
{
    "status": "approved"
}
Statuts disponibles : pending, approved, rejected

👥 GESTION UTILISATEURS (Admin)
GET - Tous les Utilisateurs
text
GET {{baseUrl}}/users?role=citizen
Headers:

text
Authorization: Bearer {{admin_token}}
GET - Utilisateur par ID
text
GET {{baseUrl}}/users/{{user_id}}
Headers:

text
Authorization: Bearer {{admin_token}}
PUT - Mettre à jour Utilisateur
text
PUT {{baseUrl}}/users/{{user_id}}
Headers:

text
Authorization: Bearer {{admin_token}}
Content-Type: application/json
Body:

json
{
    "name": "John Doe Updated",
    "points": 25,
    "isActive": true
}
DELETE - Supprimer Utilisateur
text
DELETE {{baseUrl}}/users/{{user_id}}
Headers:

text
Authorization: Bearer {{admin_token}}
📊 STATISTIQUES (Admin)
GET - Statistiques Générales
text
GET {{baseUrl}}/stats
Headers:

text
Authorization: Bearer {{admin_token}}
GET - Statistiques Dashboard
text
GET {{baseUrl}}/stats/dashboard
Headers:

text
Authorization: Bearer {{admin_token}}
🛡️ TESTS DE SÉCURITÉ
Test d'accès sans token
text
GET {{baseUrl}}/waste/my-reports
Réponse attendue (401) :

json
{
    "success": false,
    "error": "Accès refusé. Token manquant."
}
Test avec mauvais token
text
GET {{baseUrl}}/waste/my-reports
Headers:

text
Authorization: Bearer mauvais_token_ici
Test d'accès non autorisé
text
GET {{baseUrl}}/stats
Headers:

text
Authorization: Bearer {{citizen_token}}
Réponse attendue (403) :

json
{
    "success": false,
    "error": "Accès refusé. Droits administrateur requis."
}
📊 STRUCTURE DES RÉPONSES
Réponse Succès
json
{
    "success": true,
    "message": "Opération réussie",
    "data": { ... }
}
Réponse Erreur
json
{
    "success": false,
    "error": "Message d'erreur",
    "details": ["Détail erreur 1", "Détail erreur 2"]
}
🔐 SÉCURITÉ
Authentification : JWT Tokens

Validation : Données validées côté serveur

Sécurité : Helmet, CORS, Rate Limiting

Mots de passe : Chiffrés avec bcrypt

🎯 POUR LES DÉVELOPPEURS FRONTEND
Workflow Typique
Inscription/Connexion d'un citoyen

Création d'un signalement de déchet

Consultation de l'historique des signalements

Visualisation sur la carte

Points Importants
Token JWT : À inclure dans le header Authorization: Bearer <token>

Points : Les citoyens gagnent 10 points par signalement validé

Rôles : Gérer les accès selon le rôle (citizen, admin, partner)

Geolocalisation : Utiliser les coordonnées lat/lng pour la carte

Variables d'Environnement Frontend
env
REACT_APP_API_URL=http://localhost:4000/api
REACT_APP_MAPS_API_KEY=votre_cle_google_maps
Exemple d'Intégration Frontend
javascript
// Configuration axios
const API_BASE_URL = process.env.REACT_APP_API_URL;

// Interceptor pour ajouter le token
axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Exemple de création de signalement
const createWasteReport = async (reportData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/waste`, reportData);
        return response.data;
    } catch (error) {
        console.error('Erreur création signalement:', error);
        throw error;
    }
};
🚀 ENDPOINTS DISPONIBLES
Méthode	Endpoint	Rôle	Description
GET	/api/health	Public	Santé de l'API
POST	/api/auth/register	Public	Inscription
POST	/api/auth/login	Public	Connexion
GET	/api/auth/profile	Tous	Profil utilisateur
POST	/api/waste	Citizen/Partner	Créer signalement
GET	/api/waste/my-reports	Citizen/Partner	Mes signalements
GET	/api/waste/map	Tous	Signalements carte
GET	/api/waste	Admin	Tous signalements
PATCH	/api/waste/:id/status	Admin	Mettre à jour statut
POST	/api/collaborations	Public	Demande collaboration
GET	/api/collaborations	Admin	Demandes collaboration
PATCH	/api/collaborations/:id/status	Admin	Mettre à jour statut
GET	/api/users	Admin	Liste utilisateurs
GET	/api/users/:id	Admin	Détails utilisateur
PUT	/api/users/:id	Admin	Modifier utilisateur
DELETE	/api/users/:id	Admin	Supprimer utilisateur
GET	/api/stats	Admin	Statistiques générales
GET	/api/stats/dashboard	Admin	Statistiques dashboard
