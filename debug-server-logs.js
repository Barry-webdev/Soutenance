/**
 * Script pour ajouter des logs de debug temporaires
 */

// Ajoutons des logs dans le middleware de validation
console.log('🔧 Ajout de logs de debug...');

// Instructions pour l'utilisateur
console.log(`
📋 INSTRUCTIONS DE DEBUG:

1. Ajoutez ces logs temporaires dans backend/middlewares/validationMiddleware.js
   dans la fonction validateWasteReport, après la ligne 75:

   console.log('🔍 DEBUG VALIDATION:');
   console.log('- description:', JSON.stringify(description));
   console.log('- hasDescription:', hasDescription);
   console.log('- audioFile:', audioFile ? 'présent' : 'absent');
   console.log('- hasAudio:', hasAudio);
   console.log('- Validation OU:', hasDescription || hasAudio);

2. Ajoutez ces logs dans backend/controllers/wasteController.js
   dans createWasteReport, avant WasteReport.create():

   console.log('🔍 DEBUG CREATION:');
   console.log('- description:', JSON.stringify(description));
   console.log('- audio:', audio ? 'présent' : 'absent');

3. Redémarrez le serveur
4. Essayez de soumettre avec juste une description
5. Regardez les logs dans la console du serveur
6. Partagez-moi les logs pour identifier le problème exact

Voulez-vous que j'ajoute ces logs automatiquement ?
`);