// Test pour vérifier que le signalement fonctionne avec description seule OU audio seul (EXCLUSIF)
const API_URL = process.env.API_URL || 'http://localhost:5000';

async function testSignalementDescriptionSeule() {
    console.log('🧪 Test: Signalement avec description seule (sans audio)...');
    
    const formData = new FormData();
    formData.append('description', 'Test de signalement avec description seule');
    formData.append('wasteType', 'plastique');
    formData.append('location', JSON.stringify({
        lat: 11.0583,  // Coordonnées de Pita
        lng: -12.7500
    }));
    
    // Simuler une image (vous devrez remplacer par une vraie image pour un test complet)
    const fakeImageBlob = new Blob(['fake image data'], { type: 'image/jpeg' });
    formData.append('image', fakeImageBlob, 'test.jpg');
    // PAS D'AUDIO - c'est le test
    
    try {
        const response = await fetch(`${API_URL}/api/waste`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer YOUR_TOKEN_HERE' // Remplacez par un vrai token
            },
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ SUCCESS: Signalement avec description seule fonctionne !');
            console.log('Réponse:', result);
        } else {
            console.log('❌ ERREUR:', result);
        }
    } catch (error) {
        console.log('❌ ERREUR RÉSEAU:', error.message);
    }
}

async function testSignalementAudioSeul() {
    console.log('🧪 Test: Signalement avec audio seul (sans description)...');
    
    const formData = new FormData();
    formData.append('description', ''); // Description vide - c'est le test
    formData.append('wasteType', 'plastique');
    formData.append('location', JSON.stringify({
        lat: 11.0583,
        lng: -12.7500
    }));
    
    // Simuler une image et un audio
    const fakeImageBlob = new Blob(['fake image data'], { type: 'image/jpeg' });
    const fakeAudioBlob = new Blob(['fake audio data'], { type: 'audio/webm' });
    
    formData.append('image', fakeImageBlob, 'test.jpg');
    formData.append('audio', fakeAudioBlob, 'test.webm');
    formData.append('audioDuration', '5');
    
    try {
        const response = await fetch(`${API_URL}/api/waste`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer YOUR_TOKEN_HERE'
            },
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ SUCCESS: Signalement avec audio seul fonctionne !');
            console.log('Réponse:', result);
        } else {
            console.log('❌ ERREUR:', result);
        }
    } catch (error) {
        console.log('❌ ERREUR RÉSEAU:', error.message);
    }
}

async function testSignalementDescriptionEtAudio() {
    console.log('🧪 Test: Signalement avec description ET audio (doit être rejeté)...');
    
    const formData = new FormData();
    formData.append('description', 'Test avec description ET audio - doit échouer');
    formData.append('wasteType', 'plastique');
    formData.append('location', JSON.stringify({
        lat: 11.0583,
        lng: -12.7500
    }));
    
    const fakeImageBlob = new Blob(['fake image data'], { type: 'image/jpeg' });
    const fakeAudioBlob = new Blob(['fake audio data'], { type: 'audio/webm' });
    
    formData.append('image', fakeImageBlob, 'test.jpg');
    formData.append('audio', fakeAudioBlob, 'test.webm'); // Les deux présents
    formData.append('audioDuration', '5');
    
    try {
        const response = await fetch(`${API_URL}/api/waste`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer YOUR_TOKEN_HERE'
            },
            body: formData
        });
        
        const result = await response.json();
        
        if (!response.ok && result.error?.includes('pas les deux')) {
            console.log('✅ SUCCESS: Validation exclusive fonctionne - les deux ensemble sont rejetés !');
            console.log('Erreur attendue:', result.error);
        } else {
            console.log('❌ PROBLÈME: Les deux ensemble ont été acceptés (ne devrait pas arriver)');
            console.log('Réponse:', result);
        }
    } catch (error) {
        console.log('❌ ERREUR RÉSEAU:', error.message);
    }
}

// Exécuter les tests
console.log('🚀 Démarrage des tests de signalement EXCLUSIF...');
console.log('📋 Règles: Description OU Audio (jamais les deux ensemble)');
console.log('⚠️  ATTENTION: Remplacez YOUR_TOKEN_HERE par un vrai token d\'authentification');
console.log('⚠️  ATTENTION: Remplacez les fake blobs par de vrais fichiers pour un test complet');
console.log('');

// Décommentez pour exécuter les tests
// testSignalementDescriptionSeule();
// testSignalementAudioSeul();
// testSignalementDescriptionEtAudio(); // Ce test doit échouer (c'est normal)