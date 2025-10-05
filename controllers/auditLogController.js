// controllers/auditController.js
import AuditLog from '../models/auditLogModel.js';
import User from '../models/userModel.js';

/**
 * Récupérer l'historique des actions (Admin seulement)
 */
export const getAuditLogs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 50,
            action,
            userId,
            resourceType,
            startDate,
            endDate,
            severity
        } = req.query;

        // Construction du filtre
        const filter = {};
        
        if (action) filter.action = action;
        if (userId) filter.userId = userId;
        if (resourceType) filter.resourceType = resourceType;
        if (severity) filter.severity = severity;
        
        // Filtre par date
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 },
            populate: {
                path: 'userId',
                select: 'name email role'
            }
        };

        const auditLogs = await AuditLog.find(filter)
            .populate('userId', 'name email role')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await AuditLog.countDocuments(filter);

        res.json({
            success: true,
            data: {
                auditLogs,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        console.error('❌ Erreur récupération logs audit:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur'
        });
    }
};

/**
 * Statistiques des activités
 */
export const getAuditStats = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [
            totalActions,
            actionsLast30Days,
            actionsByType,
            actionsByRole,
            topUsers
        ] = await Promise.all([
            AuditLog.countDocuments(),
            AuditLog.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
            AuditLog.aggregate([
                {
                    $group: {
                        _id: '$action',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } }
            ]),
            AuditLog.aggregate([
                {
                    $group: {
                        _id: '$userRole',
                        count: { $sum: 1 }
                    }
                }
            ]),
            AuditLog.aggregate([
                {
                    $group: {
                        _id: '$userId',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 10 },
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
                        actionCount: '$count'
                    }
                }
            ])
        ]);

        // Activité des 7 derniers jours
        const activityLast7Days = await AuditLog.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(new Date().setDate(new Date().getDate() - 7))
                    }
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
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            data: {
                summary: {
                    totalActions,
                    actionsLast30Days
                },
                byType: actionsByType,
                byRole: actionsByRole,
                topUsers,
                recentActivity: activityLast7Days
            }
        });
    } catch (error) {
        console.error('❌ Erreur stats audit:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur'
        });
    }
};

/**
 * Recherche dans les logs
 */
export const searchAuditLogs = async (req, res) => {
    try {
        const { q, page = 1, limit = 50 } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                error: 'Terme de recherche requis'
            });
        }

        const filter = {
            $or: [
                { description: { $regex: q, $options: 'i' } },
                { userEmail: { $regex: q, $options: 'i' } },
                { action: { $regex: q, $options: 'i' } }
            ]
        };

        const auditLogs = await AuditLog.find(filter)
            .populate('userId', 'name email role')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await AuditLog.countDocuments(filter);

        res.json({
            success: true,
            data: {
                auditLogs,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        console.error('❌ Erreur recherche logs:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur'
        });
    }
};