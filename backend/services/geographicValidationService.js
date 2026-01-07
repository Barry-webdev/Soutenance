// services/geographicValidationService.js
/**
 * Service de validation géographique pour la préfecture de Pita, Guinée
 * Rejette tous les signalements en dehors des limites territoriales
 */

class GeographicValidationService {
    // Limites approximatives de la préfecture de Pita basées sur les sous-préfectures
    static PITA_PREFECTURE_BOUNDS = {
        // Coordonnées extrêmes basées sur les sous-préfectures
        north: 11.25,    // Un peu au nord de Ninguélandé (11°11'N)
        south: 10.55,    // Un peu au sud de Sangaréah (10°38'N)  
        east: -12.30,    // Un peu à l'est du centre de Pita (-12°23'W)
        west: -12.95     // Un peu à l'ouest de Ley-Miro (-12°53'W)
    };

    // Centre de la préfecture de Pita (ville principale)
    static PITA_CENTER = {
        lat: 11.054444,
        lng: -12.396111
    };

    // Rayon maximum depuis le centre (environ 50km pour couvrir toute la préfecture)
    static MAX_RADIUS_KM = 50;

    /**
     * Vérifier si des coordonnées sont dans les limites de la préfecture de Pita
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @returns {Object} - Résultat de la validation
     */
    static validateLocation(lat, lng) {
        // Vérification des paramètres
        if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
            return {
                isValid: false,
                error: 'Coordonnées invalides',
                details: 'Latitude et longitude requises'
            };
        }

        // Vérification des limites rectangulaires
        const withinBounds = (
            lat >= this.PITA_PREFECTURE_BOUNDS.south &&
            lat <= this.PITA_PREFECTURE_BOUNDS.north &&
            lng >= this.PITA_PREFECTURE_BOUNDS.west &&
            lng <= this.PITA_PREFECTURE_BOUNDS.east
        );

        if (!withinBounds) {
            return {
                isValid: false,
                error: 'Localisation non disponible',
                details: 'Impossible de traiter ce signalement pour le moment'
            };
        }

        // Vérification supplémentaire par distance depuis le centre
        const distanceFromCenter = this.calculateDistance(
            lat, lng,
            this.PITA_CENTER.lat, this.PITA_CENTER.lng
        );

        if (distanceFromCenter > this.MAX_RADIUS_KM) {
            return {
                isValid: false,
                error: 'Localisation non disponible',
                details: 'Impossible de traiter ce signalement pour le moment'
            };
        }

        return {
            isValid: true,
            message: 'Localisation validée',
            location: {
                coordinates: { lat, lng },
                distanceFromPita: `${distanceFromCenter.toFixed(2)} km`
            }
        };
    }

    /**
     * Calculer la distance entre deux points géographiques (formule de Haversine)
     * @param {number} lat1 - Latitude point 1
     * @param {number} lng1 - Longitude point 1  
     * @param {number} lat2 - Latitude point 2
     * @param {number} lng2 - Longitude point 2
     * @returns {number} - Distance en kilomètres
     */
    static calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Rayon de la Terre en km
        const dLat = this.toRadians(lat2 - lat1);
        const dLng = this.toRadians(lng2 - lng1);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Convertir degrés en radians
     * @param {number} degrees - Angle en degrés
     * @returns {number} - Angle en radians
     */
    static toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Obtenir des informations sur la zone couverte
     * @returns {Object} - Informations sur la préfecture de Pita
     */
    static getZoneInfo() {
        return {
            prefecture: 'Pita',
            region: 'Mamou',
            country: 'Guinée',
            center: this.PITA_CENTER,
            bounds: this.PITA_PREFECTURE_BOUNDS,
            area: '4,320 km²',
            population: '~266,000 habitants',
            subPrefectures: [
                'Pita (centre)',
                'Ley-Miro',
                'Ninguélandé', 
                'Sangaréah'
            ]
        };
    }

    /**
     * Vérifier si une adresse textuelle correspond à Pita
     * @param {string} address - Adresse textuelle
     * @returns {boolean} - True si l'adresse semble être à Pita
     */
    static validateAddress(address) {
        if (!address || typeof address !== 'string') {
            return false;
        }

        const addressLower = address.toLowerCase();
        const pitaKeywords = [
            'pita', 'mamou', 'guinée', 'guinea',
            'ley-miro', 'ninguélandé', 'sangaréah'
        ];

        return pitaKeywords.some(keyword => 
            addressLower.includes(keyword)
        );
    }
}

export default GeographicValidationService;