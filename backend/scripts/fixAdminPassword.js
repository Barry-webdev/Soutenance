import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/userModel.js';

const fixAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connexion à MongoDB réussie');

    // Mettre à jour le mot de passe de l'admin simple
    const admin = await User.findOne({ email: 'razzaibarry8855@gmail.com' });
    
    if (admin) {
      admin.password = 'kathioure'; // Le middleware pre('save') va hasher automatiquement
      await admin.save();
      console.log('✅ Mot de passe admin simple mis à jour');
    } else {
      console.log('❌ Admin simple non trouvé');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

fixAdminPassword();