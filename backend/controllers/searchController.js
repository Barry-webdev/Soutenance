import WasteReport from '../models/wasteReportModel.js';
import User from '../models/userModel.js';

/**
 * Recherche avancée de signalements
 */
export const searchReports = async (req, res) => {
    try {
        const {
            query,
            wasteType,
            status,
            startDate,
            endDate,
            lat,
            lng,
            radius,
            page = 1,
            limit = 20,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Construction du filtre de recherche
        let searchFilter = {};

        // Recherche textuelle
        if (query) {
            searchFilter.$or = [
                { description: { $regex: query, $options: 'i' } },
                { wasteType: { $regex: query, $options: 'i' } }
            ];
        }

        // Filtres spécifiques
        if (wasteType && wasteType !== 'all') {
            searchFilter.wasteType = wasteType;
        }

        if (status && status !== 'all') {
            searchFilter.status = status;
        }

        // Filtre par date
        if (startDate || endDate) {
            searchFilter.createdAt = {};
            if (startDate) {
                searchFilter.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                searchFilter.createdAt.$lte = new Date(endDate);
            }
        }

        // Recherche géospatiale (dans un rayon)
        if (lat && lng && radius) {
            const radiusInRadians = parseFloat(radius) / 6371; // Conversion km en radians
            searchFilter.location = {
                $geoWithin: {
                    $centerSphere: [[parseFloat(lng), parseFloat(lat)], radiusInRadians]
                }
            };
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Exécution de la recherche
        const [reports, totalCount] = await Promise.all([
            WasteReport.find(searchFilter)
                .populate('userId', 'name email')
                .sort(sortOptions)
                .skip(skip)
                .limit(parseInt(limit)),
            WasteReport.countDocuments(searchFilter)
        ]);

        // Calcul des métadonnées de pagination
        const totalPages = Math.ceil(totalCount / parseInt(limit));
        const hasNextPage = parseInt(page) < totalPages;
        const hasPrevPage = parseInt(page) > 1;

        res.status(200).json({
            success: true,
            data: {
                reports,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalCount,
                    hasNextPage,
                    hasPrevPage,
                    limit: parseInt(limit)
                },
                filters: {
                    query,
                    wasteType,
                    status,
                    startDate,
                    endDate,
                    location: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng), radius: parseFloat(radius) } : null
                }
            }
        });

    } catch (error) {
        console.error('❌ Erreur recherche signalements:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la recherche',
            error: error.message
        });
    }
};

/**
 * Recherche d'utilisateurs
 */
export const searchUsers = async (req, res) => {
    try {
        const { query, role, page = 1, limit = 20 } = req.query;

        let searchFilter = {};

        if (query) {
            searchFilter.$or = [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ];
        }

        if (role && role !== 'all') {
            searchFilter.role = role;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [users, totalCount] = await Promise.all([
            User.find(searchFilter)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            User.countDocuments(searchFilter)
        ]);

        const totalPages = Math.ceil(totalCount / parseInt(limit));

        res.status(200).json({
            success: true,
            data: {
                users,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalCount,
                    limit: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('❌ Erreur recherche utilisateurs:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la recherche d\'utilisateurs',
            error: error.message
        });
    }
};

/**
 * Suggestions de recherche
 */
export const getSearchSuggestions = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query || query.length < 2) {
            return res.status(200).json({
                success: true,
                data: { suggestions: [] }
            });
        }

        // Suggestions basées sur les types de déchets
        const wasteTypeSuggestions = await WasteReport.distinct('wasteType', {
            wasteType: { $regex: query, $options: 'i' }
        });

        // Suggestions basées sur les descriptions
        const descriptionSuggestions = await WasteReport.aggregate([
            {
                $match: {
                    description: { $regex: query, $options: 'i' }
                }
            },
            {
                $project: {
                    words: { $split: ['$description', ' '] }
                }
            },
            { $unwind: '$words' },
            {
                $match: {
                    words: { $regex: query, $options: 'i' }
                }
            },
            {
                $group: {
                    _id: '$words',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        const suggestions = [
            ...wasteTypeSuggestions.slice(0, 5),
            ...descriptionSuggestions.map(item => item._id).slice(0, 3)
        ];

        res.status(200).json({
            success: true,
            data: { suggestions: [...new Set(suggestions)] }
        });

    } catch (error) {
        console.error('❌ Erreur suggestions recherche:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des suggestions',
            error: error.message
        });
    }
};

/**
 * Statistiques de recherche
 */
export const getSearchStats = async (req, res) => {
    try {
        const [
            totalReports,
            wasteTypes,
            statusDistribution,
            recentActivity
        ] = await Promise.all([
            WasteReport.countDocuments(),
            WasteReport.aggregate([
                { $group: { _id: '$wasteType', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),
            WasteReport.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            WasteReport.aggregate([
                {
                    $match: {
                        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ])
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalReports,
                wasteTypes,
                statusDistribution,
                recentActivity
            }
        });

    } catch (error) {
        console.error('❌ Erreur statistiques recherche:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques',
            error: error.message
        });
    }
};