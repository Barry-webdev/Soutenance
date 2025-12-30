// middlewares/uploadMiddleware.js
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration de multer pour l'upload d'images
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Vérifier le type MIME
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Seules les images sont autorisées'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
        files: 1 // Une seule image par signalement
    }
});

// Middleware pour upload d'image unique
export const uploadSingleImage = upload.single('image');

// Middleware pour valider l'upload (optionnel)
export const validateImageUpload = (req, res, next) => {
    // Si aucune image n'est fournie, c'est OK
    if (!req.file) {
        return next();
    }

    // Vérifier la taille
    if (req.file.size > 10 * 1024 * 1024) {
        return res.status(400).json({
            success: false,
            error: 'L\'image est trop volumineuse (max 10MB)'
        });
    }

    // Vérifier le type MIME
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
            success: false,
            error: 'Format d\'image non supporté. Formats acceptés: JPEG, PNG, WebP'
        });
    }

    next();
};

// Middleware pour gérer les erreurs d'upload
export const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'L\'image est trop volumineuse (max 10MB)'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                error: 'Trop de fichiers. Maximum 1 image par signalement'
            });
        }
    }
    
    if (error.message === 'Seules les images sont autorisées') {
        return res.status(400).json({
            success: false,
            error: 'Format de fichier non autorisé. Seules les images sont acceptées'
        });
    }

    next(error);
};


