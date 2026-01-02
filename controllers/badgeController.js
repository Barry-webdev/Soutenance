import GamificationService from '../services/gamificationService.js';
import Badge from '../models/badgeModel.js';
import UserBadge from '../models/userBadgeModel.js';

// Initialiser les badges par défaut
export const initializeBadges = async (req, res) => {
    try {
        await GamificationService.initializeDefaultBadges();
        res.status(200).json({
            success: true,
            message: 'Badges initialisés avec succès'
        });
    } catch (error) {
        console.error('Erreur initialisation badges:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'initialisation des badges',
            error: error.message
        });
    }
};

// Récupérer tous les badges disponibles
export const getAllBadges = async (req, res) => {
    try {
        const { category, rarity } = req.query;
        let filter = { isActive: true };

        if (category) filter.category = category;
        if (rarity) filter.rarity = rarity;

        const badges = await Badge.find(filter).sort({ category: 1, points: 1 });

        res.status(200).json({
            success: true,
            data: badges
        });
    } catch (error) {
        console.error('Erreur récupération badges:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des badges',
            error: error.message
        });
    }
};

// Récupérer les badges d'un utilisateur
export const getUserBadges = async (req, res) => {
    try {
        const userId = req.user.id;
        const { completedOnly, page, limit } = req.query;

        const options = {
            completedOnly: completedOnly === 'true',
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20
        };

        const result = await GamificationService.getUserBadges(userId, options);

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Erreur récupération badges utilisateur:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des badges utilisateur',
            error: error.message
        });
    }
};

// Récupérer le profil gamification d'un utilisateur
export const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        // Récupérer les statistiques
        const stats = await GamificationService.getUserStats(userId);
        
        // Calculer le niveau
        const level = GamificationService.calculateUserLevel(stats.totalPoints);
        
        // Récupérer les badges récents
        const recentBadges = await GamificationService.getUserBadges(userId, { 
            completedOnly: true, 
            limit: 5 
        });

        // Récupérer les défis
        const challenges = await GamificationService.getDailyChallenges(userId);

        res.status(200).json({
            success: true,
            data: {
                stats,
                level,
                recentBadges: recentBadges.badges,
                challenges
            }
        });
    } catch (error) {
        console.error('Erreur récupération profil utilisateur:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du profil utilisateur',
            error: error.message
        });
    }
};

// Récupérer le classement
export const getLeaderboard = async (req, res) => {
    try {
        const { type, period, limit } = req.query;

        const options = {
            type: type || 'points',
            period: period || 'all_time',
            limit: parseInt(limit) || 10
        };

        const leaderboard = await GamificationService.getLeaderboard(options);

        res.status(200).json({
            success: true,
            data: leaderboard
        });
    } catch (error) {
        console.error('Erreur récupération classement:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du classement',
            error: error.message
        });
    }
};

// Vérifier et attribuer les badges (endpoint admin)
export const checkUserBadges = async (req, res) => {
    try {
        const { userId } = req.params;
        
        await GamificationService.checkAndAwardBadges(userId);

        res.status(200).json({
            success: true,
            message: 'Vérification des badges effectuée'
        });
    } catch (error) {
        console.error('Erreur vérification badges:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la vérification des badges',
            error: error.message
        });
    }
};

// Récupérer les statistiques détaillées d'un utilisateur
export const getUserStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const stats = await GamificationService.getUserStats(userId);

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Erreur récupération statistiques:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques',
            error: error.message
        });
    }
};