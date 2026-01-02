import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Le nom du badge est obligatoire'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'La description est obligatoire'],
        trim: true
    },
    icon: {
        type: String,
        required: [true, 'L\'icône est obligatoire'],
        trim: true
    },
    color: {
        type: String,
        required: [true, 'La couleur est obligatoire'],
        trim: true
    },
    category: {
        type: String,
        enum: ['reports', 'collection', 'community', 'special', 'achievement'],
        required: [true, 'La catégorie est obligatoire']
    },
    criteria: {
        type: {
            type: String,
            enum: ['reports_count', 'collected_count', 'points_total', 'streak_days', 'special_action'],
            required: true
        },
        value: {
            type: Number,
            required: true
        },
        timeframe: {
            type: String,
            enum: ['all_time', 'monthly', 'weekly', 'daily'],
            default: 'all_time'
        }
    },
    rarity: {
        type: String,
        enum: ['common', 'rare', 'epic', 'legendary'],
        default: 'common'
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

// Index pour les requêtes
badgeSchema.index({ category: 1 });
badgeSchema.index({ rarity: 1 });
badgeSchema.index({ isActive: 1 });

export default mongoose.model('Badge', badgeSchema);