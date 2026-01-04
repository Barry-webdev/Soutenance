import User from '../models/userModel.js';
import WasteReport from '../models/wasteReportModel.js';
import CollaborationRequest from '../models/collaborationRequestModel.js';
import { logManualAudit } from '../middlewares/auditMiddleware.js';

/**
 * Statistiques publiques (pour tous les utilisateurs)
 */
export const getPublicStats = async (req, res) => {
    try {
        const [
            totalWasteReports,
            collectedWasteReports,
            totalUsers,
            totalCollaborations
        ] = await Promise.all([
            WasteReport.countDocuments(),
            WasteReport.countDocuments({ status: 'collected' }),
            User.countDocuments({ role: 'citizen' }),
            CollaborationRequest.countDocuments({ status: 'approved' })
        ]);

        // Statistiques par type de déchet (publiques)
        const wasteByType = await WasteReport.aggregate([
            {
                $group: {
                    _id: '$wasteType',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Évolution des signalements sur 30 jours
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const reportsLast30Days = await WasteReport.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt"
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Audit pour consultation des statistiques publiques
        await logManualAudit(
            'STATS_VIEW_GENERAL',
            req.user,
            `Consultation des statistiques publiques`,
            { 
                wasteReportsTotal: totalWasteReports,
                collectedReports: collectedWasteReports 
            }
        );

        res.json({
            success: true,
            data: {
                summary: {
                    totalReports: totalWasteReports,
                    collectedReports: collectedWasteReports,
                    totalCitizens: totalUsers,
                    activePartnerships: totalCollaborations,
                    collectionRate: totalWasteReports > 0 ? Math.round((collectedWasteReports / totalWasteReports) * 100) : 0
                },
                wasteByType,
                reportsLast30Days,
                period: '30 derniers jours'
            }
        });
    } catch (error) {
        console.error('❌ Erreur récupération statistiques publiques:', error);
        
        // Audit pour erreur récupération statistiques publiques
        await logManualAudit(
            'SYSTEM_ERROR',
            req.user,
            `Erreur lors de la récupération des statistiques publiques: ${error.message}`,
            { error: error.message, endpoint: '/stats/public' }
        );
        
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur' 
        });
    }
};

/**
 * Récupérer les statistiques générales (Admin)
 */
export const getStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalCitizens,
            totalAdmins,
            totalPartners,
            totalWasteReports,
            pendingWasteReports,
            collectedWasteReports,
            totalCollaborations,
            pendingCollaborations,
            approvedCollaborations
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'citizen' }),
            User.countDocuments({ role: 'admin' }),
            User.countDocuments({ role: 'partner' }),
            WasteReport.countDocuments(),
            WasteReport.countDocuments({ status: 'pending' }),
            WasteReport.countDocuments({ status: 'collected' }),
            CollaborationRequest.countDocuments(),
            CollaborationRequest.countDocuments({ status: 'pending' }),
            CollaborationRequest.countDocuments({ status: 'approved' })
        ]);

        // Statistiques par type de déchet
        const wasteByType = await WasteReport.aggregate([
            {
                $group: {
                    _id: '$wasteType',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Statistiques par statut de collaboration
        const collaborationsByType = await CollaborationRequest.aggregate([
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Évolution des signalements sur 7 jours
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const reportsLast7Days = await WasteReport.aggregate([
            {
                $match: {
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt"
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Audit pour consultation des statistiques générales
        await logManualAudit(
            'STATS_VIEW_ADVANCED',
            req.user,
            `Consultation des statistiques générales`,
            { 
                usersTotal: totalUsers,
                wasteReportsTotal: totalWasteReports,
                collaborationsTotal: totalCollaborations 
            }
        );

        res.json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    citizens: totalCitizens,
                    admins: totalAdmins,
                    partners: totalPartners
                },
                wasteReports: {
                    total: totalWasteReports,
                    pending: pendingWasteReports,
                    collected: collectedWasteReports,
                    byType: wasteByType,
                    last7Days: reportsLast7Days
                },
                collaborations: {
                    total: totalCollaborations,
                    pending: pendingCollaborations,
                    approved: approvedCollaborations,
                    byType: collaborationsByType
                }
            }
        });
    } catch (error) {
        console.error('❌ Erreur récupération statistiques:', error);
        
        // Audit pour erreur récupération statistiques
        await logManualAudit(
            'SYSTEM_ERROR',
            req.user,
            `Erreur lors de la récupération des statistiques: ${error.message}`,
            { error: error.message, endpoint: '/stats' }
        );
        
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur' 
        });
    }
};

/**
 * Statistiques pour le dashboard admin
 */
export const getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const [
            recentUsers,
            recentWasteReports,
            recentCollaborations,
            topUsers
        ] = await Promise.all([
            User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
            WasteReport.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
            CollaborationRequest.countDocuments({ submittedAt: { $gte: sevenDaysAgo } }),
            User.find().sort({ points: -1 }).limit(5).select('name email points')
        ]);

        // Audit pour consultation du dashboard
        await logManualAudit(
            'STATS_VIEW_DASHBOARD',
            req.user,
            `Consultation du tableau de bord administrateur`,
            { 
                recentUsers,
                recentWasteReports,
                recentCollaborations 
            }
        );

        res.json({
            success: true,
            data: {
                recent: {
                    users: recentUsers,
                    wasteReports: recentWasteReports,
                    collaborations: recentCollaborations
                },
                topUsers,
                period: '7 derniers jours'
            }
        });
    } catch (error) {
        console.error('❌ Erreur récupération stats dashboard:', error);
        
        // Audit pour erreur récupération dashboard
        await logManualAudit(
            'SYSTEM_ERROR',
            req.user,
            `Erreur lors de la récupération du dashboard: ${error.message}`,
            { error: error.message, endpoint: '/stats/dashboard' }
        );
        
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur' 
        });
    }
};