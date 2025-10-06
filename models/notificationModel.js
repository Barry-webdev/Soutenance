import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: [
            'waste_report_created',      // Pour les admins
            'waste_report_status_updated', // Pour les citoyens
            'collaboration_submitted',   // Pour les admins
            'points_awarded'             // Pour les citoyens
        ]
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

// Index pour les performances
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

export default mongoose.model('Notification', notificationSchema);