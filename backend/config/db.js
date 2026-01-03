import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Connexion à MongoDB avec gestion d'erreurs robuste et retry automatique
 */
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        
        if (!mongoURI) {
            console.warn('⚠️ MONGODB_URI non défini, fonctionnement en mode dégradé');
            return null;
        }
        
        const connexion = await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
            family: 4,
            maxPoolSize: 10,
            retryWrites: true,
            w: 'majority'
        });
        
        console.log('✅ Connexion à MongoDB Réussi !');
        
        return connexion;
    } catch (error) {
        console.error('❌ Echec de la connexion à MongoDB');
        console.error(`Erreur: ${error.message}`);
        console.log('🔄 Le serveur continue en mode dégradé...');
        
        // Retry automatique après 10 secondes
        setTimeout(() => {
            console.log('🔄 Tentative de reconnexion à MongoDB...');
            connectDB();
        }, 10000);
        
        return null;
    }
};

export default connectDB;