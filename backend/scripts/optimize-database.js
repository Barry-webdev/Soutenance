import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration pour ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '../.env') });

// Script d'optimisation de la base de données pour améliorer les performances

async function optimizeDatabase() {
    try {
        console.log('🚀 Démarrage de l\'optimisation de la base de données...');
        console.log('🔗 URI MongoDB:', process.env.MONGODB_URI ? 'Configuré ✅' : 'Manquant ❌');
        
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI non configuré dans le fichier .env');
        }
        
        // Connexion à MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connexion à MongoDB établie');
        
        const db = mongoose.connection.db;
        
        // 1. Optimisation de la collection Users
        console.log('\n📊 Optimisation de la collection Users...');
        
        // Index sur email (déjà existant via unique: true, mais on s'assure)
        await db.collection('users').createIndex({ email: 1 }, { unique: true });
        console.log('✅ Index sur email créé/vérifié');
        
        // Index sur role pour les requêtes d'admin
        await db.collection('users').createIndex({ role: 1 });
        console.log('✅ Index sur role créé');
        
        // Index sur isActive pour filtrer les comptes actifs
        await db.collection('users').createIndex({ isActive: 1 });
        console.log('✅ Index sur isActive créé');
        
        // Index composé pour les requêtes fréquentes
        await db.collection('users').createIndex({ role: 1, isActive: 1 });
        console.log('✅ Index composé role+isActive créé');
        
        // 2. Optimisation de la collection WasteReports
        console.log('\n📊 Optimisation de la collection WasteReports...');
        
        // Index sur userId pour les requêtes "mes signalements"
        await db.collection('wastereports').createIndex({ userId: 1 });
        console.log('✅ Index sur userId créé');
        
        // Index sur status pour filtrer par statut
        await db.collection('wastereports').createIndex({ status: 1 });
        console.log('✅ Index sur status créé');
        
        // Index sur createdAt pour trier par date
        await db.collection('wastereports').createIndex({ createdAt: -1 });
        console.log('✅ Index sur createdAt créé');
        
        // Index composé pour les requêtes admin
        await db.collection('wastereports').createIndex({ status: 1, createdAt: -1 });
        console.log('✅ Index composé status+createdAt créé');
        
        // Index géospatial pour les requêtes de localisation
        await db.collection('wastereports').createIndex({ "location.coordinates": "2dsphere" });
        console.log('✅ Index géospatial sur location créé');
        
        // 3. Optimisation de la collection Notifications
        console.log('\n📊 Optimisation de la collection Notifications...');
        
        // Index sur userId pour récupérer les notifications d'un utilisateur
        await db.collection('notifications').createIndex({ userId: 1 });
        console.log('✅ Index sur userId créé');
        
        // Index sur read pour filtrer les non lues
        await db.collection('notifications').createIndex({ read: 1 });
        console.log('✅ Index sur read créé');
        
        // Index sur createdAt pour trier par date
        await db.collection('notifications').createIndex({ createdAt: -1 });
        console.log('✅ Index sur createdAt créé');
        
        // Index composé pour les requêtes fréquentes
        await db.collection('notifications').createIndex({ userId: 1, read: 1, createdAt: -1 });
        console.log('✅ Index composé userId+read+createdAt créé');
        
        // 4. Optimisation de la collection AuditLogs
        console.log('\n📊 Optimisation de la collection AuditLogs...');
        
        // Index sur userId
        await db.collection('auditlogs').createIndex({ userId: 1 });
        console.log('✅ Index sur userId créé');
        
        // Index sur action
        await db.collection('auditlogs').createIndex({ action: 1 });
        console.log('✅ Index sur action créé');
        
        // Index sur createdAt avec TTL pour auto-suppression après 90 jours
        await db.collection('auditlogs').createIndex(
            { createdAt: 1 }, 
            { expireAfterSeconds: 90 * 24 * 60 * 60 } // 90 jours
        );
        console.log('✅ Index TTL sur createdAt créé (suppression auto après 90 jours)');
        
        // 5. Optimisation de la collection CollaborationRequests
        console.log('\n📊 Optimisation de la collection CollaborationRequests...');
        
        // Index sur status
        await db.collection('collaborationrequests').createIndex({ status: 1 });
        console.log('✅ Index sur status créé');
        
        // Index sur submittedAt
        await db.collection('collaborationrequests').createIndex({ submittedAt: -1 });
        console.log('✅ Index sur submittedAt créé');
        
        // 6. Statistiques des index
        console.log('\n📈 Statistiques des index créés:');
        
        const collections = ['users', 'wastereports', 'notifications', 'auditlogs', 'collaborationrequests'];
        
        for (const collectionName of collections) {
            try {
                const indexes = await db.collection(collectionName).indexes();
                console.log(`\n📋 Collection ${collectionName}:`);
                indexes.forEach(index => {
                    const keys = Object.keys(index.key).join(', ');
                    console.log(`   - ${index.name}: ${keys}`);
                });
            } catch (error) {
                console.log(`⚠️ Collection ${collectionName} non trouvée`);
            }
        }
        
        console.log('\n🎉 Optimisation terminée avec succès !');
        console.log('\n💡 Bénéfices attendus:');
        console.log('   - Connexion/inscription plus rapides');
        console.log('   - Requêtes admin optimisées');
        console.log('   - Notifications plus réactives');
        console.log('   - Nettoyage automatique des logs d\'audit');
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'optimisation:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Connexion fermée');
    }
}

// Exécuter l'optimisation
optimizeDatabase();