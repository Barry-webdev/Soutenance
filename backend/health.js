// Test simple pour vérifier que le serveur fonctionne
import express from 'express';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 4000;

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'EcoPulse Backend is running!',
        timestamp: new Date().toISOString(),
        port: PORT,
        env: process.env.NODE_ENV || 'development'
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Health server running on port ${PORT}`);
});