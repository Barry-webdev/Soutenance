import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoute.js';
import userRoutes from './routes/userRoute.js';
import wasteRoutes from './routes/wasteRoute.js';
import collaborationRoutes from './routes/collaborationRoute.js';
import statsRoutes from './routes/statsRoute.js';
import { errorHandler, notFound } from './middlewares/errorMiddleware.js';
import { createServer } from 'http';

const app = express();

// Connexion à la base de données
connectDB();

// Middlewares de sécurité
app.use(helmet());

// Configuration CORS dynamique pour la production
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    // Ajoutez ici vos domaines de production
    // 'https://votre-app.vercel.app',
    // 'https://votre-domaine.com'
];

app.use(cors({
    origin: function (origin, callback) {
        // Permettre les requêtes sans origin (mobile apps, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Non autorisé par CORS'));
        }
    },
    credentials: true
}));

// Limitation de taux
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limite chaque IP à 100 requêtes par windowMs
});
app.use('/api/', limiter);

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques (images)
app.use('/uploads', express.static('uploads'));

// Routes essentielles seulement
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/collaborations', collaborationRoutes);
app.use('/api/stats', statsRoutes);

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