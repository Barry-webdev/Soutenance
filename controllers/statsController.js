// controllers/statsController.js
import User from '../models/userModel.js';
import WasteReport from '../models/wasteReportModel.js';
import CollaborationRequest from '../models/collaborationRequestModel.js';

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
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur' 
        });
    }
};