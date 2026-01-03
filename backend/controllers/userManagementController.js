import User from '../models/userModel.js';
import { logManualAudit } from '../middlewares/auditMiddleware.js';

/**
 * Récupérer tous les utilisateurs (Super Admin uniquement)
 */
export const getAllUsers = async (req, res) => {
    try {
        const { role, search } = req.query;
        
        // Construire le filtre
        let filter = {};
        if (role && role !== 'all') {
            filter.role = role;
        }
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(filter)
            .select('-password')
            .sort({ createdAt: -1 });

        // Audit pour consultation des utilisateurs
        await logManualAudit(
            'USERS_VIEW_ALL',
            req.user,
            `Consultation de tous les utilisateurs`,
            { 
                filter: { role: role || 'all', search: search || 'none' },
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
        
        await logManualAudit(
            'SYSTEM_ERROR',
            req.user,
            `Erreur lors de la récupération des utilisateurs: ${error.message}`,
            { error: error.message, endpoint: '/users/manage' }
        );
        
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur' 
        });
    }
};

/**
 * Mettre à jour le rôle d'un utilisateur (Super Admin uniquement)
 */
export const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const userId = req.params.id;

        // Vérifier que le rôle est valide
        if (!['citizen', 'admin', 'partner'].includes(role)) {
            return res.status(400).json({ 
                success: false,
                error: 'Rôle invalide' 
            });
        }

        // Empêcher la modification de son propre rôle
        if (userId === req.user._id.toString()) {
            return res.status(400).json({ 
                success: false,
                error: 'Vous ne pouvez pas modifier votre propre rôle' 
            });
        }

        // Récupérer l'utilisateur avant modification
        const userBefore = await User.findById(userId);
        if (!userBefore) {
            return res.status(404).json({ 
                success: false,
                error: 'Utilisateur non trouvé' 
            });
        }

        // Empêcher la modification d'un autre super admin
        if (userBefore.role === 'super_admin') {
            return res.status(403).json({ 
                success: false,
                error: 'Impossible de modifier le rôle d\'un super administrateur' 
            });
        }

        // Mettre à jour le rôle
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { role },
            { new: true, runValidators: true }
        ).select('-password');

        // Audit pour modification de rôle
        await logManualAudit(
            'USER_ROLE_UPDATE',
            req.user,
            `Rôle utilisateur modifié: ${updatedUser.email} (${userBefore.role} → ${role})`,
            { 
                targetUserId: userId,
                targetUserEmail: updatedUser.email,
                oldRole: userBefore.role,
                newRole: role 
            }
        );

        res.json({
            success: true,
            message: `Rôle mis à jour: ${userBefore.role} → ${role}`,
            data: updatedUser
        });
    } catch (error) {
        console.error('❌ Erreur mise à jour rôle:', error);
        
        await logManualAudit(
            'SYSTEM_ERROR',
            req.user,
            `Erreur lors de la mise à jour du rôle utilisateur: ${error.message}`,
            { 
                error: error.message, 
                targetUserId: req.params.id,
                endpoint: `/users/manage/${req.params.id}/role` 
            }
        );
        
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur' 
        });
    }
};

/**
 * Supprimer un utilisateur (Super Admin uniquement)
 */
export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Empêcher la suppression de son propre compte
        if (userId === req.user._id.toString()) {
            return res.status(400).json({ 
                success: false,
                error: 'Vous ne pouvez pas supprimer votre propre compte' 
            });
        }

        // Récupérer l'utilisateur avant suppression
        const userToDelete = await User.findById(userId);
        if (!userToDelete) {
            return res.status(404).json({ 
                success: false,
                error: 'Utilisateur non trouvé' 
            });
        }

        // Empêcher la suppression d'un autre super admin
        if (userToDelete.role === 'super_admin') {
            return res.status(403).json({ 
                success: false,
                error: 'Impossible de supprimer un super administrateur' 
            });
        }

        // Supprimer l'utilisateur
        await User.findByIdAndDelete(userId);

        // Audit pour suppression d'utilisateur
        await logManualAudit(
            'USER_DELETE',
            req.user,
            `Utilisateur supprimé: ${userToDelete.email} (${userToDelete.role})`,
            { 
                deletedUserId: userId,
                deletedUserEmail: userToDelete.email,
                deletedUserRole: userToDelete.role 
            }
        );

        res.json({
            success: true,
            message: `Utilisateur ${userToDelete.email} supprimé avec succès`
        });
    } catch (error) {
        console.error('❌ Erreur suppression utilisateur:', error);
        
        await logManualAudit(
            'SYSTEM_ERROR',
            req.user,
            `Erreur lors de la suppression de l'utilisateur: ${error.message}`,
            { 
                error: error.message, 
                targetUserId: req.params.id,
                endpoint: `/users/manage/${req.params.id}` 
            }
        );
        
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur' 
        });
    }
};

/**
 * Activer/Désactiver un utilisateur (Super Admin uniquement)
 */
export const toggleUserStatus = async (req, res) => {
    try {
        const userId = req.params.id;

        // Empêcher la modification de son propre statut
        if (userId === req.user._id.toString()) {
            return res.status(400).json({ 
                success: false,
                error: 'Vous ne pouvez pas modifier votre propre statut' 
            });
        }

        // Récupérer l'utilisateur
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                error: 'Utilisateur non trouvé' 
            });
        }

        // Empêcher la modification d'un autre super admin
        if (user.role === 'super_admin') {
            return res.status(403).json({ 
                success: false,
                error: 'Impossible de modifier le statut d\'un super administrateur' 
            });
        }

        // Inverser le statut
        const newStatus = !user.isActive;
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { isActive: newStatus },
            { new: true, runValidators: true }
        ).select('-password');

        // Audit pour changement de statut
        await logManualAudit(
            'USER_STATUS_TOGGLE',
            req.user,
            `Statut utilisateur modifié: ${updatedUser.email} (${user.isActive ? 'actif' : 'inactif'} → ${newStatus ? 'actif' : 'inactif'})`,
            { 
                targetUserId: userId,
                targetUserEmail: updatedUser.email,
                oldStatus: user.isActive,
                newStatus: newStatus 
            }
        );

        res.json({
            success: true,
            message: `Utilisateur ${newStatus ? 'activé' : 'désactivé'} avec succès`,
            data: updatedUser
        });
    } catch (error) {
        console.error('❌ Erreur modification statut:', error);
        
        await logManualAudit(
            'SYSTEM_ERROR',
            req.user,
            `Erreur lors de la modification du statut utilisateur: ${error.message}`,
            { 
                error: error.message, 
                targetUserId: req.params.id,
                endpoint: `/users/manage/${req.params.id}/toggle-status` 
            }
        );
        
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur' 
        });
    }
};

/**
 * Statistiques des utilisateurs (Super Admin uniquement)
 */
export const getUserStats = async (req, res) => {
    try {
        const stats = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 },
                    active: { 
                        $sum: { $cond: ['$isActive', 1, 0] } 
                    }
                }
            }
        ]);

        const total = await User.countDocuments();
        const totalActive = await User.countDocuments({ isActive: true });

        // Audit pour consultation des statistiques
        await logManualAudit(
            'USER_STATS_VIEW',
            req.user,
            `Consultation des statistiques utilisateurs`,
            { total: total, active: totalActive }
        );

        res.json({
            success: true,
            data: {
                stats,
                total,
                totalActive
            }
        });
    } catch (error) {
        console.error('❌ Erreur récupération statistiques utilisateurs:', error);
        
        await logManualAudit(
            'SYSTEM_ERROR',
            req.user,
            `Erreur lors de la récupération des statistiques utilisateurs: ${error.message}`,
            { error: error.message, endpoint: '/users/manage/stats' }
        );
        
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur' 
        });
    }
};