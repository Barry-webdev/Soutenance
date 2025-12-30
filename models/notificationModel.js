import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'L\'utilisateur est obligatoire']
    },
    title: {
        type: String,
        required: [true, 'Le titre est obligatoire'],
        trim: true,
        maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
    },
    message: {
        type: String,
        required: [true, 'Le message est obligatoire'],
        trim: true,
        maxlength: [500, 'Le message ne peut pas dépasser 500 caractères']
    },
    type: {
        type: String,
        required: true,
        enum: [
            'info', 'success', 'warning', 'error',
            'waste_report_created',      // Pour les admins
            'waste_report_status_updated', // Pour les citoyens
            'collaboration_submitted',   // Pour les admins
            'points_awarded'             // Pour les citoyens
        ],
        default: 'info'
    },
    relatedEntity: {
        entityType: {
            type: String,
            enum: ['WasteReport', 'CollaborationRequest', 'User']
        },
        entityId: {
            type: mongoose.Schema.Types.ObjectId
        }
    },
    read: {
        type: Boolean,
        default: false
    },
    isRead: {
        type: Boolean,
        default: false
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    actionUrl: {
        type: String
    }
}, {
    timestamps: true
});

// Index pour les requêtes fréquentes et performances
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
