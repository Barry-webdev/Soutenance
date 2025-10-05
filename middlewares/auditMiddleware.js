// middlewares/auditMiddleware.js
import AuditLog from '../models/auditLogModel.js';

/**
 * Middleware pour logger les actions des utilisateurs
 */
export const auditLogger = (action, resourceType = null, getResourceId = null, metadata = {}) => {
    return async (req, res, next) => {
        // Sauvegarder la fonction res.json originale
        const originalJson = res.json;
        
        // Override de res.json pour intercepter la réponse
        res.json = function(data) {
            // Restaurer la fonction originale
            res.json = originalJson;
            
            // Logger l'action après que la requête soit traitée
            logAuditAction(req, res, action, resourceType, getResourceId, metadata, data)
                .catch(error => {
                    console.error('❌ Erreur journalisation audit:', error);
                });
            
            // Retourner la réponse originale
            return originalJson.call(this, data);
        };
        
        next();
    };
};

/**
 * Fonction pour logger une action d'audit
 */
const logAuditAction = async (req, res, action, resourceType, getResourceId, metadata, responseData) => {
    try {
        if (!req.user) return; // Pas de journalisation si pas d'utilisateur
        
        let resourceId = null;
        
        // Déterminer l'ID de la ressource
        if (getResourceId) {
            if (typeof getResourceId === 'function') {
                resourceId = getResourceId(req, responseData);
            } else {
                resourceId = req.params[getResourceId] || req.body[getResourceId];
            }
        }
        
        // Description automatique basée sur l'action
        const descriptions = {
            'USER_REGISTER': 'Inscription d\'un nouvel utilisateur',
            'USER_LOGIN': 'Connexion utilisateur',
            'USER_LOGOUT': 'Déconnexion utilisateur',
            'USER_PROFILE_UPDATE': 'Mise à jour du profil utilisateur',
            'WASTE_REPORT_CREATE': 'Création d\'un signalement de déchet',
            'WASTE_REPORT_UPDATE': 'Modification d\'un signalement de déchet',
            'WASTE_REPORT_DELETE': 'Suppression d\'un signalement de déchet',
            'COLLABORATION_REQUEST': 'Demande de collaboration soumise',
            'COLLABORATION_APPROVE': 'Demande de collaboration approuvée',
            'COLLABORATION_REJECT': 'Demande de collaboration rejetée',
            'USER_MANAGEMENT': 'Gestion des utilisateurs',
            'ROLE_UPDATE': 'Mise à jour du rôle utilisateur',
            'STATUS_UPDATE': 'Mise à jour du statut',
            'SYSTEM_BACKUP': 'Sauvegarde du système',
            'DATA_EXPORT': 'Export des données',
            'SETTINGS_UPDATE': 'Mise à jour des paramètres'
        };
        
        const description = metadata.description || descriptions[action] || `Action: ${action}`;
        
        // Créer l'entrée d'audit
        await AuditLog.create({
            action,
            userId: req.user._id,
            userEmail: req.user.email,
            userRole: req.user.role,
            resourceType,
            resourceId,
            description,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            metadata: {
                ...metadata,
                method: req.method,
                url: req.originalUrl,
                statusCode: res.statusCode,
                response: responseData.success !== undefined ? { success: responseData.success } : undefined
            },
            severity: getSeverityLevel(action)
        });
        
    } catch (error) {
        console.error('❌ Erreur création log audit:', error);
    }
};

/**
 * Déterminer le niveau de sévérité
 */
const getSeverityLevel = (action) => {
    const criticalActions = ['USER_MANAGEMENT', 'ROLE_UPDATE', 'SYSTEM_BACKUP'];
    const highActions = ['COLLABORATION_APPROVE', 'COLLABORATION_REJECT', 'DATA_EXPORT'];
    
    if (criticalActions.includes(action)) return 'critical';
    if (highActions.includes(action)) return 'high';
    if (action.includes('DELETE')) return 'medium';
    return 'low';
};

/**
 * Logger manuel pour les actions spécifiques
 */
export const logManualAudit = async (action, user, description, metadata = {}) => {
    try {
        await AuditLog.create({
            action,
            userId: user._id,
            userEmail: user.email,
            userRole: user.role,
            description,
            ipAddress: 'system',
            metadata
        });
    } catch (error) {
        console.error('❌ Erreur log manuel:', error);
    }
};