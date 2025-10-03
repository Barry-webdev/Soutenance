import WasteReport from '../models/wasteReportModel.js';
import User from '../models/userModel.js';

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

        res.status(201).json({
            success: true,
            message: 'Signalement créé avec succès. 10 points ajoutés!',
            data: wasteReport
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                success: false,
                error: 'Données invalides', 
                details: errors 
            });
        }
        console.error('❌ Erreur création signalement:', error);
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

        res.json({
            success: true,
            data: wasteReports
        });
    } catch (error) {
        console.error('❌ Erreur récupération signalements utilisateur:', error);
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
            return res.status(400).json({ 
                success: false,
                error: 'Statut invalide' 
            });
        }

        const wasteReport = await WasteReport.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        ).populate('userId', 'name email');

        if (!wasteReport) {
            return res.status(404).json({ 
                success: false,
                error: 'Signalement non trouvé' 
            });
        }

        res.json({
            success: true,
            message: `Statut mis à jour: ${status}`,
            data: wasteReport
        });
    } catch (error) {
        console.error('❌ Erreur mise à jour statut:', error);
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

        res.json({
            success: true,
            data: wasteReports
        });
    } catch (error) {
        console.error('❌ Erreur récupération carte:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur' 
        });
    }
};