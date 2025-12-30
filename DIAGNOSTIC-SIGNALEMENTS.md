# 🔧 Diagnostic des Problèmes de Signalements

## 🚨 **Problèmes Courants et Solutions**

### 1. **Erreur d'Authentification**
```
❌ Token d'authentification manquant
```
**Solution :**
- Vérifiez que l'utilisateur est bien connecté
- Vérifiez que le token est stocké dans localStorage
- Reconnectez-vous si nécessaire

### 2. **Erreur de Validation**
```
❌ Données invalides
```
**Solutions :**
- Vérifiez que tous les champs obligatoires sont remplis
- Vérifiez le format des coordonnées GPS
- Vérifiez que le type de déchet est valide

### 3. **Erreur de Connexion**
```
❌ Erreur de connexion au serveur
```
**Solutions :**
- Vérifiez que le backend est démarré (port 4000)
- Vérifiez la connexion à MongoDB
- Vérifiez les logs du serveur

## 🧪 **Tests de Diagnostic**

### **Test 1 : Vérifier l'Authentification**
```javascript
// Dans la console du navigateur
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
```

### **Test 2 : Tester l'API Directement**
```javascript
// Test simple de l'API
fetch('http://localhost:4000/api/waste', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: JSON.stringify({
    description: "Test",
    wasteType: "plastique",
    location: { lat: 11.0591, lng: -12.3953 }
  })
})
.then(res => res.json())
.then(data => console.log('Réponse:', data))
.catch(err => console.error('Erreur:', err));
```

### **Test 3 : Vérifier les Logs du Serveur**
Regardez la console du backend pour voir les erreurs détaillées.

## 🔍 **Étapes de Diagnostic**

### **Étape 1 : Vérifier le Backend**
```bash
cd backend
npm run dev
```
Vérifiez que le serveur démarre sans erreur.

### **Étape 2 : Vérifier MongoDB**
```bash
# Vérifiez que MongoDB est démarré
mongosh
# ou
mongo
```

### **Étape 3 : Tester l'Authentification**
1. Allez sur `/login`
2. Connectez-vous avec un compte valide
3. Vérifiez que le token est stocké

### **Étape 4 : Tester le Signalement**
1. Allez sur `/report`
2. Remplissez le formulaire
3. Ouvrez la console du navigateur (F12)
4. Regardez les logs de debug

## 🛠️ **Solutions par Type d'Erreur**

### **Erreur 401 (Non autorisé)**
```javascript
// Vérifiez le token
const token = localStorage.getItem('token');
if (!token) {
  // Rediriger vers login
  window.location.href = '/login';
}
```

### **Erreur 400 (Données invalides)**
```javascript
// Vérifiez les données avant envoi
const data = {
  description: description.trim(),
  wasteType: wasteType,
  location: {
    lat: parseFloat(location.latitude),
    lng: parseFloat(location.longitude)
  }
};
```

### **Erreur 500 (Erreur serveur)**
- Vérifiez les logs du backend
- Vérifiez la connexion à MongoDB
- Vérifiez les middlewares d'authentification

## 📋 **Checklist de Diagnostic**

- [ ] Backend démarré sur le port 4000
- [ ] MongoDB connecté et accessible
- [ ] Utilisateur authentifié avec token valide
- [ ] Données du formulaire valides
- [ ] Coordonnées GPS correctes
- [ ] Type de déchet valide
- [ ] Description non vide
- [ ] Pas d'erreurs dans la console
- [ ] Pas d'erreurs dans les logs du serveur

## 🚀 **Test Rapide**

Pour tester rapidement, utilisez ce code dans la console :

```javascript
// Test complet de signalement
const testSignalement = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('❌ Pas de token - connectez-vous d\'abord');
    return;
  }

  const testData = {
    description: "Test de signalement automatique",
    wasteType: "plastique",
    location: { lat: 11.0591, lng: -12.3953 }
  };

  try {
    const response = await fetch('http://localhost:4000/api/waste', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testData)
    });

    const data = await response.json();
    console.log('✅ Réponse:', data);
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
};

testSignalement();
```

## 📞 **Support**

Si le problème persiste :
1. Copiez les logs de la console
2. Copiez les logs du serveur
3. Décrivez les étapes pour reproduire le problème
4. Indiquez le navigateur et la version utilisée


