# Configuration Vercel pour EcoPulse

## Variables d'environnement à configurer sur Vercel

Dans les paramètres de ton projet Vercel, ajoute cette variable :

```
VITE_API_URL = https://ecopulse-backend-00i3.onrender.com
```

## Étapes pour configurer :

1. Va sur https://vercel.com/dashboard
2. Sélectionne ton projet EcoPulse
3. Va dans **Settings** > **Environment Variables**
4. Ajoute :
   - **Name**: `VITE_API_URL`
   - **Value**: `https://ecopulse-backend-00i3.onrender.com`
   - **Environments**: Production, Preview, Development (tous cochés)

## Redéploiement

Après avoir ajouté la variable :
1. Va dans l'onglet **Deployments**
2. Clique sur les 3 points du dernier déploiement
3. Sélectionne **Redeploy**

## Test de connexion

Une fois redéployé, teste avec ces identifiants :
- **Email**: `babdoulrazzai@gmail.com`
- **Password**: `kathioure`

## URLs attendues

- **Frontend**: `https://ecopulse.vercel.app` (ou ton URL Vercel)
- **Backend**: `https://ecopulse-backend-00i3.onrender.com`

## Diagnostic

Si ça ne marche toujours pas, ouvre la console du navigateur (F12) et regarde les erreurs réseau.