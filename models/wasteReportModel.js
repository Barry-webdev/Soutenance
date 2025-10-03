import mongoose from 'mongoose';

const wasteReportSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'L\'utilisateur est obligatoire']
    },
    description: {
        type: String,
        required: [true, 'La description est obligatoire'],
        trim: true,
        maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
    },
    imageUrl: {
        type: String,
        required: false // Optionnel selon le cahier des charges
    },
    location: {
        lat: {
            type: Number,
            required: [true, 'La latitude est obligatoire'],
            min: -90,
            max: 90
        },
        lng: {
            type: Number,
            required: [true, 'La longitude est obligatoire'],
            min: -180,
            max: 180
        }
    },
    status: {
        type: String,
        enum: ['pending', 'collected', 'not_collected'],
        default: 'pending'
    },
    wasteType: {
        type: String,
        required: [true, 'Le type de déchet est obligatoire'],
        enum: ['plastique', 'verre', 'métal', 'organique', 'papier', 'dangereux', 'autre']
    }
}, {
    timestamps: true
});

// Index pour les requêtes géospatiales
wasteReportSchema.index({ location: '2dsphere' });

// Index pour les statistiques
wasteReportSchema.index({ createdAt: 1 });
wasteReportSchema.index({ status: 1 });
wasteReportSchema.index({ wasteType: 1 });

export default mongoose.model('WasteReport', wasteReportSchema);