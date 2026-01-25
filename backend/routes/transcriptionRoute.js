// routes/transcriptionRoute.js
import express from 'express';
import WasteReport from '../models/wasteReportModel.js';
import TranscriptionService from '../services/transcriptionService.js';
import { authenticate, requireAdmin } from '../middlewares/authMiddleware.js';
import { logManualAudit } from '../middlewares/auditMiddleware.js';

const router = express.Router();

/**
 * Transcrire l'audio d'un signalement (Admin seulement)
 */
router.post('/:reportId/transcribe', authenticate, requireAdmin, async (req, res) => {
    try {
        const { reportId } = req.params;
        const { language = 'fr' } = req.body;

        // Vérifier si OpenAI est configuré
        if (!TranscriptionService.isConfigured()) {
            return res.status(503).json({
                success: false,
                error: 'Service de transcription non configuré. Clé API OpenAI manquante.'
            });
        }

        // Récupérer le signalement
        const wasteReport = await WasteReport.findById(reportId).populate('userId', 'name email');
        
        if (!wasteReport) {
            return res.status(404).json({
                success: false,
                error: 'Signalement non trouvé'
            });
        }

        // Vérifier qu'il y a un audio
        if (!wasteReport.audio?.url) {
            return res.status(400).json({
                success: false,
                error: 'Aucun enregistrement audio trouvé pour ce signalement'
            });
        }

        // Vérifier si déjà transcrit
        if (wasteReport.audio.transcription) {
            return res.status(400).json({
                success: false,
                error: 'Ce signalement a déjà été transcrit',
                data: {
                    transcription: wasteReport.audio.transcription,
                    language: wasteReport.audio.language,
                    transcribedAt: wasteReport.audio.transcribedAt,
                    transcribedBy: wasteReport.audio.transcribedBy
                }
            });
        }

        console.log('🎵 Début transcription pour signalement:', reportId);

        // Créer le service de transcription
        const transcriptionService = new TranscriptionService();

        // Transcrire l'audio
        const result = await transcriptionService.transcribeAudio(
            wasteReport.audio.url, 
            language
        );

        // Mettre à jour le signalement avec la transcription
        wasteReport.audio.transcription = result.text;
        wasteReport.audio.language = result.detectedLanguage;
        wasteReport.audio.transcribedAt = new Date();
        wasteReport.audio.transcribedBy = req.user._id;

        await wasteReport.save();

        // Audit pour transcription
        await logManualAudit(
            'AUDIO_TRANSCRIPTION',
            req.user,
            `Transcription audio réalisée pour le signalement: ${wasteReport.description?.substring(0, 50) || 'Audio uniquement'}...`,
            { 
                reportId: wasteReport._id,
                transcriptionLength: result.text.length,
                detectedLanguage: result.detectedLanguage,
                userId: wasteReport.userId._id
            }
        );

        console.log('✅ Transcription terminée et sauvegardée');

        res.json({
            success: true,
            message: 'Transcription réalisée avec succès',
            data: {
                reportId: wasteReport._id,
                transcription: result.text,
                detectedLanguage: result.detectedLanguage,
                transcribedAt: wasteReport.audio.transcribedAt,
                transcribedBy: req.user.name
            }
        });

    } catch (error) {
        console.error('❌ Erreur transcription:', error);
        
        // Audit pour erreur transcription
        await logManualAudit(
            'SYSTEM_ERROR',
            req.user,
            `Erreur lors de la transcription: ${error.message}`,
            { 
                error: error.message, 
                reportId: req.params.reportId,
                endpoint: `/transcription/${req.params.reportId}/transcribe`
            }
        );
        
        res.status(500).json({ 
            success: false,
            error: 'Erreur lors de la transcription: ' + error.message
        });
    }
});

/**
 * Obtenir les langues supportées
 */
router.get('/languages', authenticate, requireAdmin, (req, res) => {
    res.json({
        success: true,
        data: TranscriptionService.getSupportedLanguages()
    });
});

/**
 * Vérifier la configuration du service
 */
router.get('/status', authenticate, requireAdmin, (req, res) => {
    res.json({
        success: true,
        data: {
            configured: TranscriptionService.isConfigured(),
            supportedLanguages: TranscriptionService.getSupportedLanguages().length
        }
    });
});

export default router;