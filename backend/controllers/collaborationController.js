// controllers/collaborationController.js
import CollaborationRequest from '../models/collaborationRequestModel.js';
import { logManualAudit } from '../middlewares/auditMiddleware.js';

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

        // Audit pour demande de collaboration soumise
        await logManualAudit(
            'COLLABORATION_REQUEST',
            { _id: 'public', email: email, role: 'public' },
            `Nouvelle demande de collaboration soumise: ${organizationName}`,
            { 
                organization: organizationName,
                contact: contactPerson,
                type: type,
                requestId: collaborationRequest._id 
            }
        );

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
 * Mettre à jour le statut d'une demande de collaboration (Admin)
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

        // Audit pour mise à jour du statut
        await logManualAudit(
            'COLLABORATION_STATUS_UPDATE',
            req.user,
            `Statut de collaboration mis à jour: ${collaborationRequest.organizationName} -> ${status}`,
            { 
                collaborationId: collaborationRequest._id,
                organization: collaborationRequest.organizationName,
                oldStatus: collaborationRequest.status,
                newStatus: status 
            }
        );

        res.json({
            success: true,
            message: `Statut mis à jour: ${status}`,
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