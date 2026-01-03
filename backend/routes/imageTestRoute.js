import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import HybridImageService from '../services/hybridImageService.js';

const router = express.Router();

// Route de test pour vérifier les images
router.get('/test-images', async (req, res) => {
    try {
        const uploadsDir = path.join(process.cwd(), 'uploads');
        
        // Diagnostics du service d'images
        const diagnostics = HybridImageService.getDiagnostics();
        
        // Vérifier si le dossier uploads existe
        let localFiles = [];
        try {
            await fs.access(uploadsDir);
            const files = await fs.readdir(uploadsDir, { recursive: true });
            localFiles = files.slice(0, 10); // Premiers 10 fichiers
        } catch (error) {
            console.log('❌ Dossier uploads n\'existe pas');
        }

        res.json({
            success: true,
            message: 'Diagnostic des images',
            diagnostics,
            localFiles: {
                count: localFiles.length,
                files: localFiles
            },
            recommendations: diagnostics.useCloudinary 
                ? ['✅ Cloudinary configuré et utilisé']
                : ['⚠️ Configurer Cloudinary pour la persistance des images']
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;