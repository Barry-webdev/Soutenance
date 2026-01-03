import mongoose from 'mongoose';

/**
 * Middleware pour vérifier la connexion à la base de données
 */
export const checkDbConnection = (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            success: false,
            error: 'Service temporairement indisponible. Base de données non accessible.',
            code: 'DB_UNAVAILABLE'
        });
    }
    next();
};

/**
 * Middleware pour les opérations critiques (authentification, etc.)
 */
export const requireDbConnection = (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            success: false,
            error: 'Impossible de traiter la demande. Veuillez réessayer dans quelques instants.',
            code: 'DB_REQUIRED'
        });
    }
    next();
};