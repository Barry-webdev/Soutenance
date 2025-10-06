import AuditLog from '../models/auditLogModel.js';

/**
 * Dashboard d'audit pour l'administration
 */
export const getAuditDashboard = async (req, res) => {
    try {
        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const startOfWeek = new Date(today.setDate(today.getDate() - 7));
        const startOfMonth = new Date(today.setDate(today.getDate() - 30));

        const [
            todayActions,
            weekActions,
            monthActions,
            recentActions,
            criticalActions,
            userActivity
        ] = await Promise.all([
            // Actions aujourd'hui
            AuditLog.countDocuments({ 
                createdAt: { $gte: startOfToday } 
            }),
            // Actions cette semaine
            AuditLog.countDocuments({ 
                createdAt: { $gte: startOfWeek } 
            }),
            // Actions ce mois
            AuditLog.countDocuments({ 
                createdAt: { $gte: startOfMonth } 
            }),
            // 10 actions récentes
            AuditLog.find()
                .populate('userId', 'name email role')
                .sort({ createdAt: -1 })
                .limit(10),
            // Actions critiques récentes
            AuditLog.find({ severity: 'critical' })
                .populate('userId', 'name email role')
                .sort({ createdAt: -1 })
                .limit(5),
            // Activité par utilisateur
            AuditLog.aggregate([
                {
                    $group: {
                        _id: '$userId',
                        actionCount: { $sum: 1 },
                        lastActivity: { $max: '$createdAt' }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $unwind: '$user'
                },
                {
                    $project: {
                        userName: '$user.name',
                        userEmail: '$user.email',
                        userRole: '$user.role',
                        actionCount: 1,
                        lastActivity: 1
                    }
                },
                { $sort: { actionCount: -1 } },
                { $limit: 15 }
            ])
        ]);

        // Répartition par type d'action
        const actionsByType = await AuditLog.aggregate([
            {
                $group: {
                    _id: '$action',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            success: true,
            data: {
                overview: {
                    today: todayActions,
                    week: weekActions,
                    month: monthActions
                },
                recentActions,
                criticalActions,
                userActivity,
                actionsByType,
                charts: {
                    dailyActivity: await getDailyActivityChart(),
                    actionDistribution: actionsByType
                }
            }
        });
    } catch (error) {
        console.error('❌ Erreur dashboard audit:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur'
        });
    }
};

/**
 * Données pour le graphique d'activité quotidienne
 */
const getDailyActivityChart = async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return await AuditLog.aggregate([
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
                count: { $sum: 1 },
                citizens: {
                    $sum: {
                        $cond: [{ $eq: ["$userRole", "citizen"] }, 1, 0]
                    }
                },
                admins: {
                    $sum: {
                        $cond: [{ $eq: ["$userRole", "admin"] }, 1, 0]
                    }
                },
                partners: {
                    $sum: {
                        $cond: [{ $eq: ["$userRole", "partner"] }, 1, 0]
                    }
                }
            }
        },
        { $sort: { _id: 1 } }
    ]);
};