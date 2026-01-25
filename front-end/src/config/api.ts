// Configuration API pour le frontend
const API_CONFIG = {
  // URL du backend - s'adapte automatiquement à l'environnement
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  
  // Endpoints principaux
  ENDPOINTS: {
    AUTH: '/api/auth',
    USERS: '/api/users',
    WASTE: '/api/waste',
    STATS: '/api/stats',
    COLLABORATIONS: '/api/collaborations',
    NOTIFICATIONS: '/api/notifications',
    BADGES: '/api/gamification',
    SEARCH: '/api/search',
    AUDIT: '/api/audit',
    EXPORT: '/api/export'
  }
};

// Helper pour construire les URLs complètes
export const buildApiUrl = (endpoint: string): string => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  console.log('🌐 API URL construite:', url);
  return url;
};

// Helper pour les images - compatible avec Cloudinary et stockage local
export const buildImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  
  // Si l'URL est déjà complète (Cloudinary ou autre service externe)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Si c'est un chemin relatif commençant par /uploads/ (ancien stockage local)
  if (imagePath.startsWith('/uploads/')) {
    console.warn('⚠️ Image locale détectée:', imagePath);
    // Essayer de servir depuis le backend, avec fallback vers placeholder
    return `${API_CONFIG.BASE_URL}${imagePath}`;
  }
  
  // Si c'est un chemin relatif (stockage local)
  if (imagePath.startsWith('/')) {
    return `${API_CONFIG.BASE_URL}${imagePath}`;
  }
  
  // Fallback pour les chemins sans slash initial
  return `${API_CONFIG.BASE_URL}/${imagePath}`;
};

// Helper pour gérer les erreurs d'images avec placeholder
export const getImageWithFallback = (imagePath: string): string => {
  const url = buildImageUrl(imagePath);
  
  // Si c'est une image locale qui pourrait ne pas exister
  if (imagePath && imagePath.startsWith('/uploads/')) {
    // Retourner l'URL avec gestion d'erreur côté composant
    return url;
  }
  
  return url;
};

// Helper pour tester la connectivité
export const testApiConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(buildApiUrl('/api/health'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.ok;
  } catch (error) {
    console.error('❌ Test de connexion API échoué:', error);
    return false;
  }
};

// Export de la configuration pour usage direct
export default API_CONFIG;