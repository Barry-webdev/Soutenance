// Test pour vérifier les notifications en base de données
import fetch from 'node-fetch';

const API_URL = 'https://ecopulse-backend-00i3.onrender.com';

async function testNotificationsInDB() {
    try {
        console.log('🔍 Test des notifications en base...');
        
        // D'abord, créer un utilisateur admin de test ou se connecter
        console.log('📝 Tentative de connexion admin...');
        const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@test.com', // Essayer différents emails
                password: 'password123'
            })
        });

        if (!loginResponse.ok) {
            // Essayer avec un autre email
            const loginResponse2 = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'babdoulrazzai@gmail.com',
                    password: 'kathioure' // Mot de passe correct
                })
            });
            
            if (!loginResponse2.ok) {
                console.log('❌ Impossible de se connecter comme admin');
                return;
            }
            
            const loginData2 = await loginResponse2.json();
            console.log('✅ Connexion réussie avec babdoulrazzai@gmail.com');
            console.log('👤 Utilisateur:', loginData2.data.user);
            
            await testNotificationAPIs(loginData2.data.token, loginData2.data.user);
            return;
        }

        const loginData = await loginResponse.json();
        console.log('✅ Connexion réussie');
        console.log('👤 Utilisateur:', loginData.data.user);
        
        await testNotificationAPIs(loginData.data.token, loginData.data.user);
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    }
}

async function testNotificationAPIs(token, user) {
    console.log('\n🔔 Test des APIs de notifications...');
    
    // Test 1: Récupérer le nombre de notifications non lues
    try {
        console.log('\n📊 Test compteur notifications non lues...');
        const unreadResponse = await fetch(`${API_URL}/api/notifications/unread-count`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (unreadResponse.ok) {
            const unreadData = await unreadResponse.json();
            console.log('✅ Compteur non lues:', unreadData);
        } else {
            console.log('❌ Erreur compteur:', unreadResponse.status, await unreadResponse.text());
        }
    } catch (error) {
        console.log('❌ Erreur compteur:', error.message);
    }
    
    // Test 2: Récupérer toutes les notifications
    try {
        console.log('\n📋 Test liste notifications...');
        const listResponse = await fetch(`${API_URL}/api/notifications/${user.id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (listResponse.ok) {
            const listData = await listResponse.json();
            console.log('✅ Liste notifications:', {
                success: listData.success,
                total: listData.data?.notifications?.length || 0,
                unreadCount: listData.data?.pagination?.unreadCount || 0
            });
            
            if (listData.data?.notifications?.length > 0) {
                console.log('📝 Première notification:', listData.data.notifications[0]);
            }
        } else {
            console.log('❌ Erreur liste:', listResponse.status, await listResponse.text());
        }
    } catch (error) {
        console.log('❌ Erreur liste:', error.message);
    }
    
    // Test 3: Créer une notification de test
    try {
        console.log('\n➕ Test création notification...');
        const createResponse = await fetch(`${API_URL}/api/notifications`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: user.id,
                title: 'Test de notification admin',
                message: 'Ceci est une notification de test pour vérifier le système',
                type: 'test'
            })
        });
        
        if (createResponse.ok) {
            const createData = await createResponse.json();
            console.log('✅ Notification créée:', createData);
            
            // Re-tester le compteur après création
            setTimeout(async () => {
                const newUnreadResponse = await fetch(`${API_URL}/api/notifications/unread-count`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (newUnreadResponse.ok) {
                    const newUnreadData = await newUnreadResponse.json();
                    console.log('🔄 Nouveau compteur après création:', newUnreadData);
                }
            }, 1000);
            
        } else {
            console.log('❌ Erreur création:', createResponse.status, await createResponse.text());
        }
    } catch (error) {
        console.log('❌ Erreur création:', error.message);
    }
}

testNotificationsInDB();