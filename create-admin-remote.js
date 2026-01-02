// Script pour créer un admin via l'API de registration
import fetch from 'node-fetch';

const API_URL = 'https://ecopulse-backend-00i3.onrender.com';

async function createAdminUser() {
    try {
        console.log('🔍 Création d\'un utilisateur admin via l\'API...');
        
        // Essayer de créer un admin via l'API de registration
        const registerResponse = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Admin EcoPulse',
                email: 'admin@ecopulse.com',
                password: 'admin123456',
                role: 'admin' // Essayer de forcer le rôle admin
            })
        });

        const registerData = await registerResponse.json();
        
        if (registerResponse.ok) {
            console.log('✅ Admin créé avec succès !');
            console.log('👤 Utilisateur:', registerData.data.user);
            
            // Tester la connexion
            await testAdminLogin('admin@ecopulse.com', 'admin123456');
        } else {
            console.log('❌ Erreur création admin:', registerData);
            
            // Si l'utilisateur existe déjà, essayer de se connecter
            if (registerData.error && registerData.error.includes('existe déjà')) {
                console.log('🔄 Utilisateur existe, test de connexion...');
                await testAdminLogin('admin@ecopulse.com', 'admin123456');
            }
        }
        
        // Essayer aussi avec l'email du script
        console.log('\n🔄 Test avec l\'email du script...');
        await testAdminLogin('babdoulrazzai@gmail.com', 'kathioure');
        
    } catch (error) {
        console.error('❌ Erreur:', error);
    }
}

async function testAdminLogin(email, password) {
    try {
        console.log(`\n🔐 Test connexion: ${email}`);
        
        const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            console.log('✅ Connexion réussie !');
            console.log('👤 Utilisateur:', loginData.data.user);
            
            // Tester l'API des notifications
            await testNotificationAPI(loginData.data.token, loginData.data.user);
        } else {
            const errorData = await loginResponse.json();
            console.log('❌ Échec connexion:', errorData);
        }
    } catch (error) {
        console.log('❌ Erreur connexion:', error.message);
    }
}

async function testNotificationAPI(token, user) {
    try {
        console.log('\n🔔 Test API notifications...');
        
        // Test compteur
        const unreadResponse = await fetch(`${API_URL}/api/notifications/unread-count`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (unreadResponse.ok) {
            const unreadData = await unreadResponse.json();
            console.log('✅ Compteur notifications:', unreadData);
        } else {
            const errorText = await unreadResponse.text();
            console.log('❌ Erreur compteur:', unreadResponse.status, errorText);
        }
        
        // Test liste notifications
        const listResponse = await fetch(`${API_URL}/api/notifications/${user.id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (listResponse.ok) {
            const listData = await listResponse.json();
            console.log('✅ Liste notifications:', {
                total: listData.data?.notifications?.length || 0,
                unreadCount: listData.data?.pagination?.unreadCount || 0
            });
        } else {
            const errorText = await listResponse.text();
            console.log('❌ Erreur liste:', listResponse.status, errorText);
        }
        
    } catch (error) {
        console.log('❌ Erreur test notifications:', error.message);
    }
}

createAdminUser();