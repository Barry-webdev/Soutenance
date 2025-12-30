// server.js
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
import exportRoutes from './routes/exportWordRoute.js';
import auditRoutes from './routes/auditLogRoute.js';
import notificationRoutes from './routes/notificationRoute.js';

import { errorHandler, notFound } from './middlewares/errorMiddleware.js';

const app = express();

// Connexion à la base de données
connectDB();

// Middlewares de sécurité
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/collaborations', collaborationRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/notifications', notificationRoutes);

// Page d'accueil
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Bienvenue sur Waste Management App API',
        version: '1.0.0',
        documentation: '/api/health'
    });
});

// Gestion des erreurs
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📊 Environnement: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
});