import fetch from 'node-fetch';

// Test de connexion avec l'URL Vercel spécifique
async function testVercelConnection() {
    console.log('🧪 Test de connexion avec ecopulse-wine.vercel.app...\n');
    
    const backendUrl = 'https://ecopulse-backend-00i3.onrender.com';
    const frontendUrl = 'https://ecopulse-wine.vercel.app';
    
    console.log('🌐 Frontend URL:', frontendUrl);
    console.log('🔗 Backend URL:', backendUrl);
    
    // Test de login avec la bonne origine
    console.log('\n🔐 Test de login...');
    try {
        const loginResponse = await fetch(`${backendUrl}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': frontendUrl
            },
            body: JSON.stringify({
                email: 'babdoulrazzai@gmail.com',
                password: 'kathioure'
            })
        });
        
        console.log('   Status:', loginResponse.status);
        
        if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            console.log('   ✅ Login réussi !');
            console.log('   User:', loginData.data?.user?.name);
            console.log('   Role:', loginData.data?.user?.role);
        } else {
            const errorText = await loginResponse.text();
            console.log('   ❌ Login échoué:', errorText);
        }
    } catch (error) {
        console.log('   ❌ Erreur:', error.message);
    }
    
    // Test CORS preflight
    console.log('\n🌍 Test CORS preflight...');
    try {
        const corsResponse = await fetch(`${backendUrl}/api/auth/login`, {
            method: 'OPTIONS',
            headers: {
                'Origin': frontendUrl,
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'
            }
        });
        
        console.log('   Status:', corsResponse.status);
        const allowOrigin = corsResponse.headers.get('access-control-allow-origin');
        console.log('   Allow-Origin:', allowOrigin);
        
        if (allowOrigin === frontendUrl || allowOrigin === '*') {
            console.log('   ✅ CORS configuré correctement');
        } else {
            console.log('   ❌ CORS mal configuré');
        }
    } catch (error) {
        console.log('   ❌ Erreur CORS:', error.message);
    }
}

testVercelConnection();