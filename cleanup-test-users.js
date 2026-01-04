// Script pour supprimer les utilisateurs de test
import fetch from 'node-fetch';

const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://ecopulse-backend-00i3.onrender.com'
  : 'http://localhost:4000';

// Credentials super admin
const superAdminCredentials = {
  email: 'babdoulrazzai@gmail.com',
  password: 'kathioure'
};

async function cleanupTestUsers() {
  try {
    console.log('🔐 Connexion super admin...');
    
    // 1. Se connecter en tant que super admin
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(superAdminCredentials)
    });

    if (!loginResponse.ok) {
      throw new Error(`Erreur login: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.data.token;
    console.log('✅ Connexion réussie');

    // 2. Récupérer tous les utilisateurs
    console.log('📋 Récupération des utilisateurs...');
    const usersResponse = await fetch(`${API_BASE}/api/users/manage`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!usersResponse.ok) {
      throw new Error(`Erreur utilisateurs: ${usersResponse.status}`);
    }

    const usersData = await usersResponse.json();
    const users = usersData.data || [];
    console.log(`📊 ${users.length} utilisateurs trouvés`);

    // 3. Identifier les utilisateurs de test à supprimer
    const testUsers = users.filter(user => {
      // Critères pour identifier les utilisateurs de test
      const isTestUser = 
        user.email.includes('test') ||
        user.email.includes('demo') ||
        user.name.toLowerCase().includes('test') ||
        user.name.toLowerCase().includes('demo') ||
        // Exclure les vrais admins
        (user.email !== 'babdoulrazzai@gmail.com' && 
         user.email !== 'razzaibarry8855@gmail.com' &&
         user.role === 'citizen');
      
      return isTestUser;
    });

    console.log(`🎯 ${testUsers.length} utilisateurs de test identifiés:`);
    testUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user.role}`);
    });

    // 4. Demander confirmation
    if (testUsers.length === 0) {
      console.log('✅ Aucun utilisateur de test à supprimer');
      return;
    }

    console.log('\n⚠️ ATTENTION: Cette action est irréversible !');
    console.log('Pour continuer, modifiez le script et décommentez la section de suppression.\n');

    // 5. Suppression (décommentez pour exécuter)
    /*
    for (const user of testUsers) {
      try {
        const deleteResponse = await fetch(`${API_BASE}/api/users/manage/${user._id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (deleteResponse.ok) {
          console.log(`✅ Supprimé: ${user.name} (${user.email})`);
        } else {
          console.log(`❌ Échec: ${user.name} (${user.email})`);
        }
      } catch (error) {
        console.error(`❌ Erreur suppression ${user.name}:`, error.message);
      }
    }
    */

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

cleanupTestUsers();