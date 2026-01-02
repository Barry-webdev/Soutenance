import Badge from '../models/badgeModel.js';
import UserBadge from '../models/userBadgeModel.js';
import User from '../models/userModel.js';
import WasteReport from '../models/wasteReportModel.js';
import NotificationService from './notification.js';

class GamificationService {
    /**
     * Initialiser les badges par défaut
     */
    static async initializeDefaultBadges() {
        try {
            const defaultBadges = [
                // Badges de signalements
                {
                    name: 'Premier Pas',
                    description: 'Effectuer votre premier signalement',
                    icon: '🌱',
                    color: '#10B981',
                    category: 'reports',
                    criteria: { type: 'reports_count', value: 1 },
                    rarity: 'common',
                    points: 50
                },
                {
                    name: 'Éco-Citoyen',
                    description: 'Effectuer 10 signalements',
                    icon: '🌿',
                    color: '#059669',
                    category: 'reports',
                    criteria: { type: 'reports_count', value: 10 },
                    rarity: 'common',
                    points: 100
                },
                {
                    name: 'Gardien Vert',
                    description: 'Effectuer 50 signalements',
                    icon: '🌳',
                    color: '#047857',
                    category: 'reports',
                    criteria: { type: 'reports_count', value: 50 },
                    rarity: 'rare',
                    points: 250
                },
                {
                    name: 'Héros Écologique',
                    description: 'Effectuer 100 signalements',
                    icon: '🏆',
                    color: '#F59E0B',
                    category: 'reports',
                    criteria: { type: 'reports_count', value: 100 },
                    rarity: 'epic',
                    points: 500
                },
                {
                    name: 'Légende Verte',
                    description: 'Effectuer 500 signalements',
                    icon: '👑',
                    color: '#7C3AED',
                    category: 'reports',
                    criteria: { type: 'reports_count', value: 500 },
                    rarity: 'legendary',
                    points: 1000
                },

                // Badges de collecte
                {
                    name: 'Collecteur Débutant',
                    description: 'Avoir 5 signalements collectés',
                    icon: '♻️',
                    color: '#3B82F6',
                    category: 'collection',
                    criteria: { type: 'collected_count', value: 5 },
                    rarity: 'common',
                    points: 75
                },
                {
                    name: 'Maître du Recyclage',
                    description: 'Avoir 25 signalements collectés',
                    icon: '🔄',
                    color: '#1D4ED8',
                    category: 'collection',
                    criteria: { type: 'collected_count', value: 25 },
                    rarity: 'rare',
                    points: 200
                },
                {
                    name: 'Champion du Nettoyage',
                    description: 'Avoir 100 signalements collectés',
                    icon: '✨',
                    color: '#1E40AF',
                    category: 'collection',
                    criteria: { type: 'collected_count', value: 100 },
                    rarity: 'epic',
                    points: 400
                },

                // Badges de points
                {
                    name: 'Millionnaire Vert',
                    description: 'Atteindre 1000 points',
                    icon: '💎',
                    color: '#06B6D4',
                    category: 'achievement',
                    criteria: { type: 'points_total', value: 1000 },
                    rarity: 'rare',
                    points: 100
                },
                {
                    name: 'Magnat Écologique',
                    description: 'Atteindre 5000 points',
                    icon: '💰',
                    color: '#0891B2',
                    category: 'achievement',
                    criteria: { type: 'points_total', value: 5000 },
                    rarity: 'epic',
                    points: 300
                },

                // Badges spéciaux
                {
                    name: 'Photographe Nature',
                    description: 'Envoyer 20 signalements avec photos',
                    icon: '📸',
                    color: '#EC4899',
                    category: 'special',
                    criteria: { type: 'special_action', value: 20 },
                    rarity: 'rare',
                    points: 150
                },
                {
                    name: 'Explorateur Urbain',
                    description: 'Signaler dans 10 zones différentes',
                    icon: '🗺️',
                    color: '#8B5CF6',
                    category: 'special',
                    criteria: { type: 'special_action', value: 10 },
                    rarity: 'rare',
                    points: 200
                }
            ];

            for (const badgeData of defaultBadges) {
                await Badge.findOneAndUpdate(
                    { name: badgeData.name },
                    badgeData,
                    { upsert: true, new: true }
                );
            }

            console.log('✅ Badges par défaut initialisés');
        } catch (error) {
            console.error('❌ Erreur initialisation badges:', error);
        }
    }

    /**
     * Vérifier et attribuer les badges à un utilisateur
     */
    static async checkAndAwardBadges(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) return;

            // Récupérer les statistiques de l'utilisateur
            const stats = await this.getUserStats(userId);
            
            // Récupérer tous les badges actifs
            const badges = await Badge.find({ isActive: true });

            for (const badge of badges) {
                await this.checkBadgeProgress(userId, badge, stats);
            }
        } catch (error) {
            console.error('❌ Erreur vérification badges:', error);
        }
    }

    /**
     * Vérifier le progrès d'un badge spécifique
     */
    static async checkBadgeProgress(userId, badge, stats) {
        try {
            // Calculer la valeur actuelle selon le critère
            let currentValue = 0;
            
            switch (badge.criteria.type) {
                case 'reports_count':
                    currentValue = stats.totalReports;
                    break;
                case 'collected_count':
                    currentValue = stats.collectedReports;
                    break;
                case 'points_total':
                    currentValue = stats.totalPoints;
                    break;
                case 'special_action':
                    if (badge.name === 'Photographe Nature') {
                        currentValue = stats.reportsWithImages;
                    } else if (badge.name === 'Explorateur Urbain') {
                        currentValue = stats.uniqueLocations;
                    }
                    break;
            }

            // Vérifier si l'utilisateur a déjà ce badge
            let userBadge = await UserBadge.findOne({
                userId: userId,
                badgeId: badge._id
            });

            if (!userBadge) {
                // Créer un nouveau badge pour l'utilisateur
                userBadge = new UserBadge({
                    userId: userId,
                    badgeId: badge._id,
                    progress: {
                        current: currentValue,
                        target: badge.criteria.value
                    }
                });
            } else {
                // Mettre à jour le progrès
                userBadge.progress.current = currentValue;
            }

            // Si le badge vient d'être complété
            const wasCompleted = userBadge.isCompleted;
            await userBadge.save();

            if (userBadge.isCompleted && !wasCompleted) {
                // Marquer le badge comme notifié
                userBadge.notified = true;
                await userBadge.save();

                // Ajouter les points du badge à l'utilisateur
                await User.findByIdAndUpdate(userId, {
                    $inc: { points: badge.points }
                });

                console.log(`🏆 Badge "${badge.name}" attribué à l'utilisateur ${userId}`);

                // Envoyer une notification
                await NotificationService.createNotification({
                    userId: userId,
                    type: 'badge_earned',
                    priority: 'medium',
                    actionUrl: '/profile/badges',
                    title: `🏆 Nouveau Badge Débloqué !`,
                    message: `Félicitations ! Vous avez obtenu le badge "${badge.name}" et gagné ${badge.points} points !`
                });
            }
        } catch (error) {
            console.error('❌ Erreur vérification badge:', error);
        }
    }

    /**
     * Attribuer un badge à un utilisateur
     */
    static async awardBadge(userId, badge, userBadge) {
        try {
            // Ajouter les points du badge à l'utilisateur
            await User.findByIdAndUpdate(userId, {
                $inc: { points: badge.points }
            });

            console.log(`🏆 Badge "${badge.name}" a été attribué à l'utilisateur ${userId}`);

            // Envoyer une notification
            await NotificationService.createNotification({
                userId: userId,
                type: 'badge_earned',
                priority: 'medium',
                actionUrl: '/profile/badges',
                title: `🏆 Nouveau Badge Débloqué !`,
                message: `Félicitations ! Vous avez obtenu le badge "${badge.name}" et gagné ${badge.points} points !`
            });
        } catch (error) {
            console.error('❌ Erreur attribution badge:', error);
        }
    }

    /**
     * Récupérer les statistiques uniques de l'utilisateur
     */
    static async getUserStats(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) return {};

            const [
                totalReports,
                collectedReports,
                reportsWithImages,
                uniqueLocationsResult
            ] = await Promise.all([
                WasteReport.countDocuments({ userId }),
                WasteReport.countDocuments({ userId, status: 'collected' }),
                WasteReport.countDocuments({ 
                    userId, 
                    'images.originalUrl': { $exists: true, $ne: null }
                }),
                WasteReport.aggregate([
                    { $match: { userId } },
                    { 
                        $group: {
                            _id: {
                                lat: { $round: ['$location.lat', 3] },
                                lng: { $round: ['$location.lng', 3] }
                            }
                        }
                    },
                    { $count: 'uniqueLocations' }
                ])
            ]);

            const uniqueLocations = uniqueLocationsResult[0]?.uniqueLocations || 0;
            const totalPoints = await User.findById(userId).select('points');

            return {
                totalReports,
                collectedReports,
                reportsWithImages,
                uniqueLocations: uniqueLocations,
                totalPoints: totalPoints?.points || 0
            };
        } catch (error) {
            console.error('❌ Erreur récupération statistiques utilisateur:', error);
            return {
                totalReports: 0,
                collectedReports: 0,
                reportsWithImages: 0,
                uniqueLocations: 0,
                totalPoints: 0
            };
        }
    }

    /**
     * Récupérer les badges d'un utilisateur
     */
    static async getUserBadges(userId, options = {}) {
        try {
            const { completedOnly = false, page = 1, limit = 20 } = options;
            const skip = (page - 1) * limit;

            let filter = { userId };
            if (completedOnly) {
                filter.isCompleted = true;
            }

            const total = await UserBadge.countDocuments(filter);
            const userBadges = await UserBadge.find(filter)
                .populate('badgeId')
                .sort({ earnedAt: -1, 'progress.percentage': -1 })
                .skip(skip)
                .limit(limit);

            const completed = await UserBadge.countDocuments({ userId, isCompleted: true });

            return {
                badges: userBadges,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total,
                    completed
                }
            };
        } catch (error) {
            console.error('❌ Erreur récupération badges utilisateur:', error);
            return { badges: [], pagination: { current: 1, pages: 0, total: 0, completed: 0 } };
        }
    }

    /**
     * Récupérer le classement des utilisateurs
     */
    static async getLeaderboard(options = {}) {
        try {
            const { type = 'points', period = 'all_time', limit = 10 } = options;
            let sortField = 'points';
            let matchCondition = {};

            // Définir la période
            if (period !== 'all_time') {
                let startDate;
                const now = new Date();
                
                switch (period) {
                    case 'weekly':
                        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        break;
                    case 'monthly':
                        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                        break;
                    case 'yearly':
                        startDate = new Date(Date.UTC(now.getFullYear(), 0, 1));
                        break;
                }
                
                if (startDate) {
                    matchCondition = { createdAt: { $gte: startDate } };
                }
            }

            if (type === 'reports') {
                const pipeline = [
                    { $match: matchCondition },
                    {
                        $group: {
                            _id: '$userId',
                            count: { $sum: 1 }
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
                    { $unwind: '$user' },
                    {
                        $project: {
                            _id: '$user._id',
                            name: '$user.name',
                            email: '$user.email',
                            points: '$user.points',
                            avatar: '$user.avatar',
                            value: '$count'
                        }
                    },
                    { $sort: { value: -1 } },
                    { $limit: limit }
                ];

                const result = await WasteReport.aggregate(pipeline);
                return result;
            } else {
                // Classement par points (défaut)
                const users = await User.find({ role: { $ne: 'admin' } })
                    .select('name email points avatar')
                    .sort({ points: -1 })
                    .limit(limit);

                return users.map(user => ({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    points: user.points,
                    avatar: user.avatar,
                    value: user.points
                }));
            }
        } catch (error) {
            console.error('❌ Erreur récupération classement:', error);
            return [];
        }
    }

    /**
     * Calculer le niveau d'un utilisateur basé sur ses points
     */
    static calculateUserLevel(points) {
        const levels = [
            { level: 1, minPoints: 0, name: 'Débutant', color: '#6B7280' },
            { level: 2, minPoints: 100, name: 'Apprenti', color: '#10B981' },
            { level: 3, minPoints: 300, name: 'Citoyen', color: '#3B82F6' },
            { level: 4, minPoints: 600, name: 'Gardien', color: '#8B5CF6' },
            { level: 5, minPoints: 1000, name: 'Protecteur', color: '#EF4444' },
            { level: 6, minPoints: 1500, name: 'Champion', color: '#F59E0B' },
            { level: 7, minPoints: 2500, name: 'Héros', color: '#EC4899' },
            { level: 8, minPoints: 4000, name: 'Légende', color: '#7C3AED' },
            { level: 9, minPoints: 6000, name: 'Maître', color: '#059669' },
            { level: 10, minPoints: 10000, name: 'Grand Maître', color: '#DC2626' }
        ];

        let currentLevel = levels[0];
        let nextLevel = levels[1] || null;

        for (let i = 0; i < levels.length; i++) {
            if (points >= levels[i].minPoints) {
                currentLevel = levels[i];
                nextLevel = levels[i + 1] || null;
            } else {
                break;
            }
        }

        const progress = nextLevel ? 
            Math.round(((points - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100) : 
            100;

        const pointsToNext = nextLevel ? nextLevel.minPoints - points : 0;

        return {
            current: currentLevel,
            next: nextLevel,
            progress,
            pointsToNext
        };
    }

    /**
     * Récupérer les défis quotidiens/hebdomadaires
     */
    static async getDailyChallenges(userId) {
        try {
            const today = new Date();
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

            // Signalements aujourd'hui
            const todayReports = await WasteReport.countDocuments({
                userId,
                createdAt: { $gte: startOfDay }
            });

            const challenges = [
                {
                    id: 'daily_report',
                    name: 'Signalement Quotidien',
                    description: 'Effectuer au moins 1 signalement aujourd\'hui',
                    icon: '📍',
                    progress: { current: todayReports, target: 1 },
                    reward: { points: 20, badge: null },
                    type: 'daily'
                },
                {
                    id: 'weekly_streak',
                    name: 'Série Hebdomadaire',
                    description: 'Effectuer au moins 1 signalement par jour pendant 7 jours',
                    icon: '🔥',
                    progress: { current: 0, target: 7 }, // À calculer
                    reward: { points: 100, badge: null },
                    type: 'weekly'
                }
            ];

            return challenges;
        } catch (error) {
            console.error('❌ Erreur récupération défis:', error);
            return [];
        }
    }
}

export default GamificationService;