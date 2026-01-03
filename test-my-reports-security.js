// Script de test de sécurité pour "Mes signalements"
// À exécuter dans la console du navigateur ou avec Node.js

const API_URL = 'https://ecopulse-backend-00i3.onrender.com';

async function testMyReportsSecurity() {
    console.log('🔒 Test de sécurité "Mes signalements"');
    
    // Récupérer le token depuis localStorage (si dans le navigateur)
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    const user = typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
    
    if (!token) {
        console.error('❌ Aucun token trouvé. Connectez-vous d\'abord.');
        return;
    }
    
    console.log('👤 Utilisateur connecté:', user.name, '(ID:', user.id, ')');
    
    try {
        // Test 1: Mes signalements (doit fonctionner)
        console.log('\n📋 Test 1: Récupération de MES signalements...');
        const myReportsResponse = await fetch(`${API_URL}/api/waste/my-reports`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const myReportsData = await myReportsResponse.json();
        
        if (myReportsResponse.ok) {
            const reports = myReportsData.data || [];
            console.log(`✅ Succès: ${reports.length} signalements récupérés`);
            
            // Vérifier la sécurité
            const userIds = [...new Set(reports.map(r => r.userId))];
            console.log('🔍 Analyse de sécurité:');
            console.log('- Nombre d\'utilisateurs propriétaires:', userIds.length);
            console.log('- IDs trouvés:', userIds);
            console.log('- Mon ID:', user.id);
            
            if (userIds.length === 0) {
                console.log('ℹ️ Aucun signalement → Sécurité OK');
            } else if (userIds.length === 1 && userIds[0] === user.id) {
                console.log('✅ SÉCURITÉ OK: Tous les signalements m\'appartiennent');
            } else {
                console.error('❌ PROBLÈME DE SÉCURITÉ: Des signalements d\'autres utilisateurs sont visibles!');
                console.error('- IDs étrangers:', userIds.filter(id => id !== user.id));
            }
            
            // Afficher quelques exemples
            if (reports.length > 0) {
                console.log('\n📄 Exemples de signalements:');
                reports.slice(0, 3).forEach((report, index) => {
                    console.log(`${index + 1}. ${report._id} - ${report.description?.substring(0, 30)}... (Propriétaire: ${report.userId})`);
                });
            }
        } else {
            console.error('❌ Erreur récupération mes signalements:', myReportsData);
        }
        
        // Test 2: Tous les signalements (doit échouer pour citoyen)
        console.log('\n🚨 Test 2: Tentative d\'accès à TOUS les signalements (doit échouer)...');
        const allReportsResponse = await fetch(`${API_URL}/api/waste`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const allReportsData = await allReportsResponse.json();
        
        if (allReportsResponse.status === 403) {
            console.log('✅ SÉCURITÉ OK: Accès refusé aux signalements de tous les utilisateurs');
        } else if (allReportsResponse.ok) {
            const allReports = allReportsData.data?.wasteReports || [];
            console.error(`❌ PROBLÈME DE SÉCURITÉ: Accès autorisé à ${allReports.length} signalements de tous les utilisateurs!`);
        } else {
            console.log(`ℹ️ Erreur attendue (${allReportsResponse.status}):`, allReportsData.error);
        }
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    }
}

// Exécuter le test
if (typeof window !== 'undefined') {
    // Dans le navigateur
    console.log('🌐 Exécution dans le navigateur');
    testMyReportsSecurity();
} else {
    // Dans Node.js
    console.log('📦 Pour exécuter ce test:');
    console.log('1. Ouvrez votre application dans le navigateur');
    console.log('2. Connectez-vous avec un compte citoyen');
    console.log('3. Ouvrez la console développeur (F12)');
    console.log('4. Copiez-collez ce script et exécutez-le');
}

// Export pour utilisation en module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { testMyReportsSecurity };
}