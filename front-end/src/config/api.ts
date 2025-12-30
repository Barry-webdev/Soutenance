// Configuration de l'API
const API_BASE_URL = 'http://localhost:4000/api';

// Fonction pour obtenir les headers avec authentification
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Endpoints de l'API
export const API_ENDPOINTS = {
  // Authentification
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    PROFILE: `${API_BASE_URL}/auth/profile`,
  },
  
  // Signalements
  WASTE: {
    CREATE: `${API_BASE_URL}/waste`,
    GET_ALL: `${API_BASE_URL}/waste`,
    GET_MY: `${API_BASE_URL}/waste/my-reports`,
    GET_MAP: `${API_BASE_URL}/waste/map`,
    UPDATE_STATUS: (id: string) => `${API_BASE_URL}/waste/${id}/status`,
  },
  
  // Utilisateurs
  USERS: {
    GET_ALL: `${API_BASE_URL}/users`,
    GET_BY_ID: (id: string) => `${API_BASE_URL}/users/${id}`,
    UPDATE: (id: string) => `${API_BASE_URL}/users/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/users/${id}`,
  },
  
  // Collaborations
  COLLABORATIONS: {
    CREATE: `${API_BASE_URL}/collaborations`,
    GET_ALL: `${API_BASE_URL}/collaborations`,
    UPDATE_STATUS: (id: string) => `${API_BASE_URL}/collaborations/${id}/status`,
  },
  
  // Statistiques
  STATS: {
    GET_ALL: `${API_BASE_URL}/stats`,
    GET_DASHBOARD: `${API_BASE_URL}/stats/dashboard`,
  },
  
  // Notifications
  NOTIFICATIONS: {
    GET_USER: (userId: string) => `${API_BASE_URL}/notifications/${userId}`,
    CREATE: `${API_BASE_URL}/notifications`,
    MARK_READ: (id: string) => `${API_BASE_URL}/notifications/${id}/read`,
    MARK_ALL_READ: (userId: string) => `${API_BASE_URL}/notifications/${userId}/markAllAsRead`,
    GET_UNREAD_COUNT: (userId: string) => `${API_BASE_URL}/notifications/${userId}/unread-count`,
  },
};

export default API_BASE_URL;


