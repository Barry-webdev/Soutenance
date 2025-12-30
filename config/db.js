import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Connexion à MongoDB avec gestion d'erreurs robuste
 */
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        
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
        process.exit(1);
    }
};

export default connectDB;