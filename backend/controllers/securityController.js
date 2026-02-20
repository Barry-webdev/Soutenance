// controllers/securityController.js
import securityMonitoring from '../services/securityMonitoringService.js';

/**
 * Obtenir les statistiques de sécurité (Admin uniquement)
 */
export const getSecurityStats = async (req, res) => {
    try {
        const stats = securityMonitoring.getStats();
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Erreur récupération stats sécurité:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur'
        });
    }
};

/**
 * Obtenir les attaques récentes (Admin uniquement)
 */
export const getRecentAttacks = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const attacks = securityMonitoring.getRecentAttacks(limit);
        
        res.json({
            success: true,
            count: attacks.length,
            data: attacks
        });
    } catch (error) {
        console.error('Erreur récupération attaques:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur'
        });
    }
};

/**
 * Obtenir les IPs bloquées (Admin uniquement)
 */
export const getBlockedIPs = async (req, res) => {
    try {
        const blockedIPs = securityMonitoring.getBlockedIPs();
        
        res.json({
            success: true,
            count: blockedIPs.length,
            data: blockedIPs
        });
    } catch (error) {
        console.error('Erreur récupération IPs bloquées:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur'
        });
    }
};

/**
 * Débloquer une IP (Admin uniquement)
 */
export const unblockIP = async (req, res) => {
    try {
        const { ip } = req.body;
        
        if (!ip) {
            return res.status(400).json({
                success: false,
                error: 'IP requise'
            });
        }
        
        const result = securityMonitoring.unblockIP(ip);
        
        if (result) {
            res.json({
                success: true,
                message: `IP ${ip} débloquée avec succès`
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'IP non trouvée dans la liste des bloquées'
            });
        }
    } catch (error) {
        console.error('Erreur déblocage IP:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur'
        });
    }
};
