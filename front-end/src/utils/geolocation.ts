// Utilitaire de géolocalisation optimisé pour mobile et HTTPS

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

export interface GeolocationError {
  code: number;
  message: string;
  isHttpsRequired?: boolean;
}

export const checkGeolocationSupport = (): boolean => {
  return 'geolocation' in navigator;
};

export const isHttpsRequired = (): boolean => {
  // La géolocalisation nécessite HTTPS sur mobile (sauf localhost)
  return location.protocol !== 'https:' && !location.hostname.includes('localhost');
};

export const getCurrentLocation = (): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    // Vérifier le support
    if (!checkGeolocationSupport()) {
      reject({
        code: -1,
        message: 'La géolocalisation n\'est pas supportée par votre navigateur'
      });
      return;
    }

    // Vérifier HTTPS sur mobile
    if (isHttpsRequired()) {
      reject({
        code: -2,
        message: 'La géolocalisation nécessite une connexion sécurisée (HTTPS) sur mobile',
        isHttpsRequired: true
      });
      return;
    }

    // Options optimisées pour mobile
    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000, // 15 secondes (plus long pour mobile)
      maximumAge: 300000 // 5 minutes de cache
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          address: 'Localisation actuelle'
        });
      },
      (error) => {
        let message = 'Erreur lors de la détection de votre position';
        let isHttpsRequired = false;

        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Veuillez autoriser l\'accès à votre position dans les paramètres de votre navigateur';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Position non disponible. Vérifiez que le GPS est activé';
            break;
          case error.TIMEOUT:
            message = 'Délai d\'attente dépassé. Réessayez dans un endroit avec un meilleur signal';
            break;
        }

        // Vérifier si c'est un problème HTTPS
        if (error.code === error.PERMISSION_DENIED && !location.protocol.startsWith('https')) {
          message = 'La géolocalisation nécessite une connexion sécurisée (HTTPS)';
          isHttpsRequired = true;
        }

        reject({
          code: error.code,
          message,
          isHttpsRequired
        });
      },
      options
    );
  });
};

// Fonction pour obtenir une position approximative via IP (fallback)
export const getLocationFromIP = async (): Promise<LocationData> => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    return {
      latitude: data.latitude,
      longitude: data.longitude,
      address: `${data.city}, ${data.country_name} (approximatif)`
    };
  } catch (error) {
    throw new Error('Impossible de déterminer votre position approximative');
  }
};

// Fonction principale avec fallback
export const getLocationWithFallback = async (): Promise<LocationData> => {
  try {
    // Essayer d'abord la géolocalisation précise
    return await getCurrentLocation();
  } catch (error: any) {
    // Si HTTPS requis, informer l'utilisateur
    if (error.isHttpsRequired) {
      throw error;
    }
    
    // Sinon, essayer la géolocalisation par IP
    console.warn('Géolocalisation précise échouée, utilisation de la position approximative:', error.message);
    return await getLocationFromIP();
  }
};