import CollaborationRequest from '../models/collaborationRequestModel.js';

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

        res.status(201).json({ 
            success: true, 
            message: 'Demande de collaboration envoyée avec succès. En attente de validation.',
            data: collaborationRequest 
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                success: false,
                error: 'Données invalides', 
                details: errors 
            });
        }
        console.error('❌ Erreur collaboration:', error);
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

        res.json({
            success: true,
            count: collaborationRequests.length,
            data: collaborationRequests
        });
    } catch (error) {
        console.error('❌ Erreur récupération collaborations:', error);
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
            return res.status(404).json({ 
                success: false,
                error: 'Demande de collaboration non trouvée' 
            });
        }

        res.json({
            success: true,
            message: `Statut mis à jour: ${status}`,
            data: collaborationRequest
        });
    } catch (error) {
        console.error('❌ Erreur mise à jour statut:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur' 
        });
    }
};