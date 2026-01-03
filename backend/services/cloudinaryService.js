// services/cloudinaryService.js
import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

class CloudinaryService {
    constructor() {
        // Configuration Cloudinary avec fallback
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'demo';
        const apiKey = process.env.CLOUDINARY_API_KEY || 'demo';
        const apiSecret = process.env.CLOUDINARY_API_SECRET || 'demo';
        
        // Utiliser un compte Cloudinary de démonstration si pas configuré
        if (cloudName === 'demo' || cloudName === 'votre_cloud_name') {
            console.log('⚠️ Cloudinary non configuré, utilisation du compte de démonstration');
            cloudinary.config({
                cloud_name: 'demo',
                api_key: '123456789012345',
                api_secret: 'abcdefghijklmnopqrstuvwxyz123456'
            });
        } else {
            cloudinary.config({
                cloud_name: cloudName,
                api_key: apiKey,
                api_secret: apiSecret
            });
        }
    }

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
     * Upload une image vers Cloudinary
     */
    static async uploadToCloudinary(buffer, publicId, folder = 'waste-reports') {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    public_id: publicId,
                    folder: folder,
                    resource_type: 'image',
                    format: 'jpg',
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
     * Traiter une image et créer toutes les tailles sur Cloudinary
     */
    static async processImage(imageBuffer, originalFilename) {
        try {
            // Validation
            const validation = this.validateImage(imageBuffer, originalFilename);
            if (!validation.isValid) {
                throw new Error(validation.errors.join(', '));
            }

            // Métadonnées originales
            const metadata = await this.getImageMetadata(imageBuffer);
            
            // Vérifier les dimensions maximales
            if (metadata.width > this.MAX_DIMENSIONS.original.width || 
                metadata.height > this.MAX_DIMENSIONS.original.height) {
                throw new Error(`L'image est trop grande. Maximum: ${this.MAX_DIMENSIONS.original.width}x${this.MAX_DIMENSIONS.original.height}`);
            }

            // Générer un identifiant unique
            const uniqueId = uuidv4();
            const basePublicId = `${uniqueId}_${Date.now()}`;

            const results = {
                original: null,
                medium: null,
                thumbnail: null
            };

            // Image originale (redimensionnée si nécessaire)
            const originalBuffer = await this.resizeImage(
                imageBuffer, 
                this.MAX_DIMENSIONS.original,
                90
            );
            
            const originalUpload = await this.uploadToCloudinary(
                originalBuffer, 
                `${basePublicId}_original`
            );

            results.original = {
                url: originalUpload.secure_url,
                publicId: originalUpload.public_id,
                size: originalBuffer.length,
                dimensions: {
                    width: originalUpload.width,
                    height: originalUpload.height
                },
                mimeType: 'image/jpeg'
            };

            // Image medium
            const mediumBuffer = await this.resizeImage(
                imageBuffer,
                this.MAX_DIMENSIONS.medium,
                80
            );
            
            const mediumUpload = await this.uploadToCloudinary(
                mediumBuffer, 
                `${basePublicId}_medium`
            );

            results.medium = {
                url: mediumUpload.secure_url,
                publicId: mediumUpload.public_id,
                size: mediumBuffer.length,
                dimensions: {
                    width: mediumUpload.width,
                    height: mediumUpload.height
                }
            };

            // Thumbnail
            const thumbnailBuffer = await this.resizeImage(
                imageBuffer,
                this.MAX_DIMENSIONS.thumbnail,
                70
            );
            
            const thumbnailUpload = await this.uploadToCloudinary(
                thumbnailBuffer, 
                `${basePublicId}_thumbnail`
            );

            results.thumbnail = {
                url: thumbnailUpload.secure_url,
                publicId: thumbnailUpload.public_id,
                size: thumbnailBuffer.length,
                dimensions: {
                    width: thumbnailUpload.width,
                    height: thumbnailUpload.height
                }
            };

            return results;

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
}

export default CloudinaryService;