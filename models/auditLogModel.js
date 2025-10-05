// models/AuditLog.js
import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: [
            // Authentification
            'USER_REGISTER', 'USER_LOGIN', 'USER_LOGOUT', 'USER_PROFILE_UPDATE',
            // Signalements
            'WASTE_REPORT_CREATE', 'WASTE_REPORT_UPDATE', 'WASTE_REPORT_DELETE',
            // Collaborations
            'COLLABORATION_REQUEST', 'COLLABORATION_APPROVE', 'COLLABORATION_REJECT',
            // Administration
            'USER_MANAGEMENT', 'ROLE_UPDATE', 'STATUS_UPDATE',
            // Système
            'SYSTEM_BACKUP', 'DATA_EXPORT', 'SETTINGS_UPDATE'
        ]
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    userRole: {
        type: String,
        enum: ['citizen', 'admin', 'partner'],
        required: true
    },
    resourceType: {
        type: String,
        enum: ['User', 'WasteReport', 'CollaborationRequest', 'System']
    },
    resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'resourceType'
    },
    description: {
        type: String,
        required: true
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'low'
    }
}, {
    timestamps: true
});

// Index pour les recherches performantes
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1 });

export default mongoose.model('AuditLog', auditLogSchema);