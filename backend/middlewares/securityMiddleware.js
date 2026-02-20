// middlewares/securityMiddleware.js
import rateLimit from 'express-rate-limit';

/**
 * 🔒 Rate limiter strict pour les routes d'authentification
 * Protection contre les attaques par force brute
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 tentatives maximum
    message: {
        success: false,
        error: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Ne compter que les échecs
});

/**
 * 🔒 Rate limiter pour les créations de signalements
 * Éviter le spam de signalements
 */
export const reportLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 10, // 10 signalements max par heure
    message: {
        success: false,
        error: 'Limite de signalements atteinte. Veuillez réessayer dans 1 heure.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * 🔒 Middleware pour sanitizer les entrées utilisateur
 * Protection contre les injections NoSQL
 */
export const sanitizeInput = (req, res, next) => {
    // Nettoyer les objets suspects dans req.body
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }
    
    // Nettoyer les query params
    if (req.query) {
        req.query = sanitizeObject(req.query);
    }
    
    next();
};

/**
 * Fonction helper pour nettoyer les objets
 */
function sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }
    
    const sanitized = {};
    
    for (const key in obj) {
        // Bloquer les opérateurs MongoDB dangereux
        if (key.startsWith('$') || key.includes('.')) {
            console.warn(`🚫 Tentative d'injection détectée: ${key}`);
            continue;
        }
        
        const value = obj[key];
        
        // Récursion pour les objets imbriqués
        if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeObject(value);
        } else if (typeof value === 'string') {
            // Nettoyer les chaînes de caractères
            sanitized[key] = value.trim();
        } else {
            sanitized[key] = value;
        }
    }
    
    return sanitized;
}

/**
 * 🔒 Middleware pour valider les IDs MongoDB
 * Protection contre les injections
 */
export const validateMongoId = (paramName = 'id') => {
    return (req, res, next) => {
        const id = req.params[paramName];
        
        // Vérifier le format MongoDB ObjectId (24 caractères hexadécimaux)
        const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
        
        if (!mongoIdRegex.test(id)) {
            return res.status(400).json({
                success: false,
                error: 'ID invalide'
            });
        }
        
        next();
    };
};

/**
 * 🔒 Middleware pour logger les activités suspectes
 */
export const logSuspiciousActivity = (req, res, next) => {
    const suspiciousPatterns = [
        /(\$where|\$regex|\$ne|\$gt|\$lt)/i, // Opérateurs MongoDB
        /(union|select|insert|update|delete|drop|create|alter)/i, // SQL
        /(<script|javascript:|onerror=|onload=)/i, // XSS
        /(\.\.\/|\.\.\\)/i, // Path traversal
    ];
    
    const checkString = JSON.stringify(req.body) + JSON.stringify(req.query);
    
    for (const pattern of suspiciousPatterns) {
        if (pattern.test(checkString)) {
            console.warn('🚨 ACTIVITÉ SUSPECTE DÉTECTÉE:', {
                ip: req.ip,
                method: req.method,
                path: req.path,
                body: req.body,
                query: req.query,
                user: req.user?.email || 'anonymous'
            });
            
            return res.status(400).json({
                success: false,
                error: 'Requête invalide détectée'
            });
        }
    }
    
    next();
};

/**
 * 🔒 Middleware pour vérifier les headers de sécurité
 */
export const validateSecurityHeaders = (req, res, next) => {
    // Vérifier que le Content-Type est correct pour les POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const contentType = req.headers['content-type'];
        
        if (!contentType) {
            return res.status(400).json({
                success: false,
                error: 'Content-Type manquant'
            });
        }
        
        // Autoriser application/json et multipart/form-data
        if (!contentType.includes('application/json') && 
            !contentType.includes('multipart/form-data')) {
            return res.status(400).json({
                success: false,
                error: 'Content-Type non supporté'
            });
        }
    }
    
    next();
};
