/**
 * Gestionnaire d'erreurs global
 */
export const errorHandler = (err, req, res, next) => {
    console.error('❌ Erreur:', err);

    let error = { ...err };
    error.message = err.message;

    // Erreur de validation Mongoose
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(error => error.message);
        return res.status(400).json({
            success: false,
            error: 'Erreur de validation',
            details: errors
        });
    }

    // Erreur de duplication (unique constraint)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(409).json({
            success: false,
            error: `La valeur ${err.keyValue[field]} existe déjà pour le champ ${field}`
        });
    }

    // Erreur CastError (ID invalide)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            error: 'ID invalide'
        });
    }

    // Erreur JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: 'Token invalide'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            error: 'Token expiré'
        });
    }

    // Erreur par défaut
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Erreur interne du serveur'
    });
};

/**
 * Middleware pour les routes non trouvées
 */
export const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        error: `Route non trouvée - ${req.originalUrl}`
    });
};