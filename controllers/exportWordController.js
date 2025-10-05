// controllers/exportController.js
import { WordExportService } from '../services/wordExport.js';
import WasteReport from '../models/wasteReportModel.js';
import CollaborationRequest from '../models/collaborationRequestModel.js';
import User from '../models/userModel.js';
// import AuditLog from '../models/AuditLog.js';
import ExportHistory from '../models/exportHistoryModel.js';
import { logManualAudit } from '../middlewares/auditMiddleware.js';

/**
 * Exporter les signalements en Word
 */
export const exportWasteReports = async (req, res) => {
    try {
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

        // Récupérer les données
        const reports = await WasteReport.find(filter)
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        // Générer le document Word
        const buffer = await WordExportService.exportWasteReports(reports, req.query);

        // Sauvegarder l'historique d'export
        await ExportHistory.create({
            userId: req.user._id,
            userEmail: req.user.email,
            exportType: 'waste_reports',
            fileName: `signalements_${new Date().toISOString().split('T')[0]}.docx`,
            fileSize: buffer.length,
            filters: req.query
        });

        // Logger l'action
        await logManualAudit(
            'DATA_EXPORT',
            req.user,
            'Export des signalements en format Word',
            { exportType: 'waste_reports', recordCount: reports.length }
        );

        // Envoyer le fichier
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="signalements_${Date.now()}.docx"`);
        res.send(buffer);

    } catch (error) {
        console.error('❌ Erreur export signalements:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'exportation'
        });
    }
};

/**
 * Exporter les collaborations en Word
 */
export const exportCollaborations = async (req, res) => {
    try {
        const { startDate, endDate, status, type } = req.query;
        
        const filter = {};
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }
        if (status) filter.status = status;
        if (type) filter.type = type;

        const collaborations = await CollaborationRequest.find(filter)
            .sort({ createdAt: -1 });

        const buffer = await WordExportService.exportCollaborations(collaborations, req.query);

        await ExportHistory.create({
            userId: req.user._id,
            userEmail: req.user.email,
            exportType: 'collaborations',
            fileName: `collaborations_${new Date().toISOString().split('T')[0]}.docx`,
            fileSize: buffer.length,
            filters: req.query
        });

        await logManualAudit(
            'DATA_EXPORT',
            req.user,
            'Export des collaborations en format Word',
            { exportType: 'collaborations', recordCount: collaborations.length }
        );

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="collaborations_${Date.now()}.docx"`);
        res.send(buffer);

    } catch (error) {
        console.error('❌ Erreur export collaborations:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'exportation'
        });
    }
};

/**
 * Exporter les statistiques en Word
 */
export const exportStatistics = async (req, res) => {
    try {
        // Récupérer les statistiques complètes
        const stats = await getCompleteStats();
        
        const buffer = await WordExportService.exportStatistics(stats);

        await ExportHistory.create({
            userId: req.user._id,
            userEmail: req.user.email,
            exportType: 'statistics',
            fileName: `statistiques_${new Date().toISOString().split('T')[0]}.docx`,
            fileSize: buffer.length,
            filters: {}
        });

        await logManualAudit(
            'DATA_EXPORT',
            req.user,
            'Export des statistiques en format Word',
            { exportType: 'statistics' }
        );

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="statistiques_${Date.now()}.docx"`);
        res.send(buffer);

    } catch (error) {
        console.error('❌ Erreur export statistiques:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'exportation'
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
}