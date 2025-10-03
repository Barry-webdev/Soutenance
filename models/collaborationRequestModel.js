// models/CollaborationRequest.js
import mongoose from 'mongoose';

const collaborationRequestSchema = new mongoose.Schema({
    organizationName: {
        type: String,
        required: [true, 'Le nom de l\'organisation est obligatoire'],
        trim: true,
        maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
    },
    contactPerson: {
        type: String,
        required: [true, 'La personne de contact est obligatoire'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'L\'email est obligatoire'],
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide']
    },
    phone: {
        type: String,
        required: [true, 'Le téléphone est obligatoire'],
        trim: true
    },
    type: {
        type: String,
        required: [true, 'Le type est obligatoire'],
        enum: ['ONG', 'Mairie', 'Entreprise']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

export default mongoose.model('CollaborationRequest', collaborationRequestSchema);