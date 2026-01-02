// Test pour voir les utilisateurs existants
import fetch from 'node-fetch';

const API_URL = 'https://ecopulse-backend-00i3.onrender.com';

async function testUsers() {
    try {
        console.log('🔍 Test de création d\'utilisateur...');
        
        // Créer un utilisateur de test
        const registerResponse = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User'
            })
        });

        const registerData = await registerResponse.json();
        
        if (registerResponse.ok) {
            console.log('✅ Utilisateur créé avec succès');
            console.log('Token:', registerData.data.token);
            return registerData.data.token;
        } else {
            console.log('❌ Échec de création:', registerData);
            
            // Essayer de se connecter avec cet utilisateur
            console.log('🔄 Tentative de connexion...');
            const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'test@example.com',
                    password: 'password123'
                })
            });

            const loginData = await loginResponse.json();
            if (loginResponse.ok) {
                console.log('✅ Connexion réussie');
                return loginData.data.token;
            } else {
                console.log('❌ Échec de connexion:', loginData);
                return null;
            }
        }
    } catch (error) {
        console.error('❌ Erreur:', error);
        return null;
    }
}

testUsers().then(token => {
    if (token) {
        console.log('🎉 Token obtenu:', token.substring(0, 20) + '...');
    }
});