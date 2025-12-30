// Script de test automatique pour l'API EcoPulse
const API_BASE = 'http://localhost:4000/api';

// Fonction pour tester l'API
const testAPI = async () => {
  console.log('🧪 Test automatique de l\'API EcoPulse...\n');

  // Test 1: Vérifier que le serveur répond
  console.log('1️⃣ Test de connectivité...');
  try {
    const response = await fetch(`${API_BASE.replace('/api', '')}`);
    if (response.ok) {
      console.log('✅ Serveur accessible');
    } else {
      console.log('❌ Serveur inaccessible');
      return;
    }
  } catch (error) {
    console.log('❌ Erreur de connexion:', error.message);
    return;
  }

  // Test 2: Tester l'inscription
  console.log('\n2️⃣ Test d\'inscription...');
  const testUser = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'test123',
    role: 'citizen'
  };

  try {
    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    const registerData = await registerResponse.json();
    
    if (registerResponse.ok) {
      console.log('✅ Inscription réussie');
      const token = registerData.data.token;
      
      // Test 3: Tester la connexion
      console.log('\n3️⃣ Test de connexion...');
      const loginResponse = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      });

      const loginData = await loginResponse.json();
      
      if (loginResponse.ok) {
        console.log('✅ Connexion réussie');
        const authToken = loginData.data.token;

        // Test 4: Tester la création de signalement
        console.log('\n4️⃣ Test de création de signalement...');
        const wasteReport = {
          description: 'Test de signalement automatique',
          wasteType: 'plastique',
          location: {
            lat: 11.0591,
            lng: -12.3953
          }
        };

        const wasteResponse = await fetch(`${API_BASE}/waste`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(wasteReport)
        });

        const wasteData = await wasteResponse.json();
        
        if (wasteResponse.ok) {
          console.log('✅ Signalement créé avec succès');
          console.log('📊 ID du signalement:', wasteData.data._id);
        } else {
          console.log('❌ Erreur création signalement:', wasteData);
        }

        // Test 5: Tester la récupération des signalements
        console.log('\n5️⃣ Test de récupération des signalements...');
        const getReportsResponse = await fetch(`${API_BASE}/waste/my-reports`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });

        const reportsData = await getReportsResponse.json();
        
        if (getReportsResponse.ok) {
          console.log('✅ Signalements récupérés');
          console.log('📊 Nombre de signalements:', reportsData.data.length);
        } else {
          console.log('❌ Erreur récupération signalements:', reportsData);
        }

        // Test 6: Tester les statistiques
        console.log('\n6️⃣ Test des statistiques...');
        const statsResponse = await fetch(`${API_BASE}/stats`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });

        const statsData = await statsResponse.json();
        
        if (statsResponse.ok) {
          console.log('✅ Statistiques récupérées');
          console.log('📊 Utilisateurs:', statsData.data.users.total);
          console.log('📊 Signalements:', statsData.data.wasteReports.total);
        } else {
          console.log('❌ Erreur statistiques:', statsData);
        }

      } else {
        console.log('❌ Erreur de connexion:', loginData);
      }
    } else {
      console.log('❌ Erreur d\'inscription:', registerData);
    }
  } catch (error) {
    console.log('❌ Erreur lors du test:', error.message);
  }

  console.log('\n🎉 Test terminé !');
};

// Exporter la fonction pour utilisation
if (typeof window !== 'undefined') {
  window.testAPI = testAPI;
  console.log('✅ Fonction testAPI disponible dans window.testAPI()');
} else {
  // Exécuter automatiquement si dans Node.js
  testAPI();
}

// Instructions d'utilisation
console.log(`
🧪 SCRIPT DE TEST AUTOMATIQUE

Pour utiliser ce script :

1. Démarrez votre backend : npm run dev (dans le dossier backend)
2. Ouvrez la console du navigateur (F12)
3. Exécutez : testAPI()

Ou collez ce script directement dans la console.
`);


