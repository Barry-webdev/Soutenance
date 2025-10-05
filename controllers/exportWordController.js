// controllers/exportController.js
import { WordExportService } from '../services/wordExport.js';
import WasteReport from '../models/wasteReportModel.js';
import CollaborationRequest from '../models/collaborationRequestModel.js';
import User from '../models/userModel.js';
import ExportHistory from '../models/exportHistoryModel.js';

/**
 * Exporter les signalements en Word
 */
export const exportWasteReports = async (req, res) => {
    try {
        console.log('📤 Début export signalements...');
        
        const { startDate, endDate, status, wasteType } = req.query;
        
        // Construire les filtres
        const filter = {};
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }
        if (status) filter.status = status;
        if (wasteType) filter.wasteType = wasteType;

        console.log('🔍 Filtres appliqués:', filter);

        // Récupérer les données
        const reports = await WasteReport.find(filter)
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        console.log(`📊 ${reports.length} signalements trouvés`);

        if (reports.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Aucun signalement trouvé pour les critères sélectionnés'
            });
        }

        // Générer le document Word
        const buffer = await WordExportService.exportWasteReports(reports, req.query);

        console.log('✅ Document Word généré, taille:', buffer.length);

        // Sauvegarder l'historique d'export
        await ExportHistory.create({
            userId: req.user._id,
            userEmail: req.user.email,
            exportType: 'waste_reports',
            fileName: `signalements_${new Date().toISOString().split('T')[0]}.docx`,
            fileSize: buffer.length,
            filters: req.query,
            status: 'completed'
        });

        // Envoyer le fichier
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="signalements_${Date.now()}.docx"`);
        res.send(buffer);

        console.log('🎉 Export signalements terminé avec succès');

    } catch (error) {
        console.error('❌ Erreur export signalements:', error);
        
        // Sauvegarder l'échec dans l'historique
        await ExportHistory.create({
            userId: req.user._id,
            userEmail: req.user.email,
            exportType: 'waste_reports',
            fileName: `signalements_${new Date().toISOString().split('T')[0]}.docx`,
            fileSize: 0,
            filters: req.query,
            status: 'failed'
        });

        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'exportation',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Exporter les collaborations en Word
 */
export const exportCollaborations = async (req, res) => {
    try {
        console.log('📤 Début export collaborations...');
        
        const { startDate, endDate, status, type } = req.query;
        
        const filter = {};
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }
        if (status) filter.status = status;
        if (type) filter.type = type;

        console.log('🔍 Filtres collaborations:', filter);

        const collaborations = await CollaborationRequest.find(filter)
            .sort({ createdAt: -1 });

        console.log(`📊 ${collaborations.length} collaborations trouvées`);

        if (collaborations.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Aucune demande de collaboration trouvée pour les critères sélectionnés'
            });
        }

        const buffer = await WordExportService.exportCollaborations(collaborations, req.query);

        console.log('✅ Document collaborations généré');

        await ExportHistory.create({
            userId: req.user._id,
            userEmail: req.user.email,
            exportType: 'collaborations',
            fileName: `collaborations_${new Date().toISOString().split('T')[0]}.docx`,
            fileSize: buffer.length,
            filters: req.query,
            status: 'completed'
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="collaborations_${Date.now()}.docx"`);
        res.send(buffer);

        console.log('🎉 Export collaborations terminé avec succès');

    } catch (error) {
        console.error('❌ Erreur export collaborations:', error);
        
        // Sauvegarder l'échec dans l'historique
        await ExportHistory.create({
            userId: req.user._id,
            userEmail: req.user.email,
            exportType: 'collaborations',
            fileName: `collaborations_${new Date().toISOString().split('T')[0]}.docx`,
            fileSize: 0,
            filters: req.query,
            status: 'failed'
        });

        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'exportation',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Exporter les statistiques en Word
 */
export const exportStatistics = async (req, res) => {
    try {
        console.log('📤 Début export statistiques...');
        
        // Récupérer les statistiques complètes
        const stats = await getCompleteStats();
        
        console.log('📊 Statistiques récupérées:', stats);

        const buffer = await WordExportService.exportStatistics(stats);

        console.log('✅ Document statistiques généré, taille:', buffer.length);

        await ExportHistory.create({
            userId: req.user._id,
            userEmail: req.user.email,
            exportType: 'statistics',
            fileName: `statistiques_${new Date().toISOString().split('T')[0]}.docx`,
            fileSize: buffer.length,
            filters: {},
            status: 'completed'
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="statistiques_${Date.now()}.docx"`);
        res.send(buffer);

        console.log('🎉 Export statistiques terminé avec succès');

    } catch (error) {
        console.error('❌ Erreur export statistiques:', error);
        
        // Sauvegarder l'échec dans l'historique
        await ExportHistory.create({
            userId: req.user._id,
            userEmail: req.user.email,
            exportType: 'statistics',
            fileName: `statistiques_${new Date().toISOString().split('T')[0]}.docx`,
            fileSize: 0,
            filters: {},
            status: 'failed'
        });

        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'exportation',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Récupérer l'historique des exports
 */
export const getExportHistory = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const exports = await ExportHistory.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await ExportHistory.countDocuments({ userId: req.user._id });

        res.json({
            success: true,
            data: {
                exports,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        console.error('❌ Erreur historique exports:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur'
        });
    }
};

/**
 * Fonction pour récupérer les statistiques complètes
 */
async function getCompleteStats() {
    try {
        const [
            totalUsers,
            totalCitizens,
            totalAdmins,
            totalPartners,
            totalWasteReports,
            pendingWasteReports,
            collectedWasteReports,
            totalCollaborations,
            pendingCollaborations,
            approvedCollaborations
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'citizen' }),
            User.countDocuments({ role: 'admin' }),
            User.countDocuments({ role: 'partner' }),
            WasteReport.countDocuments(),
            WasteReport.countDocuments({ status: 'pending' }),
            WasteReport.countDocuments({ status: 'collected' }),
            CollaborationRequest.countDocuments(),
            CollaborationRequest.countDocuments({ status: 'pending' }),
            CollaborationRequest.countDocuments({ status: 'approved' })
        ]);

        return {
            users: {
                total: totalUsers,
                citizens: totalCitizens,
                admins: totalAdmins,
                partners: totalPartners
            },
            wasteReports: {
                total: totalWasteReports,
                pending: pendingWasteReports,
                collected: collectedWasteReports
            },
            collaborations: {
                total: totalCollaborations,
                pending: pendingCollaborations,
                approved: approvedCollaborations
            }
        };
    } catch (error) {
        console.error('❌ Erreur récupération statistiques:', error);
        throw error;
    }
}