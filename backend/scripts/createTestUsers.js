import 'dotenv/config';
import connectDB from '../config/db.js';
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';

const createTestUsers = async () => {
    try {
        console.log('🔄 Connexion à la base de données...');
        await connectDB();
        
        // Créer un utilisateur citoyen de test
        const citizenPassword = await bcrypt.hash('123456', 12);
        const testCitizen = {
            name: 'Marie Dupont',
            email: 'marie.dupont@test.com',
            password: citizenPassword,
            role: 'citizen',
            points: 150
        };

        // Créer un utilisateur partenaire de test
        const partnerPassword = await bcrypt.hash('123456', 12);
        const testPartner = {
            name: 'Jean Martin',
            email: 'jean.martin@partner.com',
            password: partnerPassword,
            role: 'partner',
            points: 300
        };

        // Vérifier si les utilisateurs existent déjà
        const existingCitizen = await User.findOne({ email: testCitizen.email });
        const existingPartner = await User.findOne({ email: testPartner.email });

        if (!existingCitizen) {
            await User.create(testCitizen);
            console.log('✅ Utilisateur citoyen créé:', testCitizen.email);
        } else {
            console.log('ℹ️ Utilisateur citoyen existe déjà:', testCitizen.email);
        }

        if (!existingPartner) {
            await User.create(testPartner);
            console.log('✅ Utilisateur partenaire créé:', testPartner.email);
        } else {
            console.log('ℹ️ Utilisateur partenaire existe déjà:', testPartner.email);
        }

        console.log('\n📋 Comptes de test disponibles:');
        console.log('👤 Citoyen: marie.dupont@test.com / 123456');
        console.log('🤝 Partenaire: jean.martin@partner.com / 123456');
        console.log('👨‍💼 Admin: babdoulrazzai@gmail.com / kathioure');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors de la création des utilisateurs de test:', error);
        process.exit(1);
    }
};

createTestUsers();