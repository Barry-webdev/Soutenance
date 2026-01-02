/**
 * Serveur de fallback pour éviter les erreurs BufferList
 * Version simplifiée sans modules problématiques
 */

import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 10000;

// Middlewares de base
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Route de santé simple
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'EcoPulse Backend - Mode Fallback',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        mode: 'fallback'
    });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error('Erreur:', err.message);
    res.status(500).json({
        success: false,
        error: 'Erreur serveur interne',
        mode: 'fallback'
    });
});

// Démarrage du serveur
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur fallback démarré sur le port ${PORT}`);
    console.log(`📊 Environnement: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 URL: http://0.0.0.0:${PORT}`);
});