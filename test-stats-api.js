// Script de test pour l'API des statistiques
const testStatsAPI = async () => {
    try {
        console.log('🔄 Test de l\'API des statistiques...');
        
        // Test de l'endpoint public (sans authentification)
        const publicResponse = await fetch('http://localhost:4000/api/stats/public', {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📊 Réponse API publique:', publicResponse.status);
        
        if (publicResponse.ok) {
            const publicData = await publicResponse.json();
            console.log('✅ Données publiques reçues:', {
                success: publicData.success,
                totalReports: publicData.data?.summary?.totalReports,
                collectedReports: publicData.data?.summary?.collectedReports,
                totalCitizens: publicData.data?.summary?.totalCitizens,
                wasteTypesCount: publicData.data?.wasteByType?.length
            });
        } else {
            const errorText = await publicResponse.text();
            console.log('❌ Erreur API publique:', errorText);
        }
        
    } catch (error) {
        console.error('❌ Erreur de test:', error.message);
    }
};

testStatsAPI();