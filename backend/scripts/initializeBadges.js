import 'dotenv/config';
import connectDB from '../config/db.js';
import GamificationService from '../services/gamificationService.js';

const initializeBadges = async () => {
    try {
        console.log('🔄 Connexion à la base de données...');
        await connectDB();
        
        console.log('🏆 Initialisation des badges par défaut...');
        await GamificationService.initializeDefaultBadges();
        
        console.log('✅ Badges initialisés avec succès !');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation des badges:', error);
        process.exit(1);
    }
};

initializeBadges();