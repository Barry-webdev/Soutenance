// Test d'upload d'image pour les signalements
import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

const API_URL = 'https://ecopulse-backend-00i3.onrender.com';

// Fonction pour tester l'upload d'image
async function testImageUpload() {
    try {
        console.log('🔍 Test d\'upload d\'image...');
        
        // D'abord, on doit se connecter pour obtenir un token
        console.log('📝 Connexion...');
        const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'babdoulrazzai@gmail.com', // Email admin de test
                password: 'password123' // Mot de passe de test
            })
        });

        if (!loginResponse.ok) {
            console.log('❌ Échec de la connexion');
            const errorData = await loginResponse.text();
            console.log('Erreur:', errorData);
            return;
        }

        const loginData = await loginResponse.json();
        const token = loginData.data.token;
        console.log('✅ Connexion réussie');

        // Créer une image de test simple (pixel blanc 1x1 PNG)
        const testImageBuffer = Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
            0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
            0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x0F, 0x00, 0x00,
            0x01, 0x00, 0x01, 0x5C, 0xC2, 0x8A, 0x8E, 0x00, 0x00, 0x00, 0x00, 0x49,
            0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
        ]);

        // Créer FormData pour l'upload
        const formData = new FormData();
        formData.append('description', 'Test d\'upload d\'image depuis script');
        formData.append('wasteType', 'plastique');
        formData.append('location[lat]', '48.8566');
        formData.append('location[lng]', '2.3522');
        formData.append('image', testImageBuffer, {
            filename: 'test-image.png',
            contentType: 'image/png'
        });

        console.log('📤 Envoi du signalement avec image...');
        const uploadResponse = await fetch(`${API_URL}/api/waste`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const responseData = await uploadResponse.json();
        
        if (uploadResponse.ok) {
            console.log('✅ Upload réussi !');
            console.log('📊 Données du signalement:', JSON.stringify(responseData, null, 2));
            
            // Tester l'accès à l'image
            if (responseData.data.images && responseData.data.images.thumbnail) {
                const imageUrl = `${API_URL}${responseData.data.images.thumbnail.url}`;
                console.log('🖼️ Test d\'accès à l\'image:', imageUrl);
                
                const imageResponse = await fetch(imageUrl);
                if (imageResponse.ok) {
                    console.log('✅ Image accessible !');
                } else {
                    console.log('❌ Image non accessible:', imageResponse.status);
                }
            }
        } else {
            console.log('❌ Échec de l\'upload');
            console.log('Erreur:', responseData);
        }

    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    }
}

// Lancer le test
testImageUpload();