// Test de diagnostic à exécuter dans la console du navigateur
// Copie-colle ce code dans la console pour diagnostiquer les problèmes

export const runDiagnostic = async () => {
  console.log('🔍 === DIAGNOSTIC API ECOPULSE ===');
  
  // 1. Vérifier les variables d'environnement
  console.log('📋 Variables d\'environnement:');
  console.log('- VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.log('- NODE_ENV:', import.meta.env.NODE_ENV);
  console.log('- MODE:', import.meta.env.MODE);
  
  // 2. Tester les URLs
  const urls = [
    'https://ecopulse-backend-00i3.onrender.com/api/health',
    'http://localhost:4000/api/health'
  ];
  
  for (const url of urls) {
    try {
      console.log(`🔍 Test: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`📊 ${url}: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Données:`, data);
      }
    } catch (error) {
      console.error(`❌ ${url}: ${error.message}`);
    }
  }
  
  // 3. Tester avec authentification
  const token = localStorage.getItem('token');
  if (token) {
    console.log('🔐 Test avec authentification...');
    
    try {
      const response = await fetch('https://ecopulse-backend-00i3.onrender.com/api/waste', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`📊 API Waste: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Signalements trouvés: ${data.data?.wasteReports?.length || 0}`);
      }
    } catch (error) {
      console.error('❌ Test authentifié:', error.message);
    }
  } else {
    console.log('⚠️ Aucun token d\'authentification trouvé');
  }
  
  console.log('🏁 === FIN DIAGNOSTIC ===');
};

// Pour utiliser dans la console:
// import('./utils/diagnosticTest.js').then(m => m.runDiagnostic());