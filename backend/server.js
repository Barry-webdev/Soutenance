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

import { errorHandler, notFound } from './middlewares/errorMiddleware.js';
import { createServer } from 'http';

const app = express();

// Connexion à la base de données
connectDB();

// Middlewares de sécurité
app.use(helmet());

// Configuration CORS ultra-permissive pour résoudre les problèmes de connectivité
app.use((req, res, next) => {
    // Permettre toutes les origines Vercel et localhost
    const origin = req.headers.origin;
    
    if (!origin || 
        origin.includes('localhost') || 
        origin.includes('vercel.app') ||
        origin.includes('ecopulse-app') ||
        origin.includes('ecopulse-wine') ||
        origin.includes('soutenance-barry-webdevs-projects')) {
        res.header('Access-Control-Allow-Origin', origin || '*');
    } else {
        // Log des origines non reconnues mais les autoriser quand même
        console.log('⚠️ Origin non reconnu mais autorisé:', origin);
        res.header('Access-Control-Allow-Origin', origin || '*');
    }
    
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Gérer les requêtes preflight OPTIONS
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Limitation de taux (plus permissive pour éviter les blocages)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Augmenté à 1000 requêtes par windowMs
    message: {
        success: false,
        error: 'Trop de requêtes. Veuillez réessayer dans 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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

// Routes essentielles seulement
app.use('/api/auth', authRoutes);
app.use('/api/users/manage', userManagementRoutes); // ✅ Route spécifique AVANT la route générale
app.use('/api/users', userRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/collaborations', collaborationRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/transcription', transcriptionRoutes);

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