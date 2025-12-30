import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/userModel.js';
import connectDB from '../config/db.js';

/**
 * Script pour créer l'administrateur par défaut
 */
const createDefaultAdmin = async () => {
    try {
        // Connexion à la base de données
        await connectDB();
        
        const adminEmail = 'babdoulrazzai@gmail.com';
        const adminPassword = 'kathioure';
        const adminName = 'Abdoul Razzai BAH';
        
        // Vérifier si l'admin existe déjà
        const existingAdmin = await User.findOne({ email: adminEmail });
        
        if (existingAdmin) {
            console.log('✅ L\'administrateur existe déjà');
            console.log(`📧 Email: ${existingAdmin.email}`);
            console.log(`👤 Nom: ${existingAdmin.name}`);
            console.log(`🔑 Rôle: ${existingAdmin.role}`);
            
            // Mettre à jour le mot de passe si nécessaire
            existingAdmin.password = adminPassword;
            existingAdmin.role = 'admin';
            existingAdmin.isActive = true;
            await existingAdmin.save();
            
            console.log('🔄 Mot de passe et rôle mis à jour');
        } else {
            // Créer le nouvel administrateur
            const admin = await User.create({
                name: adminName,
                email: adminEmail,
                password: adminPassword,
                role: 'admin',
                points: 0,
                isActive: true
            });
            
            console.log('🎉 Administrateur créé avec succès !');
            console.log(`📧 Email: ${admin.email}`);
            console.log(`👤 Nom: ${admin.name}`);
            console.log(`🔑 Rôle: ${admin.role}`);
            console.log(`🆔 ID: ${admin._id}`);
        }
        
        console.log('\n🔐 Identifiants de connexion:');
        console.log(`Email: ${adminEmail}`);
        console.log(`Mot de passe: ${adminPassword}`);
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Erreur lors de la création de l\'admin:', error);
        process.exit(1);
    }
};

// Exécuter le script
createDefaultAdmin();