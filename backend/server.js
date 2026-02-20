import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoute.js';
import userRoutes from './routes/userRoute.js';
import userManagementRoutes from './routes/userManagementRoute.js';
import wasteRoutes from './routes/wasteRoute.js';
import collaborationRoutes from './routes/collaborationRoute.js';
import statsRoutes from './routes/statsRoute.js';
import notificationRoutes from './routes/notificationRoute.js';
import transcriptionRoutes from './routes/transcriptionRoute.js';
import securityRoutes from './routes/securityRoute.js';

import { errorHandler, notFound } from './middlewares/errorMiddleware.js';
import { createServer } from 'http';
import { globalSecurityMiddleware } from './middlewares/advancedSecurityMiddleware.js';

const app = express();

// Connexion à la base de données
connectDB();

// Middlewares de sécurité
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

// 🔒 SÉCURITÉ: Configuration CORS stricte
const allowedOrigins = [
    'http://localhost:3002',
    'http://localhost:5173',
    'https://ecopulse-app.vercel.app',
    'https://ecopulse-wine.vercel.app',
    'https://soutenance-barry-webdevs-projects.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        // Permettre les requêtes sans origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        // Vérifier si l'origin est dans la liste autorisée
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else if (origin.includes('vercel.app') && origin.includes('ecopulse')) {
            // Permettre les previews Vercel d'EcoPulse
            console.log('⚠️ Origin Vercel preview autorisé:', origin);
            callback(null, true);
        } else {
            console.log('🚫 Origin bloqué:', origin);
            callback(new Error('Non autorisé par CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 🔒 SÉCURITÉ: Limitation de taux stricte
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requêtes max
    message: {
        success: false,
        error: 'Trop de requêtes. Veuillez réessayer dans 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // 🔒 Limiter par IP
    keyGenerator: (req) => {
        return req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    }
});
app.use('/api/', limiter);

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 🔒 SÉCURITÉ AVANCÉE: Protection multicouche contre toutes les attaques
app.use(globalSecurityMiddleware);

// Middleware de logging pour debug CORS
app.use((req, res, next) => {
    if (req.method === 'PATCH' || req.method === 'OPTIONS') {
        console.log(`🌐 ${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
        console.log(`📋 Headers: ${JSON.stringify(req.headers.authorization ? 'Bearer ***' : 'no-auth')}`);
    }
    next();
});

// Servir les fichiers statiques (images)
app.use('/uploads', express.static('uploads'));
app.use('/public', express.static('public'));

// Routes essentielles seulement
app.use('/api/auth', authRoutes);
app.use('/api/users/manage', userManagementRoutes); // ✅ Route spécifique AVANT la route générale
app.use('/api/users', userRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/collaborations', collaborationRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/transcription', transcriptionRoutes);
app.use('/api/security', securityRoutes);

// Endpoints de santé pour les tests et le monitoring
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
    });
});

app.get('/api/health/db', async (req, res) => {
    try {
        // Test simple de connexion à la base de données
        const mongoose = await import('mongoose');
        if (mongoose.default.connection.readyState === 1) {
            res.json({
                status: 'OK',
                database: 'connected',
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(503).json({
                status: 'ERROR',
                database: 'disconnected',
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        res.status(503).json({
            status: 'ERROR',
            database: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Page d'accueil
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Bienvenue sur EcoPulse API',
        version: '1.0.0',
        documentation: '/api/health',
        endpoints: {
            health: '/api/health',
            database: '/api/health/db',
            auth: '/api/auth',
            waste: '/api/waste',
            stats: '/api/stats'
        }
    });
});

// Gestion des erreurs
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
const server = createServer(app);

// WebSocket temporairement désactivé pour le déploiement
// webSocketService.initialize(server);

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📊 Environnement: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 URL: http://0.0.0.0:${PORT}`);
    console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});