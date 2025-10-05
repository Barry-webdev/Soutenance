// controllers/exportController.js
import { WordExportService } from '../services/wordExport.js';
import WasteReport from '../models/wasteReportModel.js';
import CollaborationRequest from '../models/collaborationRequestModel.js';
import User from '../models/userModel.js';
import ExportHistory from '../models/exportHistoryModel.js';
import { logManualAudit } from '../middlewares/auditMiddleware.js';

/**
 * Exporter les signalements en Word
 */
export const exportWasteReports = async (req, res) => {
    let exportRecord;
    
    try {
        console.log('📤 Début export signalements...');
        
        const { startDate, endDate, status, wasteType } = req.query;
        
        // Créer l'enregistrement d'export initial
        exportRecord = await ExportHistory.create({
            userId: req.user._id,
            userEmail: req.user.email,
            exportType: 'waste_reports',
            fileName: `signalements_${new Date().toISOString().split('T')[0]}.docx`,
            fileSize: 0,
            filters: req.query,
            status: 'pending'
        });

        // Audit pour début d'export
        await logManualAudit(
            'EXPORT_START',
            req.user,
            `Début de l'export des signalements en Word`,
            { 
                exportId: exportRecord._id,
                filters: req.query,
                exportType: 'waste_reports'
            }
        );
        
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
            // Mettre à jour le statut de l'export
            await ExportHistory.findByIdAndUpdate(exportRecord._id, {
                status: 'failed',
                fileSize: 0
            });

            // Audit pour export sans données
            await logManualAudit(
                'EXPORT_NO_DATA',
                req.user,
                `Export des signalements annulé - Aucune donnée trouvée`,
                { 
                    exportId: exportRecord._id,
                    filters: req.query,
                    recordCount: 0
                }
            );
            
            return res.status(404).json({
                success: false,
                error: 'Aucun signalement trouvé pour les critères sélectionnés'
            });
        }

        // Générer le document Word
        const buffer = await WordExportService.exportWasteReports(reports, req.query);

        console.log('✅ Document Word généré, taille:', buffer.length);

        // Mettre à jour l'historique d'export avec succès
        await ExportHistory.findByIdAndUpdate(exportRecord._id, {
            fileSize: buffer.length,
            status: 'completed'
        });

        // Audit pour export réussi
        await logManualAudit(
            'EXPORT_SUCCESS',
            req.user,
            `Export des signalements réussi - ${reports.length} enregistrements`,
            { 
                exportId: exportRecord._id,
                filters: req.query,
                recordCount: reports.length,
                fileSize: buffer.length,
                exportType: 'waste_reports'
            }
        );

        // Envoyer le fichier
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="signalements_${Date.now()}.docx"`);
        res.send(buffer);

        console.log('🎉 Export signalements terminé avec succès');

    } catch (error) {
        console.error('❌ Erreur export signalements:', error);
        
        // Mettre à jour le statut de l'export en échec
        if (exportRecord) {
            await ExportHistory.findByIdAndUpdate(exportRecord._id, {
                status: 'failed',
                fileSize: 0
            });
        }

        // Audit pour échec d'export
        await logManualAudit(
            'EXPORT_FAILED',
            req.user,
            `Échec de l'export des signalements: ${error.message}`,
            { 
                exportId: exportRecord?._id || 'unknown',
                filters: req.query,
                error: error.message,
                exportType: 'waste_reports',
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        );

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
    let exportRecord;
    
    try {
        console.log('📤 Début export collaborations...');
        
        const { startDate, endDate, status, type } = req.query;
        
        // Créer l'enregistrement d'export initial
        exportRecord = await ExportHistory.create({
            userId: req.user._id,
            userEmail: req.user.email,
            exportType: 'collaborations',
            fileName: `collaborations_${new Date().toISOString().split('T')[0]}.docx`,
            fileSize: 0,
            filters: req.query,
            status: 'pending'
        });

        // Audit pour début d'export collaborations
        await logManualAudit(
            'EXPORT_START',
            req.user,
            `Début de l'export des collaborations en Word`,
            { 
                exportId: exportRecord._id,
                filters: req.query,
                exportType: 'collaborations'
            }
        );
        
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
            // Mettre à jour le statut de l'export
            await ExportHistory.findByIdAndUpdate(exportRecord._id, {
                status: 'failed',
                fileSize: 0
            });

            // Audit pour export collaborations sans données
            await logManualAudit(
                'EXPORT_NO_DATA',
                req.user,
                `Export des collaborations annulé - Aucune donnée trouvée`,
                { 
                    exportId: exportRecord._id,
                    filters: req.query,
                    recordCount: 0
                }
            );
            
            return res.status(404).json({
                success: false,
                error: 'Aucune demande de collaboration trouvée pour les critères sélectionnés'
            });
        }

        const buffer = await WordExportService.exportCollaborations(collaborations, req.query);

        console.log('✅ Document collaborations généré');

        // Mettre à jour l'historique d'export avec succès
        await ExportHistory.findByIdAndUpdate(exportRecord._id, {
            fileSize: buffer.length,
            status: 'completed'
        });

        // Audit pour export collaborations réussi
        await logManualAudit(
            'EXPORT_SUCCESS',
            req.user,
            `Export des collaborations réussi - ${collaborations.length} enregistrements`,
            { 
                exportId: exportRecord._id,
                filters: req.query,
                recordCount: collaborations.length,
                fileSize: buffer.length,
                exportType: 'collaborations'
            }
        );

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="collaborations_${Date.now()}.docx"`);
        res.send(buffer);

        console.log('🎉 Export collaborations terminé avec succès');

    } catch (error) {
        console.error('❌ Erreur export collaborations:', error);
        
        // Mettre à jour le statut de l'export en échec
        if (exportRecord) {
            await ExportHistory.findByIdAndUpdate(exportRecord._id, {
                status: 'failed',
                fileSize: 0
            });
        }

        // Audit pour échec d'export collaborations
        await logManualAudit(
            'EXPORT_FAILED',
            req.user,
            `Échec de l'export des collaborations: ${error.message}`,
            { 
                exportId: exportRecord?._id || 'unknown',
                filters: req.query,
                error: error.message,
                exportType: 'collaborations',
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        );

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
    let exportRecord;
    
    try {
        console.log('📤 Début export statistiques...');
        
        // Créer l'enregistrement d'export initial
        exportRecord = await ExportHistory.create({
            userId: req.user._id,
            userEmail: req.user.email,
            exportType: 'statistics',
            fileName: `statistiques_${new Date().toISOString().split('T')[0]}.docx`,
            fileSize: 0,
            filters: {},
            status: 'pending'
        });

        // Audit pour début d'export statistiques
        await logManualAudit(
            'EXPORT_START',
            req.user,
            `Début de l'export des statistiques en Word`,
            { 
                exportId: exportRecord._id,
                exportType: 'statistics'
            }
        );
        
        // Récupérer les statistiques complètes
        const stats = await getCompleteStats();
        
        console.log('📊 Statistiques récupérées:', stats);

        const buffer = await WordExportService.exportStatistics(stats);

        console.log('✅ Document statistiques généré, taille:', buffer.length);

        // Mettre à jour l'historique d'export avec succès
        await ExportHistory.findByIdAndUpdate(exportRecord._id, {
            fileSize: buffer.length,
            status: 'completed'
        });

        // Audit pour export statistiques réussi
        await logManualAudit(
            'EXPORT_SUCCESS',
            req.user,
            `Export des statistiques réussi`,
            { 
                exportId: exportRecord._id,
                fileSize: buffer.length,
                exportType: 'statistics',
                statsSummary: {
                    users: stats.users?.total || 0,
                    wasteReports: stats.wasteReports?.total || 0,
                    collaborations: stats.collaborations?.total || 0
                }
            }
        );

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="statistiques_${Date.now()}.docx"`);
        res.send(buffer);

        console.log('🎉 Export statistiques terminé avec succès');

    } catch (error) {
        console.error('❌ Erreur export statistiques:', error);
        
        // Mettre à jour le statut de l'export en échec
        if (exportRecord) {
            await ExportHistory.findByIdAndUpdate(exportRecord._id, {
                status: 'failed',
                fileSize: 0
            });
        }

        // Audit pour échec d'export statistiques
        await logManualAudit(
            'EXPORT_FAILED',
            req.user,
            `Échec de l'export des statistiques: ${error.message}`,
            { 
                exportId: exportRecord?._id || 'unknown',
                error: error.message,
                exportType: 'statistics',
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        );

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

        // Audit pour consultation de l'historique des exports
        await logManualAudit(
            'EXPORT_HISTORY_VIEW',
            req.user,
            `Consultation de l'historique des exports`,
            { 
                page: page,
                limit: limit,
                total: total,
                resultsCount: exports.length
            }
        );

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
        
        // Audit pour erreur consultation historique exports
        await logManualAudit(
            'SYSTEM_ERROR',
            req.user,
            `Erreur lors de la consultation de l'historique des exports: ${error.message}`,
            { 
                error: error.message, 
                endpoint: '/export/history' 
            }
        );
        
        res.status(500).json({
            success: false,
            error: 'Erreur serveur'
        });
    }
};

/**
 * Supprimer un historique d'export
 */
export const deleteExportHistory = async (req, res) => {
    try {
        const exportRecord = await ExportHistory.findById(req.params.id);

        if (!exportRecord) {
            // Audit pour tentative de suppression d'un export non trouvé
            await logManualAudit(
                'EXPORT_HISTORY_DELETE_NOT_FOUND',
                req.user,
                `Tentative de suppression d'un historique d'export non trouvé`,
                { exportId: req.params.id }
            );
            
            return res.status(404).json({
                success: false,
                error: 'Historique d\'export non trouvé'
            });
        }

        // Vérifier que l'utilisateur peut supprimer cet export (propriétaire ou admin)
        if (exportRecord.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            // Audit pour tentative de suppression non autorisée
            await logManualAudit(
                'EXPORT_HISTORY_DELETE_UNAUTHORIZED',
                req.user,
                `Tentative de suppression non autorisée d'un historique d'export`,
                { 
                    exportId: req.params.id,
                    exportOwner: exportRecord.userId,
                    attemptingUser: req.user._id 
                }
            );
            
            return res.status(403).json({
                success: false,
                error: 'Non autorisé à supprimer cet historique d\'export'
            });
        }

        await ExportHistory.findByIdAndDelete(req.params.id);

        // Audit pour suppression d'historique d'export
        await logManualAudit(
            'EXPORT_HISTORY_DELETE',
            req.user,
            `Suppression d'un historique d'export`,
            { 
                exportId: req.params.id,
                exportType: exportRecord.exportType,
                fileName: exportRecord.fileName,
                fileSize: exportRecord.fileSize
            }
        );

        res.json({
            success: true,
            message: 'Historique d\'export supprimé avec succès'
        });
    } catch (error) {
        console.error('❌ Erreur suppression historique export:', error);
        
        // Audit pour erreur suppression historique export
        await logManualAudit(
            'SYSTEM_ERROR',
            req.user,
            `Erreur lors de la suppression de l'historique d'export: ${error.message}`,
            { 
                error: error.message, 
                exportId: req.params.id,
                endpoint: `/export/history/${req.params.id}` 
            }
        );
        
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