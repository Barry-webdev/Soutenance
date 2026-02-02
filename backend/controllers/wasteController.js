import WasteReport from '../models/wasteReportModel.js';
import User from '../models/userModel.js';
import { logManualAudit } from '../middlewares/auditMiddleware.js';
import HybridImageService from '../services/hybridImageService.js';
import NotificationService from '../services/notification.js';
import GamificationService from '../services/gamificationService.js';
import GeographicValidationService from '../services/geographicValidationService.js';

/**
 * Créer un signalement de déchet
 */
export const createWasteReport = async (req, res) => {
    try {
        const { description, location, wasteType } = req.body;

        // 🌍 VALIDATION GÉOGRAPHIQUE : Vérifier que le signalement est dans la préfecture de Pita
        if (!location || !location.lat || !location.lng) {
            return res.status(400).json({
                success: false,
                error: 'Localisation requise',
                details: 'Les coordonnées GPS (latitude et longitude) sont obligatoires'
            });
        }

        const geoValidation = GeographicValidationService.validateLocation(
            location.lat, 
            location.lng
        );

        if (!geoValidation.isValid) {
            // Audit pour signalement hors zone (silencieux pour l'utilisateur)
            await logManualAudit(
                'WASTE_REPORT_REJECTED_LOCATION',
                req.user,
                `Signalement rejeté - hors préfecture de Pita`,
                { 
                    providedLocation: location,
                    error: geoValidation.error,
                    details: geoValidation.details
                }
            );

            return res.status(400).json({
                success: false,
                error: geoValidation.error,
                details: geoValidation.details
            });
        }

        // OPTIMISATION BACKEND: Traitement parallèle image + audio
        const processingPromises = [];
        
        // Traiter l'image en parallèle
        if (req.files?.image?.[0]) {
            const imageFile = req.files.image[0];
            processingPromises.push(
                HybridImageService.processImage(imageFile.buffer, imageFile.originalname)
                    .then(result => ({ type: 'image', data: result }))
                    .catch(error => ({ type: 'image', error: error.message }))
            );
        }

        // Traiter l'audio en parallèle
        if (req.files?.audio?.[0]) {
            const audioFile = req.files.audio[0];
            const audioDuration = parseInt(req.body.audioDuration) || 0;
            processingPromises.push(
                HybridImageService.processAudio(audioFile.buffer, audioFile.originalname, audioDuration)
                    .then(result => ({ type: 'audio', data: result }))
                    .catch(error => ({ type: 'audio', error: error.message }))
            );
        }

        // Attendre tous les traitements en parallèle
        const results = await Promise.all(processingPromises);
        
        let images = null;
        let audio = null;
        
        // Traiter les résultats
        for (const result of results) {
            if (result.error) {
                return res.status(400).json({
                    success: false,
                    error: `Erreur lors du traitement ${result.type}: ${result.error}`
                });
            }
            
            if (result.type === 'image') {
                images = result.data;
            } else if (result.type === 'audio') {
                audio = result.data;
            }
        }

        // Créer le signalement immédiatement
        const wasteReport = await WasteReport.create({
            userId: req.user._id,
            description,
            images,
            audio,
            location,
            wasteType
        });

        // OPTIMISATION: Réponse immédiate, opérations en arrière-plan
        res.status(201).json({
            success: true,
            message: 'Signalement créé avec succès !',
            data: wasteReport
        });

        // Opérations asynchrones NON-BLOQUANTES (en arrière-plan)
        setImmediate(async () => {
            try {
                await Promise.allSettled([
                    // Ajouter des points à l'utilisateur
                    User.findByIdAndUpdate(req.user._id, {
                        $inc: { points: 10 }
                    }),

                    // Notifications aux admins (en arrière-plan)
                    NotificationService.notifyAdminsNewWasteReport(wasteReport),

                    // Gamification (en arrière-plan)
                    GamificationService.checkAndAwardBadges(req.user._id),

                    // Audit (en arrière-plan)
                    logManualAudit(
                        'WASTE_REPORT_CREATE',
                        req.user,
                        `Nouveau signalement créé`,
                        { reportId: wasteReport._id, wasteType }
                    )
                ]);
            } catch (bgError) {
                console.error('❌ Erreur opérations arrière-plan:', bgError);
            }
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            
            // Audit pour données de signalement invalides
            await logManualAudit(
                'WASTE_REPORT_INVALID',
                req.user,
                `Tentative de création de signalement avec données invalides`,
                { errors, wasteType: req.body.wasteType }
            );
            
            return res.status(400).json({ 
                success: false,
                error: 'Données invalides', 
                details: errors 
            });
        }
        
        console.error('❌ Erreur création signalement:', error);
        
        // Audit pour erreur création signalement
        await logManualAudit(
            'SYSTEM_ERROR',
            req.user,
            `Erreur lors de la création du signalement: ${error.message}`,
            { error: error.message, endpoint: '/waste' }
        );
        
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur lors de la création du signalement' 
        });
    }
};

/**
 * Récupérer tous les signalements (avec pagination)
 */
export const getWasteReports = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const wasteReports = await WasteReport.find()
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await WasteReport.countDocuments();

        // Audit pour consultation de tous les signalements
        await logManualAudit(
            'WASTE_REPORTS_VIEW_ALL',
            req.user,
            `Consultation de tous les signalements`,
            { 
                page: page,
                limit: limit,
                total: total 
            }
        );

        res.json({
            success: true,
            data: {
                wasteReports,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        console.error('❌ Erreur récupération signalements:', error);
        
        // Audit pour erreur récupération signalements
        await logManualAudit(
            'SYSTEM_ERROR',
            req.user,
            `Erreur lors de la récupération des signalements: ${error.message}`,
            { error: error.message, endpoint: '/waste' }
        );
        
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur' 
        });
    }
};

/**
 * Récupérer les signalements d'un utilisateur
 */
export const getUserWasteReports = async (req, res) => {
    try {
        const wasteReports = await WasteReport.find({ userId: req.user._id })
            .sort({ createdAt: -1 });

        // Audit pour consultation des signalements personnels
        await logManualAudit(
            'WASTE_REPORTS_VIEW_MY',
            req.user,
            `Consultation des signalements personnels`,
            { count: wasteReports.length }
        );

        res.json({
            success: true,
            data: wasteReports
        });
    } catch (error) {
        console.error('❌ Erreur récupération signalements utilisateur:', error);
        
        // Audit pour erreur récupération signalements personnels
        await logManualAudit(
            'SYSTEM_ERROR',
            req.user,
            `Erreur lors de la récupération des signalements personnels: ${error.message}`,
            { error: error.message, endpoint: '/waste/my-reports' }
        );
        
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur' 
        });
    }
};

/**
 * Mettre à jour le statut d'un signalement (Admin seulement)
 */
export const updateWasteReportStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['pending', 'collected', 'not_collected'].includes(status)) {
            // Audit pour statut invalide
            await logManualAudit(
                'WASTE_REPORT_STATUS_INVALID',
                req.user,
                `Tentative de mise à jour avec statut invalide: ${status}`,
                { reportId: req.params.id, attemptedStatus: status }
            );
            
            return res.status(400).json({ 
                success: false,
                error: 'Statut invalide' 
            });
        }

        // Récupérer le signalement avant modification pour l'audit et les notifications
        const reportBeforeUpdate = await WasteReport.findById(req.params.id);

        const wasteReport = await WasteReport.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        ).populate('userId', 'name email');

        if (!wasteReport) {
            // Audit pour signalement non trouvé
            await logManualAudit(
                'WASTE_REPORT_NOT_FOUND',
                req.user,
                `Tentative de mise à jour d'un signalement non trouvé`,
                { reportId: req.params.id }
            );
            
            return res.status(404).json({ 
                success: false,
                error: 'Signalement non trouvé' 
            });
        }

        // 🔔 NOTIFICATION: Changement de statut à l'utilisateur
        if (reportBeforeUpdate.status !== status) {
            await NotificationService.notifyUserWasteReportStatus(
                wasteReport, 
                reportBeforeUpdate.status, 
                status
            );
        }

        // Audit pour mise à jour du statut
        await logManualAudit(
            'WASTE_REPORT_STATUS_UPDATE',
            req.user,
            `Statut de signalement mis à jour: ${reportBeforeUpdate.description?.substring(0, 50)}...`,
            { 
                reportId: wasteReport._id,
                oldStatus: reportBeforeUpdate.status,
                newStatus: status,
                userId: wasteReport.userId?._id 
            }
        );

        res.json({
            success: true,
            message: `Statut mis à jour: ${status}`,
            data: wasteReport
        });
    } catch (error) {
        console.error('❌ Erreur mise à jour statut:', error);
        
        // Audit pour erreur mise à jour statut
        await logManualAudit(
            'SYSTEM_ERROR',
            req.user,
            `Erreur lors de la mise à jour du statut de signalement: ${error.message}`,
            { 
                error: error.message, 
                reportId: req.params.id,
                endpoint: `/waste/${req.params.id}/status` 
            }
        );
        
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur' 
        });
    }
};

/**
 * Supprimer un signalement de déchet (Admin seulement)
 */
export const deleteWasteReport = async (req, res) => {
    try {
        const wasteReport = await WasteReport.findById(req.params.id);

        if (!wasteReport) {
            return res.status(404).json({ 
                success: false,
                error: 'Signalement non trouvé' 
            });
        }

        // Supprimer les images associées
        if (wasteReport.images) {
            await HybridImageService.deleteImages(wasteReport.images);
        }

        // 🔔 NOTIFICATION: Notification à l'utilisateur si son signalement est supprimé
        if (wasteReport.userId.toString() !== req.user._id.toString()) {
            await NotificationService.notifyUserWasteReportDeleted(
                wasteReport.userId,
                wasteReport
            );
        }

        await WasteReport.findByIdAndDelete(req.params.id);

        // Audit pour suppression
        await logManualAudit(
            'WASTE_REPORT_DELETE',
            req.user,
            `Signalement supprimé: ${wasteReport.description?.substring(0, 50)}...`,
            { 
                reportId: wasteReport._id,
                userId: wasteReport.userId 
            }
        );

        res.json({
            success: true,
            message: 'Signalement supprimé avec succès'
        });
    } catch (error) {
        console.error('❌ Erreur suppression signalement:', error);
        await logManualAudit(
            'SYSTEM_ERROR',
            req.user,
            `Erreur lors de la suppression: ${error.message}`,
            { error: error.message, reportId: req.params.id }
        );
        res.status(500).json({ 
            success: false, 
            error: 'Erreur serveur lors de la suppression' 
        });
    }
};

/**
 * Récupérer les signalements pour la carte (avec localisation)
 */
export const getWasteReportsMap = async (req, res) => {
    try {
        const wasteReports = await WasteReport.find({ status: { $ne: 'collected' } })
            .populate('userId', 'name')
            .select('description location wasteType status createdAt images')
            .sort({ createdAt: -1 });

        // Audit pour consultation de la carte
        await logManualAudit(
            'WASTE_REPORTS_MAP_VIEW',
            req.user,
            `Consultation de la carte des signalements`,
            { count: wasteReports.length }
        );

        res.json({
            success: true,
            data: wasteReports
        });
    } catch (error) {
        console.error('❌ Erreur récupération signalements carte:', error);
        
        // Audit pour erreur récupération carte
        await logManualAudit(
            'SYSTEM_ERROR',
            req.user,
            `Erreur lors de la récupération des signalements pour la carte: ${error.message}`,
            { error: error.message, endpoint: '/waste/map' }
        );
        
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur' 
        });
    }
};

/**
 * Obtenir des informations sur la zone géographique couverte
 */
export const getZoneInfo = async (req, res) => {
    try {
        const zoneInfo = GeographicValidationService.getZoneInfo();
        
        res.json({
            success: true,
            data: zoneInfo
        });
    } catch (error) {
        console.error('❌ Erreur récupération info zone:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur' 
        });
    }
};