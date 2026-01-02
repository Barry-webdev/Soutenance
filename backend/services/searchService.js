import WasteReport from '../models/wasteReportModel.js';
import User from '../models/userModel.js';

class SearchService {
    /**
     * Recherche avancée de signalements
     */
    static async searchReports(searchParams) {
        try {
            const {
                query = '',
                wasteType = '',
                status = '',
                dateFrom = '',
                dateTo = '',
                location = null,
                radius = 5000, // 5km par défaut
                sortBy = 'createdAt',
                sortOrder = 'desc',
                page = 1,
                limit = 20,
                userId = null
            } = searchParams;

            // Construction du pipeline d'agrégation
            const pipeline = [];

            // 1. Match initial
            const matchConditions = {};

            // Recherche textuelle
            if (query) {
                matchConditions.$or = [
                    { description: { $regex: query, $options: 'i' } },
                    { wasteType: { $regex: query, $options: 'i' } },
                    { status: { $regex: query, $options: 'i' } }
                ];
            }

            // Filtres spécifiques
            if (wasteType) {
                matchConditions.wasteType = wasteType;
            }

            if (status) {
                matchConditions.status = status;
            }

            if (userId) {
                matchConditions.userId = userId;
            }

            // Filtre par date
            if (dateFrom || dateTo) {
                matchConditions.createdAt = {};
                if (dateFrom) {
                    matchConditions.createdAt.$gte = new Date(dateFrom);
                }
                if (dateTo) {
                    matchConditions.createdAt.$lte = new Date(dateTo);
                }
            }

            // Recherche géospatiale
            if (location && location.lat && location.lng) {
                matchConditions['location.coordinates'] = {
                    $geoWithin: {
                        $centerSphere: [
                            [parseFloat(location.lng), parseFloat(location.lat)],
                            radius / 6378100 // Conversion en radians
                        ]
                    }
                };
            }

            pipeline.push({ $match: matchConditions });

            // 2. Lookup pour récupérer les infos utilisateur
            pipeline.push({
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                    pipeline: [
                        { $project: { name: 1, email: 1, avatar: 1 } }
                    ]
                }
            });

            pipeline.push({
                $unwind: { path: '$user', preserveNullAndEmptyArrays: true }
            });

            // 3. Ajout de champs calculés
            pipeline.push({
                $addFields: {
                    relevanceScore: {
                        $add: [
                            // Score basé sur la correspondance textuelle
                            query ? {
                                $cond: [
                                    { $regexMatch: { input: '$description', regex: query, options: 'i' } },
                                    10, 0
                                ]
                            } : 0,
                            // Score basé sur la date (plus récent = meilleur score)
                            {
                                $divide: [
                                    { $subtract: ['$$NOW', '$createdAt'] },
                                    86400000 // millisecondes par jour
                                ]
                            },
                            // Score basé sur le statut
                            {
                                $switch: {
                                    branches: [
                                        { case: { $eq: ['$status', 'pending'] }, then: 5 },
                                        { case: { $eq: ['$status', 'in_progress'] }, then: 3 },
                                        { case: { $eq: ['$status', 'collected'] }, then: 1 }
                                    ],
                                    default: 0
                                }
                            }
                        ]
                    }
                }
            });

            // 4. Tri
            const sortOptions = {};
            if (sortBy === 'relevance') {
                sortOptions.relevanceScore = sortOrder === 'asc' ? 1 : -1;
            } else {
                sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
            }
            pipeline.push({ $sort: sortOptions });

            // 5. Pagination
            const skip = (page - 1) * limit;
            pipeline.push({ $skip: skip });
            pipeline.push({ $limit: parseInt(limit) });

            // 6. Projection finale
            pipeline.push({
                $project: {
                    _id: 1,
                    description: 1,
                    wasteType: 1,
                    status: 1,
                    location: 1,
                    images: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    user: 1,
                    relevanceScore: 1
                }
            });

            // Exécution de la recherche
            const [results, totalCount] = await Promise.all([
                WasteReport.aggregate(pipeline),
                this.getSearchCount(matchConditions)
            ]);

            return {
                results,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(totalCount / limit),
                    total: totalCount,
                    limit: parseInt(limit)
                },
                searchParams
            };

        } catch (error) {
            console.error('❌ Erreur recherche:', error);
            throw new Error('Erreur lors de la recherche');
        }
    }

    /**
     * Compter les résultats de recherche
     */
    static async getSearchCount(matchConditions) {
        const countPipeline = [
            { $match: matchConditions },
            { $count: 'total' }
        ];

        const result = await WasteReport.aggregate(countPipeline);
        return result[0]?.total || 0;
    }

    /**
     * Suggestions de recherche
     */
    static async getSearchSuggestions(query, limit = 5) {
        try {
            if (!query || query.length < 2) {
                return [];
            }

            const suggestions = await WasteReport.aggregate([
                {
                    $match: {
                        $or: [
                            { description: { $regex: query, $options: 'i' } },
                            { wasteType: { $regex: query, $options: 'i' } }
                        ]
                    }
                },
                {
                    $group: {
                        _id: null,
                        descriptions: { $addToSet: '$description' },
                        wasteTypes: { $addToSet: '$wasteType' }
                    }
                },
                {
                    $project: {
                        suggestions: {
                            $slice: [
                                {
                                    $setUnion: [
                                        {
                                            $filter: {
                                                input: '$descriptions',
                                                cond: {
                                                    $regexMatch: {
                                                        input: '$$this',
                                                        regex: query,
                                                        options: 'i'
                                                    }
                                                }
                                            }
                                        },
                                        {
                                            $filter: {
                                                input: '$wasteTypes',
                                                cond: {
                                                    $regexMatch: {
                                                        input: '$$this',
                                                        regex: query,
                                                        options: 'i'
                                                    }
                                                }
                                            }
                                        }
                                    ]
                                },
                                limit
                            ]
                        }
                    }
                }
            ]);

            return suggestions[0]?.suggestions || [];
        } catch (error) {
            console.error('❌ Erreur suggestions:', error);
            return [];
        }
    }

    /**
     * Recherche géospatiale avancée
     */
    static async searchNearby(lat, lng, radius = 5000, filters = {}) {
        try {
            const pipeline = [
                {
                    $geoNear: {
                        near: {
                            type: 'Point',
                            coordinates: [parseFloat(lng), parseFloat(lat)]
                        },
                        distanceField: 'distance',
                        maxDistance: radius,
                        spherical: true
                    }
                }
            ];

            // Ajouter des filtres supplémentaires
            if (Object.keys(filters).length > 0) {
                pipeline.push({ $match: filters });
            }

            // Lookup utilisateur
            pipeline.push({
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                    pipeline: [
                        { $project: { name: 1, email: 1 } }
                    ]
                }
            });

            pipeline.push({
                $unwind: { path: '$user', preserveNullAndEmptyArrays: true }
            });

            // Grouper par distance
            pipeline.push({
                $addFields: {
                    distanceGroup: {
                        $switch: {
                            branches: [
                                { case: { $lte: ['$distance', 500] }, then: '< 500m' },
                                { case: { $lte: ['$distance', 1000] }, then: '500m - 1km' },
                                { case: { $lte: ['$distance', 2000] }, then: '1km - 2km' },
                                { case: { $lte: ['$distance', 5000] }, then: '2km - 5km' }
                            ],
                            default: '> 5km'
                        }
                    }
                }
            });

            const results = await WasteReport.aggregate(pipeline);

            return {
                results,
                center: { lat: parseFloat(lat), lng: parseFloat(lng) },
                radius,
                total: results.length
            };

        } catch (error) {
            console.error('❌ Erreur recherche géospatiale:', error);
            throw new Error('Erreur lors de la recherche géospatiale');
        }
    }

    /**
     * Statistiques de recherche
     */
    static async getSearchStats() {
        try {
            const stats = await WasteReport.aggregate([
                {
                    $group: {
                        _id: null,
                        totalReports: { $sum: 1 },
                        wasteTypes: { $addToSet: '$wasteType' },
                        statuses: { $addToSet: '$status' },
                        avgPerDay: {
                            $avg: {
                                $dayOfYear: '$createdAt'
                            }
                        }
                    }
                },
                {
                    $project: {
                        totalReports: 1,
                        uniqueWasteTypes: { $size: '$wasteTypes' },
                        uniqueStatuses: { $size: '$statuses' },
                        wasteTypes: 1,
                        statuses: 1
                    }
                }
            ]);

            return stats[0] || {
                totalReports: 0,
                uniqueWasteTypes: 0,
                uniqueStatuses: 0,
                wasteTypes: [],
                statuses: []
            };
        } catch (error) {
            console.error('❌ Erreur stats recherche:', error);
            return {
                totalReports: 0,
                uniqueWasteTypes: 0,
                uniqueStatuses: 0,
                wasteTypes: [],
                statuses: []
            };
        }
    }
}

export default SearchService;