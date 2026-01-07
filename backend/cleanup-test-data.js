import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: './.env' });

// Script de nettoyage des données de test
async function cleanupTestData() {
    try {
        console.log('🧹 Début du nettoyage des données de test...');
        
        // Connexion à MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connexion à MongoDB établie');
        
        const db = mongoose.connection.db;
        
        // 1. Supprimer les utilisateurs de test
        console.log('\n👥 Nettoyage des utilisateurs de test...');
        
        const testUserPatterns = [
            /test.*@example\.com/i,
            /.*test.*@.*\.com/i,
            /performance.*@.*\.com/i,
            /queue.*@.*\.com/i,
            /db-test.*@.*\.com/i,
            /extreme.*@.*\.com/i,
            /citizen.*@.*\.com/i
        ];
        
        let totalUsersDeleted = 0;
        
        for (const pattern of testUserPatterns) {
            const result = await db.collection('users').deleteMany({
                email: { $regex: pattern }
            });
            totalUsersDeleted += result.deletedCount;
            console.log(`   🗑️ Supprimé ${result.deletedCount} utilisateurs avec pattern: ${pattern}`);
        }
        
        // Supprimer aussi les utilisateurs avec des noms de test
        const testNameResult = await db.collection('users').deleteMany({
            $or: [
                { name: /test/i },
                { name: /performance/i },
                { name: /queue/i },
                { name: /extreme/i },
                { name: /db.*test/i }
            ]
        });
        totalUsersDeleted += testNameResult.deletedCount;
        console.log(`   🗑️ Supprimé ${testNameResult.deletedCount} utilisateurs avec noms de test`);
        
        console.log(`   ✅ Total utilisateurs de test supprimés: ${totalUsersDeleted}`);
        
        // 2. Supprimer les signalements de test
        console.log('\n📝 Nettoyage des signalements de test...');
        
        const testReportPatterns = [
            /test.*performance/i,
            /test.*queue/i,
            /test.*minimal/i,
            /test.*étape/i,
            /test.*db/i,
            /test.*extreme/i,
            /test.*citizen/i,
            /test.*optimis/i,
            /test.*warm-up/i,
            /test.*simple/i
        ];
        
        let totalReportsDeleted = 0;
        
        for (const pattern of testReportPatterns) {
            const result = await db.collection('wastereports').deleteMany({
                description: { $regex: pattern }
            });
            totalReportsDeleted += result.deletedCount;
            console.log(`   🗑️ Supprimé ${result.deletedCount} signalements avec pattern: ${pattern}`);
        }
        
        console.log(`   ✅ Total signalements de test supprimés: ${totalReportsDeleted}`);
        
        // 3. Supprimer les notifications de test
        console.log('\n🔔 Nettoyage des notifications de test...');
        
        const testNotifResult = await db.collection('notifications').deleteMany({
            $or: [
                { message: /test/i },
                { title: /test/i },
                { message: /performance/i }
            ]
        });
        
        console.log(`   ✅ Notifications de test supprimées: ${testNotifResult.deletedCount}`);
        
        // 4. Supprimer les logs d'audit de test
        console.log('\n📋 Nettoyage des logs d\'audit de test...');
        
        const testAuditResult = await db.collection('auditlogs').deleteMany({
            $or: [
                { description: /test/i },
                { description: /performance/i },
                { description: /queue/i },
                { 'metadata.tempId': { $exists: true } }
            ]
        });
        
        console.log(`   ✅ Logs d'audit de test supprimés: ${testAuditResult.deletedCount}`);
        
        // 5. Supprimer les demandes de collaboration de test
        console.log('\n🤝 Nettoyage des collaborations de test...');
        
        const testCollabResult = await db.collection('collaborationrequests').deleteMany({
            $or: [
                { organizationName: /test/i },
                { contactPerson: /test/i },
                { email: /test.*@.*\.com/i }
            ]
        });
        
        console.log(`   ✅ Collaborations de test supprimées: ${testCollabResult.deletedCount}`);
        
        // 6. Statistiques finales
        console.log('\n📊 RÉSUMÉ DU NETTOYAGE:');
        console.log(`   👥 Utilisateurs supprimés: ${totalUsersDeleted}`);
        console.log(`   📝 Signalements supprimés: ${totalReportsDeleted}`);
        console.log(`   🔔 Notifications supprimées: ${testNotifResult.deletedCount}`);
        console.log(`   📋 Logs d'audit supprimés: ${testAuditResult.deletedCount}`);
        console.log(`   🤝 Collaborations supprimées: ${testCollabResult.deletedCount}`);
        
        // 7. Vérifier les données restantes
        console.log('\n🔍 VÉRIFICATION DES DONNÉES RESTANTES:');
        
        const remainingUsers = await db.collection('users').countDocuments();
        const remainingReports = await db.collection('wastereports').countDocuments();
        const remainingNotifications = await db.collection('notifications').countDocuments();
        
        console.log(`   👥 Utilisateurs restants: ${remainingUsers}`);
        console.log(`   📝 Signalements restants: ${remainingReports}`);
        console.log(`   🔔 Notifications restantes: ${remainingNotifications}`);
        
        // 8. Afficher les utilisateurs restants (pour vérification)
        console.log('\n👥 UTILISATEURS RESTANTS:');
        const users = await db.collection('users').find({}, { 
            projection: { name: 1, email: 1, role: 1, createdAt: 1 } 
        }).toArray();
        
        users.forEach(user => {
            console.log(`   - ${user.name} (${user.email}) - ${user.role} - ${new Date(user.createdAt).toLocaleDateString()}`);
        });
        
        console.log('\n🎉 Nettoyage terminé avec succès !');
        console.log('💡 La base de données ne contient plus que les vraies données de production.');
        
    } catch (error) {
        console.error('❌ Erreur lors du nettoyage:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Connexion fermée');
    }
}

// Exécuter le nettoyage
cleanupTestData();