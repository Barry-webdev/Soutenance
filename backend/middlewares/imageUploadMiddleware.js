import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration du stockage temporaire
const storage = multer.memoryStorage();

// Configuration de multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
        files: 5 // Maximum 5 fichiers
    },
    fileFilter: (req, file, cb) => {
        // Vérifier le type de fichier
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Type de fichier non supporté. Utilisez JPEG, PNG ou WebP.'), false);
        }
    }
});

// Fonction pour créer les dossiers nécessaires
const ensureDirectoryExists = async (dirPath) => {
    try {
        await fs.access(dirPath);
    } catch (error) {
        await fs.mkdir(dirPath, { recursive: true });
    }
};

// Fonction pour traiter et sauvegarder les images
const processAndSaveImage = async (buffer, filename, sizes = {}) => {
    const uploadsDir = path.join(__dirname, '../uploads');
    const originalDir = path.join(uploadsDir, 'original');
    const thumbnailDir = path.join(uploadsDir, 'thumbnails');
    const mediumDir = path.join(uploadsDir, 'medium');

    // Créer les dossiers si nécessaire
    await ensureDirectoryExists(originalDir);
    await ensureDirectoryExists(thumbnailDir);
    await ensureDirectoryExists(mediumDir);

    const results = {};

    try {
        // Image originale (compressée)
        const originalPath = path.join(originalDir, filename);
        const originalBuffer = await sharp(buffer)
            .jpeg({ quality: 85, progressive: true })
            .toBuffer();
        
        await fs.writeFile(originalPath, originalBuffer);
        
        // Obtenir les métadonnées de l'image originale
        const originalMetadata = await sharp(buffer).metadata();
        
        results.original = {
            url: `/uploads/original/${filename}`,
            filename: filename,
            size: originalBuffer.length,
            dimensions: {
                width: originalMetadata.width,
                height: originalMetadata.height
            },
            mimeType: 'image/jpeg'
        };

        // Thumbnail (150x150)
        const thumbnailPath = path.join(thumbnailDir, filename);
        const thumbnailBuffer = await sharp(buffer)
            .resize(150, 150, { 
                fit: 'cover',
                position: 'center'
            })
            .jpeg({ quality: 80 })
            .toBuffer();
        
        await fs.writeFile(thumbnailPath, thumbnailBuffer);
        
        results.thumbnail = {
            url: `/uploads/thumbnails/${filename}`,
            filename: filename,
            size: thumbnailBuffer.length,
            dimensions: { width: 150, height: 150 }
        };

        // Medium (800px max width)
        const mediumPath = path.join(mediumDir, filename);
        const mediumBuffer = await sharp(buffer)
            .resize(800, null, { 
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality: 85 })
            .toBuffer();
        
        await fs.writeFile(mediumPath, mediumBuffer);
        
        const mediumMetadata = await sharp(mediumBuffer).metadata();
        
        results.medium = {
            url: `/uploads/medium/${filename}`,
            filename: filename,
            size: mediumBuffer.length,
            dimensions: {
                width: mediumMetadata.width,
                height: mediumMetadata.height
            }
        };

        return results;
    } catch (error) {
        console.error('❌ Erreur lors du traitement de l\'image:', error);
        throw new Error('Erreur lors du traitement de l\'image');
    }
};

// Middleware pour traiter les images uploadées
const processImages = async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        return next();
    }

    try {
        const processedImages = [];
        
        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(2, 15);
            const filename = `${timestamp}_${randomString}.jpg`;
            
            const processedImage = await processAndSaveImage(file.buffer, filename);
            processedImages.push(processedImage);
        }
        
        req.processedImages = processedImages;
        next();
    } catch (error) {
        console.error('❌ Erreur lors du traitement des images:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors du traitement des images'
        });
    }
};

// Fonction pour supprimer les images
const deleteImages = async (images) => {
    if (!images || !images.original) return;

    const uploadsDir = path.join(__dirname, '../uploads');
    
    try {
        // Supprimer l'image originale
        if (images.original.filename) {
            const originalPath = path.join(uploadsDir, 'original', images.original.filename);
            await fs.unlink(originalPath).catch(() => {});
        }
        
        // Supprimer le thumbnail
        if (images.thumbnail && images.thumbnail.filename) {
            const thumbnailPath = path.join(uploadsDir, 'thumbnails', images.thumbnail.filename);
            await fs.unlink(thumbnailPath).catch(() => {});
        }
        
        // Supprimer l'image medium
        if (images.medium && images.medium.filename) {
            const mediumPath = path.join(uploadsDir, 'medium', images.medium.filename);
            await fs.unlink(mediumPath).catch(() => {});
        }
    } catch (error) {
        console.error('❌ Erreur lors de la suppression des images:', error);
    }
};

export { upload, processImages, deleteImages };