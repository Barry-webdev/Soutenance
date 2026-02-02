// services/cloudinaryService.js
import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

// Configuration globale de Cloudinary au chargement du module
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log('🔧 Initialisation Cloudinary:', {
    cloudName: cloudName ? '✅ Configuré' : '❌ Manquant',
    apiKey: apiKey ? '✅ Configuré' : '❌ Manquant',
    apiSecret: apiSecret ? '✅ Configuré' : '❌ Manquant'
});

if (!cloudName || !apiKey || !apiSecret) {
    console.error('❌ Configuration Cloudinary manquante');
    throw new Error('Configuration Cloudinary manquante. Vérifiez les variables CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET');
}

// Configuration explicite de Cloudinary
cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true // Forcer HTTPS
});

console.log('✅ Cloudinary configuré globalement pour:', cloudName);

class CloudinaryService {

    // Formats d'images supportés
    static SUPPORTED_FORMATS = ['jpeg', 'jpg', 'png', 'webp'];
    static MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
    static MAX_DIMENSIONS = {
        original: { width: 8000, height: 8000 },
        medium: { width: 1200, height: 900 },
        thumbnail: { width: 400, height: 300 }
    };

    /**
     * Valider le format et la taille de l'image
     */
    static validateImage(buffer, filename) {
        const errors = [];
        
        // Vérifier la taille du fichier
        if (buffer.length > this.MAX_FILE_SIZE) {
            errors.push(`L'image ne peut pas dépasser ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`);
        }

        // Vérifier l'extension
        const ext = filename.split('.').pop().toLowerCase();
        if (!this.SUPPORTED_FORMATS.includes(ext)) {
            errors.push(`Format non supporté. Formats acceptés: ${this.SUPPORTED_FORMATS.join(', ')}`);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Obtenir les métadonnées de l'image
     */
    static async getImageMetadata(buffer) {
        try {
            const metadata = await sharp(buffer).metadata();
            return {
                width: metadata.width,
                height: metadata.height,
                format: metadata.format,
                size: buffer.length,
                hasAlpha: metadata.hasAlpha
            };
        } catch (error) {
            throw new Error('Impossible de lire les métadonnées de l\'image');
        }
    }

    /**
     * Redimensionner l'image selon les spécifications
     */
    static async resizeImage(buffer, targetSize, quality = 80) {
        try {
            const { width, height } = targetSize;
            
            return await sharp(buffer)
                .resize(width, height, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({ quality })
                .toBuffer();
        } catch (error) {
            throw new Error(`Erreur lors du redimensionnement: ${error.message}`);
        }
    }

    /**
     * Upload une image vers Cloudinary (optimisé pour la vitesse)
     */
    static async uploadToCloudinary(buffer, publicId, folder = 'waste-reports') {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    public_id: publicId,
                    folder: folder,
                    resource_type: 'image',
                    format: 'jpg',
                    quality: 'auto:low', // Qualité optimisée pour la vitesse
                    fetch_format: 'auto',
                    flags: 'progressive' // Chargement progressif
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            ).end(buffer);
        });
    }

    /**
     * Traiter une image et créer toutes les tailles sur Cloudinary (optimisé)
     */
    static async processImage(imageBuffer, originalFilename) {
        try {
            // Validation rapide
            const validation = this.validateImage(imageBuffer, originalFilename);
            if (!validation.isValid) {
                throw new Error(validation.errors.join(', '));
            }

            // Générer un identifiant unique
            const uniqueId = uuidv4();
            const basePublicId = `${uniqueId}_${Date.now()}`;

            // OPTIMISATION: Traitement parallèle des 3 tailles
            const [originalBuffer, mediumBuffer, thumbnailBuffer] = await Promise.all([
                this.resizeImage(imageBuffer, this.MAX_DIMENSIONS.original, 85), // Qualité réduite
                this.resizeImage(imageBuffer, this.MAX_DIMENSIONS.medium, 80),
                this.resizeImage(imageBuffer, this.MAX_DIMENSIONS.thumbnail, 70)
            ]);

            // OPTIMISATION: Upload parallèle vers Cloudinary
            const [originalUpload, mediumUpload, thumbnailUpload] = await Promise.all([
                this.uploadToCloudinary(originalBuffer, `${basePublicId}_original`),
                this.uploadToCloudinary(mediumBuffer, `${basePublicId}_medium`),
                this.uploadToCloudinary(thumbnailBuffer, `${basePublicId}_thumbnail`)
            ]);

            return {
                original: {
                    url: originalUpload.secure_url,
                    publicId: originalUpload.public_id,
                    size: originalBuffer.length,
                    dimensions: {
                        width: originalUpload.width,
                        height: originalUpload.height
                    },
                    mimeType: 'image/jpeg'
                },
                medium: {
                    url: mediumUpload.secure_url,
                    publicId: mediumUpload.public_id,
                    size: mediumBuffer.length,
                    dimensions: {
                        width: mediumUpload.width,
                        height: mediumUpload.height
                    }
                },
                thumbnail: {
                    url: thumbnailUpload.secure_url,
                    publicId: thumbnailUpload.public_id,
                    size: thumbnailBuffer.length,
                    dimensions: {
                        width: thumbnailUpload.width,
                        height: thumbnailUpload.height
                    }
                }
            };

        } catch (error) {
            throw new Error(`Erreur lors du traitement de l'image: ${error.message}`);
        }
    }

    /**
     * Supprimer les images de Cloudinary
     */
    static async deleteImages(images) {
        try {
            const publicIds = [];
            if (images.original?.publicId) publicIds.push(images.original.publicId);
            if (images.medium?.publicId) publicIds.push(images.medium.publicId);
            if (images.thumbnail?.publicId) publicIds.push(images.thumbnail.publicId);

            if (publicIds.length > 0) {
                await cloudinary.api.delete_resources(publicIds);
            }
        } catch (error) {
            console.error('Erreur lors de la suppression des images:', error);
        }
    }

    /**
     * Obtenir l'URL optimale selon le contexte
     */
    static getOptimalImageUrl(images, context = 'medium') {
        if (!images) return null;

        switch (context) {
            case 'thumbnail':
                return images.thumbnail?.url || images.medium?.url || images.original?.url;
            case 'medium':
                return images.medium?.url || images.original?.url;
            case 'original':
                return images.original?.url;
            default:
                return images.medium?.url || images.original?.url;
        }
    }

    /**
     * Upload un fichier audio vers Cloudinary
     */
    static async uploadAudioToCloudinary(buffer, publicId, folder = 'waste-reports-audio') {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    public_id: publicId,
                    folder: folder,
                    resource_type: 'video', // Cloudinary utilise 'video' pour l'audio
                    format: 'mp3', // Convertir en MP3 pour compatibilité
                    quality: 'auto'
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            ).end(buffer);
        });
    }

    /**
     * Traiter un fichier audio et l'uploader sur Cloudinary
     */
    static async processAudio(audioBuffer, originalFilename, duration) {
        try {
            console.log('🎵 Traitement audio:', originalFilename, 'durée:', duration + 's');

            // Validation de base
            if (audioBuffer.length > 5 * 1024 * 1024) { // 5MB max
                throw new Error('Le fichier audio ne peut pas dépasser 5MB');
            }

            if (duration > 60) {
                throw new Error('L\'enregistrement ne peut pas dépasser 60 secondes');
            }

            // Générer un identifiant unique
            const uniqueId = uuidv4();
            const publicId = `audio_${uniqueId}_${Date.now()}`;

            // Upload vers Cloudinary
            const uploadResult = await this.uploadAudioToCloudinary(
                audioBuffer, 
                publicId
            );

            console.log('✅ Audio uploadé sur Cloudinary:', uploadResult.secure_url);

            return {
                url: uploadResult.secure_url,
                publicId: uploadResult.public_id,
                duration: duration,
                size: audioBuffer.length,
                mimeType: 'audio/mp3' // Cloudinary convertit en MP3
            };

        } catch (error) {
            console.error('❌ Erreur traitement audio:', error);
            throw new Error(`Erreur lors du traitement de l'audio: ${error.message}`);
        }
    }

    /**
     * Supprimer un fichier audio de Cloudinary
     */
    static async deleteAudio(publicId) {
        try {
            if (publicId) {
                await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
                console.log('🗑️ Audio supprimé de Cloudinary:', publicId);
            }
        } catch (error) {
            console.error('❌ Erreur suppression audio:', error);
        }
    }
}

export default CloudinaryService;