import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

/**
 * Middleware d'authentification JWT
 */
export const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                error: 'Accès refusé. Token manquant.' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({ 
                success: false,
                error: 'Token invalide. Utilisateur non trouvé.' 
            });
        }

        if (!user.isActive) {
            return res.status(403).json({ 
                success: false,
                error: 'Compte désactivé.' 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('❌ Erreur authentification:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false,
                error: 'Token invalide.' 
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                error: 'Token expiré.' 
            });
        }
        
        res.status(500).json({ 
            success: false,
            error: 'Erreur d\'authentification.' 
        });
    }
};

/**
 * Middleware pour vérifier le rôle admin
 */
export const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ 
            success: false,
            error: 'Accès refusé. Droits administrateur requis.' 
        });
    }
    next();
};

/**
 * Middleware pour vérifier les rôles multiples
 */
export const requireRoles = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false,
                error: `Accès refusé. Rôles autorisés: ${roles.join(', ')}` 
            });
        }
        next();
    };
};