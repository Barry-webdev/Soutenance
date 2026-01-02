import mongoose from 'mongoose';
import WasteReport from '../models/wasteReportModel.js';
import User from '../models/userModel.js';
import CollaborationRequest from '../models/collaborationRequestModel.js';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connexion MongoDB réussie');
    } catch (error) {
        console.error('❌ Erreur connexion MongoDB:', error);
        process.exit(1);
    }
};

const addTestData = async () => {
    try {
        console.log('🔄 Ajout de données de test...');

        // Créer quelques utilisateurs de test
        const testUsers = [
            {
                name: 'Alice Martin',
                email: 'alice@test.com',
                password: 'password123',
                role: 'citizen',
                points: 150
            },
            {
                name: 'Bob Dupont',
                email: 'bob@test.com',
                password: 'password123',
                role: 'citizen',
                points: 200
            },
            {
                name: 'Claire Bernard',
                email: 'claire@test.com',
                password: 'password123',
                role: 'citizen',
                points: 75
            }
        ];

        // Vérifier si les utilisateurs existent déjà
        for (const userData of testUsers) {
            const existingUser = await User.findOne({ email: userData.email });
            if (!existingUser) {
                const user = new User(userData);
                await user.save();
                console.log(`✅ Utilisateur créé: ${userData.name}`);
            }
        }

        // Récupérer les utilisateurs pour les signalements
        const users = await User.find({ role: 'citizen' });
        
        if (users.length === 0) {
            console.log('❌ Aucun utilisateur trouvé');
            return;
        }

        // Types de déchets variés (en français selon le modèle)
        const wasteTypes = ['plastique', 'organique', 'métal', 'verre', 'papier', 'dangereux'];
        const statuses = ['pending', 'collected', 'pending', 'collected', 'pending'];
        const descriptions = [
            'Bouteilles en plastique abandonnées',
            'Déchets organiques en décomposition',
            'Canettes et objets métalliques',
            'Bouteilles en verre cassées',
            'Papiers et cartons éparpillés',
            'Produits chimiques et batteries usagées'
        ];

        // Créer des signalements de test sur les 30 derniers jours
        const testReports = [];
        const now = new Date();
        
        for (let i = 0; i < 50; i++) {
            // Date aléatoire dans les 30 derniers jours
            const daysAgo = Math.floor(Math.random() * 30);
            const reportDate = new Date(now);
            reportDate.setDate(reportDate.getDate() - daysAgo);
            
            const wasteType = wasteTypes[Math.floor(Math.random() * wasteTypes.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const user = users[Math.floor(Math.random() * users.length)];
            
            testReports.push({
                wasteType,
                description: descriptions[wasteTypes.indexOf(wasteType)],
                location: {
                    lat: 11.0 + (Math.random() - 0.5) * 0.1, // Autour de Pita
                    lng: -12.0 + (Math.random() - 0.5) * 0.1,
                    address: `Quartier ${Math.floor(Math.random() * 10) + 1}, Pita`
                },
                status,
                userId: user._id,
                createdAt: reportDate,
                updatedAt: reportDate
            });
        }

        // Insérer les signalements
        await WasteReport.insertMany(testReports);
        console.log(`✅ ${testReports.length} signalements de test créés`);

        // Créer quelques demandes de collaboration
        const collaborationTypes = ['ONG', 'Mairie', 'Entreprise'];
        const collaborationStatuses = ['pending', 'approved', 'rejected'];
        const organizationNames = [
            'Association Verte Pita',
            'Mairie de Pita',
            'EcoClean Guinée',
            'Jeunes Écologistes',
            'Recyclage Plus'
        ];
        
        const testCollaborations = [];
        for (let i = 0; i < 10; i++) {
            const daysAgo = Math.floor(Math.random() * 15);
            const collabDate = new Date(now);
            collabDate.setDate(collabDate.getDate() - daysAgo);
            
            testCollaborations.push({
                organizationName: organizationNames[Math.floor(Math.random() * organizationNames.length)],
                contactPerson: `Contact ${i + 1}`,
                email: `contact${i + 1}@example.com`,
                phone: `+224 6${String(Math.floor(Math.random() * 10000000)).padStart(8, '0')}`,
                type: collaborationTypes[Math.floor(Math.random() * collaborationTypes.length)],
                status: collaborationStatuses[Math.floor(Math.random() * collaborationStatuses.length)],
                submittedAt: collabDate
            });
        }

        await CollaborationRequest.insertMany(testCollaborations);
        console.log(`✅ ${testCollaborations.length} demandes de collaboration créées`);

        console.log('🎉 Données de test ajoutées avec succès !');
        
        // Afficher un résumé
        const totalReports = await WasteReport.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalCollabs = await CollaborationRequest.countDocuments();
        
        console.log('\n📊 Résumé des données:');
        console.log(`- Utilisateurs: ${totalUsers}`);
        console.log(`- Signalements: ${totalReports}`);
        console.log(`- Collaborations: ${totalCollabs}`);

    } catch (error) {
        console.error('❌ Erreur lors de l\'ajout des données:', error);
    }
};

const main = async () => {
    await connectDB();
    await addTestData();
    await mongoose.disconnect();
    console.log('✅ Déconnexion MongoDB');
};

main();