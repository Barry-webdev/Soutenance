const fetch = require('node-fetch');

async function testStats() {
    try {
        console.log('🔍 Test des statistiques...');
        
        // Test de connexion admin
        const loginResponse = await fetch('http://localhost:4000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'babdoulrazzai@gmail.com',
                password: 'kathioure'
            })
        });
        
        const loginData = await loginResponse.json();
        console.log('✅ Connexion admin:', loginData.success ? 'OK' : 'ERREUR');
        
        if (!loginData.success) {
            console.log('❌ Erreur de connexion:', loginData.message);
            return;
        }
        
        const token = loginData.token;
        
        // Test des statistiques publiques
        console.log('\n📊 Test des statistiques publiques...');
        const publicStatsResponse = await fetch('http://localhost:4000/api/stats/public', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const publicStats = await publicStatsResponse.json();
        console.log('Statistiques publiques:', JSON.stringify(publicStats, null, 2));
        
        // Test des statistiques admin
        console.log('\n📊 Test des statistiques admin...');
        const adminStatsResponse = await fetch('http://localhost:4000/api/stats', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const adminStats = await adminStatsResponse.json();
        console.log('Statistiques admin:', JSON.stringify(adminStats, null, 2));
        
        // Test du dashboard
        console.log('\n📊 Test du dashboard...');
        const dashboardResponse = await fetch('http://localhost:4000/api/stats/dashboard', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const dashboardStats = await dashboardResponse.json();
        console.log('Dashboard:', JSON.stringify(dashboardStats, null, 2));
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    }
}

testStats();