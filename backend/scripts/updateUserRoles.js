import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/userModel.js';

const updateUserRoles = async () => {
  try {
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connexion à MongoDB réussie');

    // Mettre à jour babdoulrazzai@gmail.com en super_admin
    const superAdmin = await User.findOneAndUpdate(
      { email: 'babdoulrazzai@gmail.com' },
      { role: 'super_admin' },
      { new: true }
    );

    if (superAdmin) {
      console.log('✅ Super Admin mis à jour:', superAdmin.email, '→', superAdmin.role);
    } else {
      console.log('❌ Super Admin non trouvé, création...');
      const newSuperAdmin = await User.create({
        name: 'Super Admin',
        email: 'babdoulrazzai@gmail.com',
        password: 'kathioure',
        role: 'super_admin'
      });
      console.log('✅ Super Admin créé:', newSuperAdmin.email);
    }

    // Mettre à jour razzaibarry8855@gmail.com en admin
    const admin = await User.findOneAndUpdate(
      { email: 'razzaibarry8855@gmail.com' },
      { role: 'admin' },
      { new: true }
    );

    if (admin) {
      console.log('✅ Admin mis à jour:', admin.email, '→', admin.role);
    } else {
      console.log('❌ Admin non trouvé, création...');
      const newAdmin = await User.create({
        name: 'Admin Simple',
        email: 'razzaibarry8855@gmail.com',
        password: 'kathioure',
        role: 'admin'
      });
      console.log('✅ Admin créé:', newAdmin.email);
    }

    // Afficher tous les utilisateurs pour vérification
    const allUsers = await User.find({}, 'name email role').sort({ role: 1 });
    console.log('\n📋 Tous les utilisateurs:');
    allUsers.forEach(user => {
      console.log(`- ${user.email} (${user.name}) → ${user.role}`);
    });

    console.log('\n🎉 Mise à jour des rôles terminée !');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

updateUserRoles();