import User from '../models/userModel.js';
import { logManualAudit } from '../middlewares/auditMiddleware.js';

/**
 * Récupérer tous les utilisateurs (Admin)
 */
export const getUsers = async (req, res) => {
    try {
        const { role } = req.query;
        const filter = role ? { role } : {};

        const users = await User.find(filter)
            .select('-password')
            .sort({ createdAt: -1 });

        // Audit pour consultation de tous les utilisateurs
        await logManualAudit(
            'USER_MANAGEMENT_VIEW',
            req.user,
            `Consultation de la liste des utilisateurs`,
            { 
                filter: role || 'all',
                count: users.length 
            }
        );

        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('❌ Erreur récupération utilisateurs:', error);
        
        // Audit pour erreur récupération utilisateurs
        await logManualAudit(
            'SYSTEM_ERROR',
            req.user,
            `Erreur lors de la récupération des utilisateurs: ${error.message}`,
            { error: error.message, endpoint: '/users' }
        );
        
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur' 
        });
    }
};

/**
 * Récupérer un utilisateur par ID
 */
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password');

        if (!user) {
            // Audit pour utilisateur non trouvé
            await logManualAudit(
                'USER_NOT_FOUND',
                req.user,
                `Tentative de consultation d'un utilisateur non trouvé`,
                { requestedUserId: req.params.id }
            );
            
            return res.status(404).json({ 
                success: false,
                error: 'Utilisateur non trouvé' 
            });
        }

        // Audit pour consultation d'un utilisateur spécifique
        await logManualAudit(
            'USER_VIEW_DETAILS',
            req.user,
            `Consultation des détails de l'utilisateur: ${user.name}`,
            { 
                viewedUserId: user._id,
                viewedUserEmail: user.email,
                viewedUserRole: user.role 
            }
        );

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('❌ Erreur récupération utilisateur:', error);
        
        // Audit pour erreur récupération utilisateur
        await logManualAudit(
            'SYSTEM_ERROR',
            req.user,
            `Erreur lors de la récupération de l'utilisateur: ${error.message}`,
            { error: error.message, userId: req.params.id, endpoint: `/users/${req.params.id}` }
        );
        
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur' 
        });
    }
};

/**
 * Mettre à jour un utilisateur (Admin)
 */
export const updateUser = async (req, res) => {
    try {
        const { name, email, role, points, isActive } = req.body;
        
        // Récupérer l'utilisateur avant modification pour l'audit
        const userBeforeUpdate = await User.findById(req.params.id);
        
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, role, points, isActive },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            // Audit pour utilisateur non trouvé lors de la mise à jour
            await logManualAudit(
                'USER_UPDATE_NOT_FOUND',
                req.user,
                `Tentative de mise à jour d'un utilisateur non trouvé`,
                { requestedUserId: req.params.id }
            );
            
            return res.status(404).json({ 
                success: false,
                error: 'Utilisateur non trouvé' 
            });
        }

        // Préparer les changements pour l'audit
        const changes = {};
        if (name && name !== userBeforeUpdate.name) changes.name = { from: userBeforeUpdate.name, to: name };
        if (email && email !== userBeforeUpdate.email) changes.email = { from: userBeforeUpdate.email, to: email };
        if (role && role !== userBeforeUpdate.role) changes.role = { from: userBeforeUpdate.role, to: role };
        if (points !== undefined && points !== userBeforeUpdate.points) changes.points = { from: userBeforeUpdate.points, to: points };
        if (isActive !== undefined && isActive !== userBeforeUpdate.isActive) changes.isActive = { from: userBeforeUpdate.isActive, to: isActive };

        // Audit pour mise à jour d'utilisateur
        await logManualAudit(
            'USER_UPDATE',
            req.user,
            `Mise à jour de l'utilisateur: ${userBeforeUpdate.name}`,
            { 
                updatedUserId: user._id,
                changes: Object.keys(changes).length > 0 ? changes : 'Aucun changement détecté'
            }
        );

        res.json({
            success: true,
            message: 'Utilisateur mis à jour avec succès',
            data: user
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            
            // Audit pour données de mise à jour invalides
            await logManualAudit(
                'USER_UPDATE_INVALID',
                req.user,
                `Tentative de mise à jour d'utilisateur avec données invalides`,
                { 
                    userId: req.params.id,
                    errors 
                }
            );
            
            return res.status(400).json({ 
                success: false,
                error: 'Données invalides', 
                details: errors 
            });
        }
        
        console.error('❌ Erreur mise à jour utilisateur:', error);
        
        // Audit pour erreur mise à jour utilisateur
        await logManualAudit(
            'SYSTEM_ERROR',
            req.user,
            `Erreur lors de la mise à jour de l'utilisateur: ${error.message}`,
            { 
                error: error.message, 
                userId: req.params.id,
                endpoint: `/users/${req.params.id}` 
            }
        );
        
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur' 
        });
    }
};

/**
 * Supprimer un utilisateur (Admin)
 */
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            // Audit pour utilisateur non trouvé lors de la suppression
            await logManualAudit(
                'USER_DELETE_NOT_FOUND',
                req.user,
                `Tentative de suppression d'un utilisateur non trouvé`,
                { requestedUserId: req.params.id }
            );
            
            return res.status(404).json({ 
                success: false,
                error: 'Utilisateur non trouvé' 
            });
        }

        await User.findByIdAndDelete(req.params.id);

        // Audit pour suppression d'utilisateur
        await logManualAudit(
            'USER_DELETE',
            req.user,
            `Suppression de l'utilisateur: ${user.name} (${user.email})`,
            { 
                deletedUserId: user._id,
                deletedUserEmail: user.email,
                deletedUserRole: user.role 
            }
        );

        res.json({
            success: true,
            message: 'Utilisateur supprimé avec succès'
        });
    } catch (error) {
        console.error('❌ Erreur suppression utilisateur:', error);
        
        // Audit pour erreur suppression utilisateur
        await logManualAudit(
            'SYSTEM_ERROR',
            req.user,
            `Erreur lors de la suppression de l'utilisateur: ${error.message}`,
            { 
                error: error.message, 
                userId: req.params.id,
                endpoint: `/users/${req.params.id}` 
            }
        );
        
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur' 
        });
    }
};