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
import notificationRoutes from './routes/notificationRoute.js';
import { errorHandler, notFound } from './middlewares/errorMiddleware.js';
import { createServer } from 'http';

const app = express();

// Connexion à la base de données
connectDB();

// Middlewares de sécurité
app.use(helmet());

// Configuration CORS ultra-permissive TEMPORAIRE pour déblocage immédiat
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Configuration CORS permissive pour la production
app.use(cors({
    origin: function (origin, callback) {
        // Permettre les requêtes sans origin (mobile apps, etc.)
        if (!origin) return callback(null, true);
        
        // Permettre localhost pour le développement
        if (origin.includes('localhost')) {
            return callback(null, true);
        }
        
        // Permettre tous les domaines Vercel
        if (origin.includes('vercel.app')) {
            return callback(null, true);
        }
        
        // Permettre les domaines de production connus
        const allowedDomains = [
            'ecopulse-app.vercel.app',
            'ecopulse-app-web.vercel.app',
            'soutenance-barry-webdevs-projects.vercel.app'
        ];
        
        for (const domain of allowedDomains) {
            if (origin.includes(domain)) {
                return callback(null, true);
            }
        }
        
        // En cas de doute, permettre (pour éviter les blocages)
        console.log('⚠️ Origin non reconnu mais autorisé:', origin);
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware pour gérer les requêtes OPTIONS (preflight)
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
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

// Servir les fichiers statiques (images)
app.use('/uploads', express.static('uploads'));

// Routes essentielles seulement
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/collaborations', collaborationRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/notifications', notificationRoutes);

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

// Endpoint de debug pour contourner le rate limiting
app.get('/debug/health', (req, res) => {
    res.json({
        status: 'OK - Debug',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        message: 'Endpoint de debug sans rate limiting'
    });
});

// Route de debug pour l'authentification (sans rate limiting)
app.post('/debug/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Import dynamique pour éviter les problèmes de dépendances
        const { default: User } = await import('./models/userModel.js');
        const jwt = await import('jsonwebtoken');
        
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Email ou mot de passe incorrect'
            });
        }
        
        const isPasswordValid = await user.comparePassword(password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Email ou mot de passe incorrect'
            });
        }
        
        const token = jwt.default.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            success: true,
            message: 'Connexion réussie (debug)',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    points: user.points
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Erreur debug login:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur'
        });
    }
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