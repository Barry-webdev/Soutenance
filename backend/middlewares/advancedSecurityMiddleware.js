// middlewares/advancedSecurityMiddleware.js
import rateLimit from 'express-rate-limit';

/**
 * 🔒 PROTECTION ANTI-DDOS AVANCÉE
 * Limitation stricte par IP avec bannissement temporaire
 */
export const ddosProtection = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // 30 requêtes max par minute
    message: {
        success: false,
        error: 'Trop de requêtes. Vous avez été temporairement bloqué pour activité suspecte.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    // Bannir l'IP si dépassement
    handler: (req, res) => {
        console.warn('🚨 DDOS DÉTECTÉ:', {
            ip: req.ip,
            path: req.path,
            timestamp: new Date().toISOString()
        });
        
        res.status(429).json({
            success: false,
            error: 'Trop de requêtes. Veuillez patienter avant de réessayer.',
            retryAfter: 60 // secondes
        });
    }
});

/**
 * 🔒 PROTECTION CONTRE LES INJECTIONS SQL/NOSQL
 */
export const antiInjection = (req, res, next) => {
    const checkInjection = (obj, path = '') => {
        if (typeof obj === 'string') {
            // Patterns d'injection SQL
            const sqlPatterns = [
                /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/gi,
                /(;|\-\-|\/\*|\*\/|xp_|sp_)/gi,
                /('|(\\')|(--)|(\#)|(%23)|(\/\*))/gi
            ];
            
            // Patterns d'injection NoSQL
            const noSqlPatterns = [
                /\$where/gi,
                /\$ne/gi,
                /\$gt/gi,
                /\$lt/gi,
                /\$regex/gi,
                /\$or/gi,
                /\$and/gi
            ];
            
            for (const pattern of [...sqlPatterns, ...noSqlPatterns]) {
                if (pattern.test(obj)) {
                    console.warn('🚨 INJECTION DÉTECTÉE:', {
                        ip: req.ip,
                        path: req.path,
                        data: obj.substring(0, 100),
                        timestamp: new Date().toISOString()
                    });
                    
                    return true;
                }
            }
        } else if (typeof obj === 'object' && obj !== null) {
            for (const key in obj) {
                // Bloquer les clés commençant par $
                if (key.startsWith('$') || key.includes('.')) {
                    console.warn('🚨 NOSQL INJECTION DÉTECTÉE:', {
                        ip: req.ip,
                        key: key,
                        timestamp: new Date().toISOString()
                    });
                    return true;
                }
                
                if (checkInjection(obj[key], `${path}.${key}`)) {
                    return true;
                }
            }
        }
        return false;
    };
    
    // Vérifier body, query, params
    if (checkInjection(req.body) || checkInjection(req.query) || checkInjection(req.params)) {
        return res.status(400).json({
            success: false,
            error: 'Requête invalide détectée. Tentative d\'injection bloquée.'
        });
    }
    
    next();
};

/**
 * 🔒 PROTECTION CONTRE LES ATTAQUES XSS
 */
export const antiXSS = (req, res, next) => {
    const checkXSS = (obj) => {
        if (typeof obj === 'string') {
            const xssPatterns = [
                /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
                /<iframe[\s\S]*?>/gi,
                /<object[\s\S]*?>/gi,
                /<embed[\s\S]*?>/gi,
                /javascript:/gi,
                /on\w+\s*=/gi, // onclick, onerror, etc.
                /<img[\s\S]*?onerror[\s\S]*?>/gi,
                /eval\s*\(/gi,
                /expression\s*\(/gi
            ];
            
            for (const pattern of xssPatterns) {
                if (pattern.test(obj)) {
                    console.warn('🚨 XSS DÉTECTÉ:', {
                        ip: req.ip,
                        path: req.path,
                        data: obj.substring(0, 100),
                        timestamp: new Date().toISOString()
                    });
                    return true;
                }
            }
        } else if (typeof obj === 'object' && obj !== null) {
            for (const key in obj) {
                if (checkXSS(obj[key])) {
                    return true;
                }
            }
        }
        return false;
    };
    
    if (checkXSS(req.body) || checkXSS(req.query)) {
        return res.status(400).json({
            success: false,
            error: 'Contenu dangereux détecté. Tentative XSS bloquée.'
        });
    }
    
    next();
};

/**
 * 🔒 PROTECTION CONTRE PATH TRAVERSAL
 */
export const antiPathTraversal = (req, res, next) => {
    const checkPathTraversal = (str) => {
        if (typeof str !== 'string') return false;
        
        const patterns = [
            /\.\.\//g,  // ../
            /\.\.\\/g,  // ..\
            /%2e%2e%2f/gi, // URL encoded ../
            /%2e%2e%5c/gi, // URL encoded ..\
            /\.\.%2f/gi,
            /\.\.%5c/gi
        ];
        
        return patterns.some(pattern => pattern.test(str));
    };
    
    const checkAll = (obj) => {
        if (typeof obj === 'string') {
            return checkPathTraversal(obj);
        } else if (typeof obj === 'object' && obj !== null) {
            for (const key in obj) {
                if (checkAll(obj[key])) {
                    return true;
                }
            }
        }
        return false;
    };
    
    if (checkAll(req.body) || checkAll(req.query) || checkAll(req.params)) {
        console.warn('🚨 PATH TRAVERSAL DÉTECTÉ:', {
            ip: req.ip,
            path: req.path,
            timestamp: new Date().toISOString()
        });
        
        return res.status(400).json({
            success: false,
            error: 'Chemin invalide détecté.'
        });
    }
    
    next();
};

/**
 * 🔒 PROTECTION CONTRE CSRF (Cross-Site Request Forgery)
 */
export const antiCSRF = (req, res, next) => {
    // Vérifier l'origine de la requête
    const origin = req.headers.origin || req.headers.referer;
    
    // Liste des origines autorisées
    const allowedOrigins = [
        'http://localhost:3002',
        'http://localhost:5173',
        'https://ecopulse-app.vercel.app',
        'https://ecopulse-wine.vercel.app',
        'https://soutenance-barry-webdevs-projects.vercel.app'
    ];
    
    // Pour les requêtes POST, PUT, DELETE, PATCH
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
        if (!origin) {
            // Pas d'origine = requête suspecte
            console.warn('🚨 CSRF POTENTIEL (pas d\'origine):', {
                ip: req.ip,
                path: req.path,
                method: req.method,
                timestamp: new Date().toISOString()
            });
            
            // Autoriser quand même pour les apps mobiles/Postman
            // mais logger pour surveillance
        } else {
            const isAllowed = allowedOrigins.some(allowed => 
                origin.startsWith(allowed) || 
                (origin.includes('vercel.app') && origin.includes('ecopulse'))
            );
            
            if (!isAllowed) {
                console.warn('🚨 CSRF DÉTECTÉ (origine non autorisée):', {
                    ip: req.ip,
                    origin: origin,
                    path: req.path,
                    timestamp: new Date().toISOString()
                });
                
                return res.status(403).json({
                    success: false,
                    error: 'Origine non autorisée.'
                });
            }
        }
    }
    
    next();
};

/**
 * 🔒 DÉTECTION DE BOTS MALVEILLANTS
 */
export const antiBots = (req, res, next) => {
    const userAgent = req.headers['user-agent'] || '';
    
    // Liste de bots malveillants connus
    const maliciousBots = [
        /sqlmap/i,
        /nikto/i,
        /nmap/i,
        /masscan/i,
        /nessus/i,
        /openvas/i,
        /metasploit/i,
        /burpsuite/i,
        /havij/i,
        /acunetix/i
    ];
    
    for (const bot of maliciousBots) {
        if (bot.test(userAgent)) {
            console.warn('🚨 BOT MALVEILLANT DÉTECTÉ:', {
                ip: req.ip,
                userAgent: userAgent,
                path: req.path,
                timestamp: new Date().toISOString()
            });
            
            return res.status(403).json({
                success: false,
                error: 'Accès refusé.'
            });
        }
    }
    
    next();
};

/**
 * 🔒 PROTECTION CONTRE LES REQUÊTES TROP VOLUMINEUSES
 */
export const antiLargePayload = (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    
    // Limite : 20MB (sauf pour les uploads d'images)
    const maxSize = req.path.includes('/waste') ? 20 * 1024 * 1024 : 1 * 1024 * 1024;
    
    if (contentLength > maxSize) {
        console.warn('🚨 PAYLOAD TROP VOLUMINEUX:', {
            ip: req.ip,
            size: contentLength,
            path: req.path,
            timestamp: new Date().toISOString()
        });
        
        return res.status(413).json({
            success: false,
            error: 'Requête trop volumineuse.'
        });
    }
    
    next();
};

/**
 * 🔒 DÉTECTION D'ACTIVITÉ SUSPECTE GLOBALE
 */
const suspiciousActivity = new Map(); // IP -> { count, lastReset }

export const detectSuspiciousActivity = (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    
    if (!suspiciousActivity.has(ip)) {
        suspiciousActivity.set(ip, { count: 0, lastReset: now });
    }
    
    const activity = suspiciousActivity.get(ip);
    
    // Reset toutes les 5 minutes
    if (now - activity.lastReset > 5 * 60 * 1000) {
        activity.count = 0;
        activity.lastReset = now;
    }
    
    // Incrémenter pour les requêtes suspectes
    const suspiciousPatterns = [
        /admin/i,
        /config/i,
        /\.env/i,
        /backup/i,
        /database/i,
        /phpMyAdmin/i,
        /wp-admin/i,
        /\.git/i
    ];
    
    if (suspiciousPatterns.some(pattern => pattern.test(req.path))) {
        activity.count++;
        
        if (activity.count > 5) {
            console.warn('🚨 ACTIVITÉ SUSPECTE RÉPÉTÉE:', {
                ip: ip,
                count: activity.count,
                path: req.path,
                timestamp: new Date().toISOString()
            });
            
            return res.status(403).json({
                success: false,
                error: 'Activité suspecte détectée. Accès bloqué.'
            });
        }
    }
    
    next();
};

/**
 * 🔒 MIDDLEWARE GLOBAL DE SÉCURITÉ
 * Combine toutes les protections
 */
export const globalSecurityMiddleware = [
    ddosProtection,
    antiInjection,
    antiXSS,
    antiPathTraversal,
    antiCSRF,
    antiBots,
    antiLargePayload,
    detectSuspiciousActivity
];
