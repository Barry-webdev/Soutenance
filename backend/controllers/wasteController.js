import WasteReport from '../models/wasteReportModel.js';
import User from '../models/userModel.js';
import { logManualAudit } from '../middlewares/auditMiddleware.js';
import NotificationService from '../services/notification.js';

/**
 * Créer un signalement de déchet
 */
export const createWasteReport = async (req, res) => {
    try {
        const { description, imageUrl, location, wasteType } = req.body;

        const wasteReport = await WasteReport.create({
            userId: req.user._id,
            description,
            imageUrl,
            location,
            wasteType
        });

        // Ajouter des points à l'utilisateur
        await User.findByIdAndUpdate(req.user._id, {
            $inc: { points: 10 } // 10 points par signalement
        });

        // 🔔 NOTIFICATION: Points attribués au citoyen
        await NotificationService.notifyUserPointsAwarded(
            req.user._id, 
            10, 
            'la création d\'un signalement de déchet'
        );

        // 🔔 NOTIFICATION: Alertes aux admins
        await NotificationService.notifyAdminsNewWasteReport(wasteReport);

        // Audit pour création de signalement
        await logManualAudit(
            'WASTE_REPORT_CREATE',
            req.user,
            `Nouveau signalement de déchet créé`,
            { 
                reportId: wasteReport._id,
                wasteType: wasteType,
                location: location,
                pointsAwarded: 10 
            }
        );

        res.status(201).json({
            success: true,
            message: 'Signalement créé avec succès. 10 points ajoutés!',
            data: wasteReport
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
 * Récupérer les signalements sur une carte (géolocalisation)
 */
export const getWasteReportsMap = async (req, res) => {
    try {
        const { lat, lng, radius = 10000 } = req.query; // radius en mètres

        const wasteReports = await WasteReport.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseInt(radius)
                }
            }
        }).populate('userId', 'name');

        // Audit pour consultation de la carte
        await logManualAudit(
            'WASTE_REPORTS_VIEW_MAP',
            req.user,
            `Consultation des signalements sur la carte`,
            { 
                latitude: lat,
                longitude: lng,
                radius: radius,
                count: wasteReports.length 
            }
        );

        res.json({
            success: true,
            data: wasteReports
        });
    } catch (error) {
        console.error('❌ Erreur récupération carte:', error);
        
        // Audit pour erreur récupération carte
        await logManualAudit(
            'SYSTEM_ERROR',
            req.user,
            `Erreur lors de la récupération de la carte des signalements: ${error.message}`,
            { error: error.message, endpoint: '/waste/map' }
        );
        
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur' 
        });
    }
};

/**
 * Supprimer un signalement (Admin seulement)
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
            `Signalement supprimé`,
            { 
                reportId: wasteReport._id,
                description: wasteReport.description?.substring(0, 50),
                userId: wasteReport.userId
            }
        );

        res.json({
            success: true,
            message: 'Signalement supprimé avec succès'
        });
    } catch (error) {
        console.error('❌ Erreur suppression signalement:', error);
        
        // Audit pour erreur suppression
        await logManualAudit(
            'SYSTEM_ERROR',
            req.user,
            `Erreur lors de la suppression du signalement: ${error.message}`,
            { 
                error: error.message, 
                reportId: req.params.id,
                endpoint: `/waste/${req.params.id}` 
            }
        );
        
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur' 
        });
    }
};