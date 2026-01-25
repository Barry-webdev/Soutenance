// utils/geographicValidation.ts
/**
 * Service de validation géographique côté frontend pour la préfecture de Pita
 */

export interface LocationValidationResult {
  isValid: boolean;
  error?: string;
  details?: string;
  location?: {
    provided: { lat: number; lng: number };
    distanceFromPita?: string;
    prefecture?: string;
  };
}

export class GeographicValidationService {
    // Limites de la préfecture de Pita
  private static readonly PITA_PREFECTURE_BOUNDS = {
    north: 11.25,    // Un peu au nord de Ninguélandé
    south: 10.55,    // Un peu au sud de Sangaréah  
    east: -12.30,    // Un peu à l'est du centre de Pita
    west: -12.95     // Un peu à l'ouest de Ley-Miro
  };

  // Centre de Pita
  private static readonly PITA_CENTER = {
    lat: 11.054444,
    lng: -12.396111
  };

  // Rayon maximum (50km)
  private static readonly MAX_RADIUS_KM = 50;

  /**
   * Valider si des coordonnées sont dans la préfecture de Pita
   */
  static validateLocation(lat: number, lng: number): LocationValidationResult {
    // Vérification des paramètres
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      return {
        isValid: false,
        error: 'Coordonnées invalides',
        details: 'Latitude et longitude requises'
      };
    }

    // MODE DÉVELOPPEMENT : Accepter toutes les localisations
    if (import.meta.env.DEV || window.location.hostname === 'localhost') {
      console.log('🔧 Mode développement : Validation géographique désactivée');
      return {
        isValid: true,
        location: {
          provided: { lat, lng },
          distanceFromPita: 'Mode développement'
        }
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

    // Vérification par distance depuis le centre
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
      location: {
        provided: { lat, lng },
        distanceFromPita: `${distanceFromCenter.toFixed(2)} km`
      }
    };
  }

  /**
   * Calculer la distance entre deux points (formule de Haversine)
   */
  private static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
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
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Obtenir des informations sur la zone couverte
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
   * Obtenir un message d'information pour l'utilisateur
   */
  static getLocationInfoMessage(): string {
    return `EcoPulse est actuellement disponible uniquement pour la préfecture de Pita (région de Mamou, Guinée). 
    Votre signalement sera automatiquement vérifié pour s'assurer qu'il se trouve dans cette zone.`;
  }
}