import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: [
            // Authentification
            'USER_REGISTER', 'USER_LOGIN', 'USER_LOGOUT', 'USER_PROFILE_UPDATE',
            'USER_LOGIN_FAILED', 'USER_LOGIN_DISABLED', 'USER_REGISTER_DUPLICATE', 'USER_REGISTER_INVALID', 'USER_PROFILE_VIEW',
            // Signalements
            'WASTE_REPORT_CREATE', 'WASTE_REPORT_UPDATE', 'WASTE_REPORT_DELETE', 'WASTE_REPORT_STATUS_UPDATE', 'WASTE_REPORT_STATUS_INVALID', 'WASTE_REPORT_NOT_FOUND', 'WASTE_REPORT_INVALID',
            'WASTE_REPORTS_VIEW_ALL', 'WASTE_REPORTS_VIEW_MY', 'WASTE_REPORTS_VIEW_MAP',
            // Collaborations
            'COLLABORATION_REQUEST', 'COLLABORATION_APPROVE', 'COLLABORATION_REJECT', 'COLLABORATION_STATUS_UPDATE', 'COLLABORATION_STATUS_INVALID', 'COLLABORATION_NOT_FOUND', 'COLLABORATION_VIEW_ALL', 'COLLABORATION_DELETE', 'COLLABORATION_STATS_VIEW',
            // Notifications
            'NOTIFICATIONS_VIEW', 'NOTIFICATIONS_CREATE', 'NOTIFICATIONS_UPDATE',
            // Gestion des utilisateurs (Super Admin)
            'USERS_VIEW_ALL', 'USER_ROLE_UPDATE', 'USER_DELETE', 'USER_STATUS_TOGGLE', 'USER_STATS_VIEW', 'USER_PROMOTED_AUTO',
            // Administration
            'USER_MANAGEMENT', 'USER_MANAGEMENT_VIEW', 'ROLE_UPDATE', 'STATUS_UPDATE',
            // Statistiques
            'STATS_VIEW_GENERAL', 'STATS_VIEW_ADVANCED', 'STATS_VIEW_DASHBOARD',
            // Système
            'SYSTEM_BACKUP', 'DATA_EXPORT', 'SETTINGS_UPDATE', 'SYSTEM_ERROR'
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
        enum: ['citizen', 'admin', 'partner', 'super_admin', 'system', 'public', 'unknown'],
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