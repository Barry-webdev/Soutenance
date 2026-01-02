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
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper pour les images
export const buildImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_CONFIG.BASE_URL}${imagePath}`;
};

export default API_CONFIG;