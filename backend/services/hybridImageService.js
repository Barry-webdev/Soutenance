// Service d'images hybride - Cloudinary en production, local en développement
import CloudinaryService from './cloudinaryService.js';
import ImageService from './imageService.js';

class HybridImageService {
    
    /**
     * Détermine quel service utiliser
     */
    static shouldUseCloudinary() {
        // TOUJOURS utiliser Cloudinary (le projet est en production)
        return true;
    }

    /**
     * Traiter une image avec le service approprié
     */
    static async processImage(imageBuffer, originalFilename) {
        const useCloudinary = this.shouldUseCloudinary();
        
        console.log(`📸 Traitement image avec ${useCloudinary ? 'Cloudinary' : 'stockage local'}`);
        
        try {
            if (useCloudinary) {
                return await CloudinaryService.processImage(imageBuffer, originalFilename);
            } else {
                return await ImageService.processImage(imageBuffer, originalFilename);
            }
        } catch (error) {
            console.error(`❌ Erreur ${useCloudinary ? 'Cloudinary' : 'stockage local'}:`, error.message);
            
            // Fallback : si Cloudinary échoue, essayer le stockage local
            if (useCloudinary) {
                console.log('🔄 Fallback vers stockage local...');
                return await ImageService.processImage(imageBuffer, originalFilename);
            }
            
            throw error;
        }
    }

    /**
     * Supprimer les images avec le service approprié
     */
    static async deleteImages(images) {
        try {
            // Détecter le type d'images par l'URL
            if (images.original?.url?.includes('cloudinary.com')) {
                console.log('🗑️ Suppression images Cloudinary');
                await CloudinaryService.deleteImages(images);
            } else {
                console.log('🗑️ Suppression images locales');
                await ImageService.deleteImages(images);
            }
        } catch (error) {
            console.error('❌ Erreur suppression images:', error);
        }
    }

    /**
     * Supprimer un fichier audio
     */
    static async deleteAudio(audioData) {
        try {
            if (audioData?.url?.includes('cloudinary.com')) {
                console.log('🗑️ Suppression audio Cloudinary');
                await CloudinaryService.deleteAudio(audioData.publicId);
            } else {
                console.log('🗑️ Suppression audio local (non implémenté)');
                // Implémenter la suppression locale si nécessaire
            }
        } catch (error) {
            console.error('❌ Erreur suppression audio:', error);
        }
    }

    /**
     * Obtenir l'URL optimale
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
     * Traiter un fichier audio avec Cloudinary (production)
     */
    static async processAudio(audioBuffer, originalFilename, duration) {
        console.log(`🎵 Traitement audio avec Cloudinary (production)`);
        
        try {
            // Traiter avec Cloudinary (déjà configuré globalement)
            return await CloudinaryService.processAudio(audioBuffer, originalFilename, duration);
        } catch (error) {
            console.error(`❌ Erreur traitement audio Cloudinary:`, error.message);
            throw new Error(`Erreur lors du traitement de l'audio: ${error.message}`);
        }
    }

    /**
     * Supprimer un fichier audio
     */
    static async deleteAudio(audioData) {
        try {
            if (audioData?.url?.includes('cloudinary.com')) {
                console.log('🗑️ Suppression audio Cloudinary');
                await CloudinaryService.deleteAudio(audioData.publicId);
            } else {
                console.log('🗑️ Suppression audio local (non implémenté)');
                // Implémenter la suppression locale si nécessaire
            }
        } catch (error) {
            console.error('❌ Erreur suppression audio:', error);
        }
    }

    /**
     * Diagnostiquer la configuration
     */
    static getDiagnostics() {
        return {
            environment: process.env.NODE_ENV || 'development',
            useCloudinary: this.shouldUseCloudinary(),
            cloudinaryConfig: {
                cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'non configuré',
                hasApiKey: !!process.env.CLOUDINARY_API_KEY,
                hasApiSecret: !!process.env.CLOUDINARY_API_SECRET
            }
        };
    }
}

export default HybridImageService;