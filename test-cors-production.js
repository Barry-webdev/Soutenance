// Test de connexion CORS en production
const testCorsConnection = async () => {
    const frontendUrl = 'https://ecopulse-app-web.vercel.app';
    const backendUrl = 'https://ecopulse-backend-00i3.onrender.com';
    
    console.log('🧪 Test de connexion CORS Production');
    console.log('Frontend:', frontendUrl);
    console.log('Backend:', backendUrl);
    console.log('---');
    
    try {
        // Test 1: Vérifier que le backend répond
        console.log('1️⃣ Test backend disponible...');
        const healthResponse = await fetch(`${backendUrl}/health`);
        console.log('✅ Backend status:', healthResponse.status);
        
        // Test 2: Test de login avec CORS
        console.log('2️⃣ Test login avec CORS...');
        const loginResponse = await fetch(`${backendUrl}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': frontendUrl
            },
            body: JSON.stringify({
                email: 'admin@ecopulse.com',
                password: 'admin123'
            })
        });
        
        console.log('Login status:', loginResponse.status);
        
        if (loginResponse.ok) {
            const data = await loginResponse.json();
            console.log('✅ Login réussi:', data.success);
        } else {
            const error = await loginResponse.text();
            console.log('❌ Login échoué:', error);
        }
        
        // Test 3: Test des stats publiques
        console.log('3️⃣ Test stats publiques...');
        const statsResponse = await fetch(`${backendUrl}/api/stats/public`, {
            headers: {
                'Origin': frontendUrl
            }
        });
        
        console.log('Stats status:', statsResponse.status);
        
    } catch (error) {
        console.error('❌ Erreur de test:', error.message);
    }
};

// Exécuter le test
testCorsConnection();