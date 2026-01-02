import mongoose from 'mongoose';

const userBadgeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'L\'utilisateur est obligatoire']
    },
    badgeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Badge',
        required: [true, 'Le badge est obligatoire']
    },
    earnedAt: {
        type: Date,
        default: Date.now
    },
    progress: {
        current: {
            type: Number,
            default: 0
        },
        target: {
            type: Number,
            required: true
        },
        percentage: {
            type: Number,
            default: 0
        }
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    notified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index composé pour éviter les doublons
userBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

// Index pour les requêtes
userBadgeSchema.index({ userId: 1, isCompleted: 1 });
userBadgeSchema.index({ earnedAt: -1 });

// Middleware pour calculer le pourcentage
userBadgeSchema.pre('save', function(next) {
    if (this.progress.target > 0) {
        this.progress.percentage = Math.min(100, Math.round((this.progress.current / this.progress.target) * 100));
        this.isCompleted = this.progress.current >= this.progress.target;
    }
    next();
});

export default mongoose.model('UserBadge', userBadgeSchema);