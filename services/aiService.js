import WasteReport from '../models/wasteReportModel.js';
import User from '../models/userModel.js';

class AIService {
    /**
     * Analyser une image pour détecter le type de déchet
     * (Simulation d'IA - en production, utiliser TensorFlow.js, OpenAI Vision, etc.)
     */
    static async analyzeWasteImage(imageBuffer, imageName) {
        try {
            // Simulation d'analyse IA basée sur le nom du fichier et des patterns
            const analysis = this.simulateImageAnalysis(imageName);
            
            return {
                detectedWasteType: analysis.wasteType,
                confidence: analysis.confidence,
                suggestions: analysis.suggestions,
                environmentalImpact: analysis.impact,
                recyclingTips: analysis.tips
            };
        } catch (error) {
            console.error('❌ Erreur analyse IA:', error);
            return {
                detectedWasteType: 'unknown',
                confidence: 0,
                suggestions: ['Veuillez spécifier manuellement le type de déchet'],
                environmentalImpact: 'Impact inconnu',
                recyclingTips: []
            };
        }
    }

    /**
     * Simulation d'analyse d'image (à remplacer par vraie IA)
     */
    static simulateImageAnalysis(imageName) {
        const fileName = imageName.toLowerCase();
        
        // Patterns de reconnaissance basiques
        const patterns = [
            {
                keywords: ['plastic', 'bottle', 'bouteille', 'plastique'],
                wasteType: 'plastic',
                confidence: 0.85,
                suggestions: ['Bouteille en plastique détectée', 'Vérifiez le code de recyclage'],
                impact: 'Le plastique met 450 ans à se décomposer',
                tips: ['Rincer avant recyclage', 'Retirer le bouchon', 'Déposer dans le bac jaune']
            },
            {
                keywords: ['glass', 'verre', 'bottle'],
                wasteType: 'glass',
                confidence: 0.90,
                suggestions: ['Verre détecté', 'Matériau 100% recyclable'],
                impact: 'Le verre est recyclable à l\'infini',
                tips: ['Retirer les bouchons', 'Déposer dans le conteneur à verre', 'Ne pas mélanger avec la vaisselle']
            },
            {
                keywords: ['metal', 'can', 'canette', 'métal', 'aluminium'],
                wasteType: 'metal',
                confidence: 0.88,
                suggestions: ['Métal détecté', 'Excellent pour le recyclage'],
                impact: 'L\'aluminium économise 95% d\'énergie lors du recyclage',
                tips: ['Vider complètement', 'Écraser pour gagner de la place', 'Bac jaune']
            },
            {
                keywords: ['paper', 'papier', 'carton', 'cardboard'],
                wasteType: 'paper',
                confidence: 0.80,
                suggestions: ['Papier/carton détecté', 'Matériau biodégradable'],
                impact: 'Le papier recyclé sauve les forêts',
                tips: ['Retirer les agrafes', 'Éviter le papier souillé', 'Bac jaune']
            },
            {
                keywords: ['organic', 'food', 'bio', 'organique', 'nourriture'],
                wasteType: 'organic',
                confidence: 0.75,
                suggestions: ['Déchet organique détecté', 'Compostable'],
                impact: 'Les déchets organiques produisent du méthane en décharge',
                tips: ['Compostage domestique', 'Bac marron', 'Éviter les sacs plastiques']
            }
        ];

        // Recherche de correspondances
        for (const pattern of patterns) {
            for (const keyword of pattern.keywords) {
                if (fileName.includes(keyword)) {
                    return {
                        wasteType: pattern.wasteType,
                        confidence: pattern.confidence,
                        suggestions: pattern.suggestions,
                        impact: pattern.impact,
                        tips: pattern.tips
                    };
                }
            }
        }

        // Analyse par défaut
        return {
            wasteType: 'mixed',
            confidence: 0.3,
            suggestions: ['Type de déchet non identifié', 'Classification manuelle recommandée'],
            impact: 'Impact environnemental variable',
            tips: ['Consultez les consignes de tri locales', 'En cas de doute, déchets ménagers']
        };
    }

    /**
     * Prédire les zones à risque de pollution
     */
    static async predictPollutionHotspots(timeframe = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - timeframe);

            const hotspots = await WasteReport.aggregate([
                {
                    $match: {
                        createdAt: { $gte: cutoffDate },
                        status: { $in: ['pending', 'in_progress'] }
                    }
                },
                {
                    $group: {
                        _id: {
                            // Grouper par zone géographique (grille de ~1km)
                            lat: { $round: [{ $multiply: ['$location.lat', 100] }, 0] },
                            lng: { $round: [{ $multiply: ['$location.lng', 100] }, 0] }
                        },
                        count: { $sum: 1 },
                        wasteTypes: { $push: '$wasteType' },
                        avgLat: { $avg: '$location.lat' },
                        avgLng: { $avg: '$location.lng' },
                        reports: { $push: '$$ROOT' }
                    }
                },
                {
                    $addFields: {
                        riskScore: {
                            $multiply: [
                                '$count',
                                {
                                    $switch: {
                                        branches: [
                                            { case: { $gte: ['$count', 10] }, then: 3 },
                                            { case: { $gte: ['$count', 5] }, then: 2 },
                                            { case: { $gte: ['$count', 2] }, then: 1.5 }
                                        ],
                                        default: 1
                                    }
                                }
                            ]
                        },
                        riskLevel: {
                            $switch: {
                                branches: [
                                    { case: { $gte: ['$count', 10] }, then: 'high' },
                                    { case: { $gte: ['$count', 5] }, then: 'medium' },
                                    { case: { $gte: ['$count', 2] }, then: 'low' }
                                ],
                                default: 'minimal'
                            }
                        }
                    }
                },
                {
                    $match: {
                        count: { $gte: 2 } // Au moins 2 signalements
                    }
                },
                {
                    $sort: { riskScore: -1 }
                },
                {
                    $limit: 20
                }
            ]);

            return hotspots.map(hotspot => ({
                location: {
                    lat: hotspot.avgLat,
                    lng: hotspot.avgLng
                },
                reportsCount: hotspot.count,
                riskScore: hotspot.riskScore,
                riskLevel: hotspot.riskLevel,
                dominantWasteTypes: this.getMostFrequent(hotspot.wasteTypes),
                prediction: this.generatePrediction(hotspot)
            }));

        } catch (error) {
            console.error('❌ Erreur prédiction zones:', error);
            return [];
        }
    }

    /**
     * Recommandations personnalisées pour un utilisateur
     */
    static async getPersonalizedRecommendations(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) return [];

            // Analyser l'historique de l'utilisate