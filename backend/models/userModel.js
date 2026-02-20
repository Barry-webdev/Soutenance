import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Le nom est obligatoire'],
        trim: true,
        maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
    },
    email: {
        type: String,
        required: [true, 'L\'email est obligatoire'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide']
    },
    password: {
        type: String,
        required: [true, 'Le mot de passe est obligatoire'],
        minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères']
    },
    role: {
        type: String,
        enum: ['citizen', 'admin', 'partner', 'super_admin'],
        default: 'citizen'
    },
    points: {
        type: Number,
        default: 0,
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Hash du mot de passe avant sauvegarde - Version optimisée pour la production
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        // Réduction des rounds pour améliorer les performances en production
        // 10 rounds = ~10ms, 12 rounds = ~60ms, 14 rounds = ~250ms
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Générer un token JWT
userSchema.methods.generateAuthToken = function() {
    // 🔒 SÉCURITÉ: Vérifier que JWT_SECRET existe
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET non défini dans les variables d\'environnement');
    }
    
    return jwt.sign(
        { 
            userId: this._id, 
            email: this.email, 
            role: this.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

export default mongoose.model('User', userSchema);