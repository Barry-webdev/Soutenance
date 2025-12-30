// Script de debug pour tester l'envoi de signalements
const testSignalement = async () => {
    const testData = {
        description: "Test de signalement - déchets plastiques",
        wasteType: "plastique",
        imageUrl: "https://example.com/test.jpg",
        location: {
            lat: 11.0591,
            lng: -12.3953
        }
    };

    console.log('🔍 Test d\'envoi de signalement...');
    console.log('📤 Données envoyées:', JSON.stringify(testData, null, 2));

    try {
        const response = await fetch('http://localhost:4000/api/waste', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_TOKEN_HERE' // Remplacez par un vrai token
            },
            body: JSON.stringify(testData)
        });

        console.log('📥 Statut de la réponse:', response.status);
        console.log('📥 Headers de la réponse:', Object.fromEntries(response.headers.entries()));

        const responseData = await response.json();
        console.log('📥 Données de la réponse:', JSON.stringify(responseData, null, 2));

        if (response.ok) {
            console.log('✅ Signalement créé avec succès !');
        } else {
            console.log('❌ Erreur lors de la création du signalement');
        }
    } catch (error) {
        console.error('❌ Erreur de connexion:', error.message);
    }
};

// Instructions d'utilisation
console.log(`
🧪 SCRIPT DE DEBUG POUR SIGNALEMENTS

Pour utiliser ce script :

1. Démarrez votre backend : npm run dev (dans le dossier backend)
2. Obtenez un token d'authentification valide
3. Remplacez 'YOUR_TOKEN_HERE' par votre token
4. Exécutez ce script dans la console du navigateur

Ou utilisez directement dans la console :
`);

// Exporter la fonction pour utilisation dans la console
if (typeof window !== 'undefined') {
    window.testSignalement = testSignalement;
    console.log('✅ Fonction testSignalement disponible dans window.testSignalement()');
}


