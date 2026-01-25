// middlewares/uploadMiddleware.js
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration de multer pour l'upload d'images et audio
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Vérifier le type MIME pour images et audio
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/')) {
        cb(null, true);
    } else {
        cb(new Error('Seules les images et fichiers audio sont autorisés'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 15 * 1024 * 1024, // 15MB max
        files: 2 // Une image + un audio maximum
    }
});

// Middleware pour upload d'image et audio
export const uploadImageAndAudio = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'audio', maxCount: 1 }
]);

// Middleware pour upload d'image unique (rétrocompatibilité)
export const uploadSingleImage = upload.single('image');

// Middleware pour valider l'upload d'image et audio
export const validateUploads = (req, res, next) => {
    const imageFile = req.files?.image?.[0];
    const audioFile = req.files?.audio?.[0];

    // Validation image (obligatoire)
    if (!imageFile) {
        return res.status(400).json({
            success: false,
            error: 'Une photo du déchet est obligatoire'
        });
    }

    if (imageFile.size > 15 * 1024 * 1024) {
        return res.status(400).json({
            success: false,
            error: 'L\'image est trop volumineuse (max 15MB)'
        });
    }

    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedImageTypes.includes(imageFile.mimetype)) {
        return res.status(400).json({
            success: false,
            error: 'Format d\'image non supporté. Formats acceptés: JPEG, PNG, WebP'
        });
    }

    // Validation audio (si présent)
    if (audioFile) {
        if (audioFile.size > 5 * 1024 * 1024) { // 5MB max pour audio
            return res.status(400).json({
                success: false,
                error: 'Le fichier audio est trop volumineux (max 5MB)'
            });
        }

        const allowedAudioTypes = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg'];
        if (!allowedAudioTypes.includes(audioFile.mimetype)) {
            return res.status(400).json({
                success: false,
                error: 'Format audio non supporté. Formats acceptés: WebM, MP4, MP3, WAV, OGG'
            });
        }
    }

    // Au moins une description OU un audio requis
    if (!req.body.description && !audioFile) {
        return res.status(400).json({
            success: false,
            error: 'Une description écrite ou un enregistrement vocal est requis'
        });
    }

    next();
};

// Middleware pour valider l'upload d'image seule (rétrocompatibilité)
export const validateImageUpload = (req, res, next) => {
    // Si aucune image n'est fournie, c'est OK
    if (!req.file) {
        return next();
    }

    // Vérifier la taille
    if (req.file.size > 15 * 1024 * 1024) {
        return res.status(400).json({
            success: false,
            error: 'L\'image est trop volumineuse (max 15MB)'
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
                error: 'Le fichier est trop volumineux (max 15MB)'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                error: 'Trop de fichiers. Maximum 1 image et 1 audio par signalement'
            });
        }
    }
    
    if (error.message === 'Seules les images et fichiers audio sont autorisés') {
        return res.status(400).json({
            success: false,
            error: 'Format de fichier non autorisé. Seules les images et fichiers audio sont acceptés'
        });
    }

    next(error);
};


