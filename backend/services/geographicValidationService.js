// services/geographicValidationService.js
/**
 * Service de validation géographique pour la préfecture de Pita, Guinée
 * Rejette tous les signalements en dehors des limites territoriales
 */

class GeographicValidationService {
    // Limites approximatives de la préfecture de Pita basées sur les sous-préfectures
    // 🌍 ZONE ÉLARGIE pour couvrir toute la préfecture et ses périphéries
    static PITA_PREFECTURE_BOUNDS = {
        // Coordonnées extrêmes élargies pour couvrir toute la zone
        north: 11.50,    // Élargi au nord (était 11.25)
        south: 10.30,    // Élargi au sud (était 10.55)
        east: -12.00,    // Élargi à l'est (était -12.30)
        west: -13.20     // Élargi à l'ouest (était -12.95)
    };

    // Centre de la préfecture de Pita (ville principale)
    static PITA_CENTER = {
        lat: 11.054444,
        lng: -12.396111
    };

    // Rayon maximum depuis le centre (élargi à 80km pour couvrir toutes les périphéries)
    static MAX_RADIUS_KM = 80;

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

        // 🔍 DEBUG: Logger les coordonnées pour diagnostic
        console.log('🌍 Validation géographique:', {
            coordinates: { lat, lng },
            bounds: this.PITA_PREFECTURE_BOUNDS,
            center: this.PITA_CENTER
        });

        // Vérification des limites rectangulaires
        const withinBounds = (
            lat >= this.PITA_PREFECTURE_BOUNDS.south &&
            lat <= this.PITA_PREFECTURE_BOUNDS.north &&
            lng >= this.PITA_PREFECTURE_BOUNDS.west &&
            lng <= this.PITA_PREFECTURE_BOUNDS.east
        );

        // Calculer la distance depuis le centre
        const distanceFromCenter = this.calculateDistance(
            lat, lng,
            this.PITA_CENTER.lat, this.PITA_CENTER.lng
        );

        console.log('📏 Distance depuis Pita centre:', distanceFromCenter.toFixed(2), 'km');

        if (!withinBounds) {
            console.warn('⚠️ Hors limites rectangulaires:', {
                lat: { value: lat, min: this.PITA_PREFECTURE_BOUNDS.south, max: this.PITA_PREFECTURE_BOUNDS.north },
                lng: { value: lng, min: this.PITA_PREFECTURE_BOUNDS.west, max: this.PITA_PREFECTURE_BOUNDS.east }
            });
            
            return {
                isValid: false,
                error: 'Localisation non disponible',
                details: `Vous êtes à ${distanceFromCenter.toFixed(2)} km de Pita. Cette zone n'est pas encore couverte.`
            };
        }

        // Vérification supplémentaire par distance depuis le centre
        if (distanceFromCenter > this.MAX_RADIUS_KM) {
            console.warn('⚠️ Trop loin du centre:', distanceFromCenter.toFixed(2), 'km (max:', this.MAX_RADIUS_KM, 'km)');
            
            return {
                isValid: false,
                error: 'Localisation non disponible',
                details: `Vous êtes à ${distanceFromCenter.toFixed(2)} km de Pita. Zone maximale: ${this.MAX_RADIUS_KM} km.`
            };
        }

        console.log('✅ Localisation validée:', distanceFromCenter.toFixed(2), 'km de Pita');

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