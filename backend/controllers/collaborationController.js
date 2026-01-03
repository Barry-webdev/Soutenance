import CollaborationRequest from '../models/collaborationRequestModel.js';
import { logManualAudit } from '../middlewares/auditMiddleware.js';
import NotificationService from '../services/notification.js';

/**
 * Soumettre une demande de collaboration
 */
export const submitCollaborationRequest = async (req, res) => {
    try {
        const { organizationName, contactPerson, email, phone, type } = req.body;

        const collaborationRequest = await CollaborationRequest.create({
            organizationName,
            contactPerson,
            email,
            phone,
            type
        });

        // Pas d'audit pour les soumissions publiques (pour éviter les erreurs)
        console.log(`📝 Nouvelle demande de collaboration: ${organizationName} (${email})`);

        res.status(201).json({ 
            success: true, 
            message: 'Demande de collaboration envoyée avec succès. En attente de validation.',
            data: collaborationRequest 
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            
            // Audit pour données de collaboration invalides
            await logManualAudit(
                'COLLABORATION_REQUEST_INVALID',
                { _id: 'public', email: req.body.email, role: 'public' },
                `Tentative de demande de collaboration avec données invalides`,
                { errors, organization: req.body.organizationName }
            );
            
            return res.status(400).json({ 
                success: false,
                error: 'Données invalides', 
                details: errors 
            });
        }
        
        console.error('❌ Erreur collaboration:', error);
        
        // Audit pour erreur serveur lors de la soumission
        await logManualAudit(
            'SYSTEM_ERROR',
            { _id: 'system', email: 'system', role: 'system' },
            `Erreur serveur lors de l'enregistrement de collaboration: ${error.message}`,
            { error: error.message, endpoint: '/collaborations' }
        );
        
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur lors de l\'enregistrement' 
        });
    }
};

/**
 * Récupérer toutes les demandes de collaboration (Admin)
 */
export const getCollaborationRequests = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};

        const collaborationRequests = await CollaborationRequest.find(filter)
            .sort({ submittedAt: -1 });

        // Audit pour consultation des collaborations
        await logManualAudit(
            'COLLABORATION_VIEW_ALL',
            req.user,
            `Consultation de toutes les demandes de collaboration`,
            { 
                filter: status || 'all',
                count: collaborationRequests.length 
            }
        );

        res.json({
            success: true,
            count: collaborationRequests.length,
            data: collaborationRequests
        });
    } catch (error) {
        console.error('❌ Erreur récupération collaborations:', error);
        
        // Audit pour erreur récupération collaborations
        await logManualAudit(
            'SYSTEM_ERROR',
            req.user,
            `Erreur lors de la récupération des collaborations: ${error.message}`,
            { error: error.message, endpoint: '/collaborations' }
        );
        
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur' 
        });
    }
};

/**
 * Mettre à jour le statut d'une demande de collaboration (Super Admin uniquement)
 */
export const updateCollaborationRequestStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            // Audit pour statut invalide
            await logManualAudit(
                'COLLABORATION_STATUS_INVALID',
                req.user,
                `Tentative de mise à jour avec statut invalide: ${status}`,
                { collaborationId: req.params.id, attemptedStatus: status }
            );
            
            return res.status(400).json({ 
                success: false,
                error: 'Statut invalide' 
            });
        }

        // Récupérer la demande avant modification pour l'audit et les notifications
        const requestBeforeUpdate = await CollaborationRequest.findById(req.params.id);

        const collaborationRequest = await CollaborationRequest.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!collaborationRequest) {
            // Audit pour collaboration non trouvée
            await logManualAudit(
                'COLLABORATION_NOT_FOUND',
                req.user,
                `Tentative de mise à jour d'une collaboration non trouvée`,
                { collaborationId: req.params.id }
            );
            
            return res.status(404).json({ 
                success: false,
                error: 'Demande de collaboration non trouvée' 
            });
        }

        // 🚀 PROMOTION AUTOMATIQUE: Si approuvé, promouvoir l'utilisateur à admin
        if (status === 'approved' && requestBeforeUpdate.status !== 'approved') {
            try {
                const User = (await import('../models/userModel.js')).default;
                const user = await User.findOne({ email: collaborationRequest.email });
                
                if (user && user.role === 'citizen') {
                    await User.findByIdAndUpdate(user._id, { role: 'admin' });
                    
                    // Audit pour promotion automatique
                    await logManualAudit(
                        'USER_PROMOTED_AUTO',
                        req.user,
                        `Utilisateur promu automatiquement à admin suite à collaboration approuvée: ${user.email}`,
                        { 
                            promotedUserId: user._id,
                            promotedUserEmail: user.email,
                            collaborationId: collaborationRequest._id,
                            oldRole: 'citizen',
                            newRole: 'admin'
                        }
                    );
                    
                    console.log(`✅ Utilisateur ${user.email} promu automatiquement à admin`);
                } else if (user) {
                    console.log(`⚠️ Utilisateur ${user.email} déjà admin ou autre rôle: ${user.role}`);
                } else {
                    console.log(`⚠️ Aucun utilisateur trouvé avec l'email: ${collaborationRequest.email}`);
                }
            } catch (promotionError) {
                console.error('❌ Erreur lors de la promotion automatique:', promotionError);
                // Ne pas faire échouer la mise à jour du statut pour autant
            }
        }

        // Audit pour mise à jour du statut
        await logManualAudit(
            'COLLABORATION_STATUS_UPDATE',
            req.user,
            `Statut de collaboration mis à jour: ${collaborationRequest.organizationName} -> ${status}`,
            { 
                collaborationId: collaborationRequest._id,
                organization: collaborationRequest.organizationName,
                oldStatus: requestBeforeUpdate.status,
                newStatus: status 
            }
        );

        res.json({
            success: true,
            message: status === 'approved' 
                ? `Collaboration approuvée ! L'utilisateur a été promu admin automatiquement.`
                : `Statut mis à jour: ${status}`,
            data: collaborationRequest
        });
    } catch (error) {
        console.error('❌ Erreur mise à jour statut:', error);
        
        // Audit pour erreur mise à jour statut
        await logManualAudit(
            'SYSTEM_ERROR',
            req.user,
            `Erreur lors de la mise à jour du statut de collaboration: ${error.message}`,
            { 
                error: error.message, 
                collaborationId: req.params.id,
                endpoint: `/collaborations/${req.params.id}/status` 
            }
        );
        
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur' 
        });
    }
};

/**
 * Supprimer une demande de collaboration (Admin)
 */
export const deleteCollaborationRequest = async (req, res) => {
    try {
        const collaborationRequest = await CollaborationRequest.findById(req.params.id);

        if (!collaborationRequest) {
            return res.status(404).json({ 
                success: false,
                error: 'Demande de collaboration non trouvée' 
            });
        }

        // 🔔 NOTIFICATION: Notification à l'organisation si la demande est supprimée
        await NotificationService.notifyOrganizationRequestDeleted(collaborationRequest);

        await CollaborationRequest.findByIdAndDelete(req.params.id);

        // Audit pour suppression
        await logManualAudit(
            'COLLABORATION_DELETE',
            req.user,
            `Demande de collaboration supprimée`,
            { 
                collaborationId: collaborationRequest._id,
                organization: collaborationRequest.organizationName,
                contact: collaborationRequest.contactPerson
            }
        );

        res.json({
            success: true,
            message: 'Demande de collaboration supprimée avec succès'
        });
    } catch (error) {
        console.error('❌ Erreur suppression collaboration:', error);
        
        // Audit pour erreur suppression
        await logManualAudit(
            'SYSTEM_ERROR',
            req.user,
            `Erreur lors de la suppression de la collaboration: ${error.message}`,
            { 
                error: error.message, 
                collaborationId: req.params.id,
                endpoint: `/collaborations/${req.params.id}` 
            }
        );
        
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur' 
        });
    }
};

/**
 * Récupérer les statistiques des collaborations (Admin)
 */
export const getCollaborationStats = async (req, res) => {
    try {
        const stats = await CollaborationRequest.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const total = await CollaborationRequest.countDocuments();

        // Audit pour consultation des statistiques
        await logManualAudit(
            'COLLABORATION_STATS_VIEW',
            req.user,
            `Consultation des statistiques des collaborations`,
            { total: total }
        );

        res.json({
            success: true,
            data: {
                stats,
                total
            }
        });
    } catch (error) {
        console.error('❌ Erreur récupération statistiques:', error);
        
        // Audit pour erreur récupération statistiques
        await logManualAudit(
            'SYSTEM_ERROR',
            req.user,
            `Erreur lors de la récupération des statistiques de collaboration: ${error.message}`,
            { error: error.message, endpoint: '/collaborations/stats' }
        );
        
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur' 
        });
    }
};