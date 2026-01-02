// services/imageService.js
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

class ImageService {
    // Formats d'images supportés
    static SUPPORTED_FORMATS = ['jpeg', 'jpg', 'png', 'webp'];
    static MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    static MAX_DIMENSIONS = {
        original: { width: 4000, height: 4000 },
        medium: { width: 800, height: 600 },
        thumbnail: { width: 300, height: 200 }
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
        const ext = path.extname(filename).toLowerCase().slice(1);
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
     * Traiter une image et créer toutes les tailles
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

            // Générer un nom unique
            const uniqueId = uuidv4();
            const baseFilename = `${uniqueId}_${Date.now()}`;

            // Créer le dossier de stockage s'il n'existe pas
            const uploadDir = path.join(process.cwd(), 'uploads', 'waste-reports');
            await fs.mkdir(uploadDir, { recursive: true });

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
            const originalProcessedFilename = `${baseFilename}_original.jpg`;
            const originalPath = path.join(uploadDir, originalProcessedFilename);
            await fs.writeFile(originalPath, originalBuffer);

            results.original = {
                url: `/uploads/waste-reports/${originalProcessedFilename}`,
                filename: originalProcessedFilename,
                size: originalBuffer.length,
                dimensions: {
                    width: (await sharp(originalBuffer).metadata()).width,
                    height: (await sharp(originalBuffer).metadata()).height
                },
                mimeType: 'image/jpeg'
            };

            // Image medium
            const mediumBuffer = await this.resizeImage(
                imageBuffer,
                this.MAX_DIMENSIONS.medium,
                80
            );
            const mediumFilename = `${baseFilename}_medium.jpg`;
            const mediumPath = path.join(uploadDir, mediumFilename);
            await fs.writeFile(mediumPath, mediumBuffer);

            results.medium = {
                url: `/uploads/waste-reports/${mediumFilename}`,
                filename: mediumFilename,
                size: mediumBuffer.length,
                dimensions: {
                    width: (await sharp(mediumBuffer).metadata()).width,
                    height: (await sharp(mediumBuffer).metadata()).height
                }
            };

            // Thumbnail
            const thumbnailBuffer = await this.resizeImage(
                imageBuffer,
                this.MAX_DIMENSIONS.thumbnail,
                70
            );
            const thumbnailFilename = `${baseFilename}_thumbnail.jpg`;
            const thumbnailPath = path.join(uploadDir, thumbnailFilename);
            await fs.writeFile(thumbnailPath, thumbnailBuffer);

            results.thumbnail = {
                url: `/uploads/waste-reports/${thumbnailFilename}`,
                filename: thumbnailFilename,
                size: thumbnailBuffer.length,
                dimensions: {
                    width: (await sharp(thumbnailBuffer).metadata()).width,
                    height: (await sharp(thumbnailBuffer).metadata()).height
                }
            };

            return results;

        } catch (error) {
            throw new Error(`Erreur lors du traitement de l'image: ${error.message}`);
        }
    }

    /**
     * Supprimer les fichiers d'images
     */
    static async deleteImages(images) {
        try {
            const uploadDir = path.join(process.cwd(), 'uploads', 'waste-reports');
            
            const filesToDelete = [];
            if (images.original?.filename) filesToDelete.push(path.join(uploadDir, images.original.filename));
            if (images.medium?.filename) filesToDelete.push(path.join(uploadDir, images.medium.filename));
            if (images.thumbnail?.filename) filesToDelete.push(path.join(uploadDir, images.thumbnail.filename));

            for (const filePath of filesToDelete) {
                try {
                    await fs.unlink(filePath);
                } catch (error) {
                    console.warn(`Impossible de supprimer le fichier ${filePath}:`, error.message);
                }
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

export default ImageService;


