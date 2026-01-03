// Utilitaires pour les appels API
import { buildApiUrl } from '../config/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: Response
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Fonction utilitaire pour faire des appels API avec gestion d'erreur robuste
 */
export const apiCall = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const url = buildApiUrl(endpoint);
    console.log('🌐 Appel API:', options.method || 'GET', url);

    // Configuration par défaut
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    // Ajouter le token d'authentification si disponible
    const token = localStorage.getItem('token');
    if (token) {
      (defaultOptions.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const finalOptions = { ...defaultOptions, ...options };

    const response = await fetch(url, finalOptions);

    console.log('📊 Réponse API:', response.status, response.statusText);

    // Gérer les erreurs HTTP
    if (!response.ok) {
      let errorMessage = `Erreur ${response.status}`;
      
      try {
        const errorText = await response.text();
        if (errorText) {
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
        }
      } catch (readError) {
        console.error('❌ Impossible de lire la réponse d\'erreur:', readError);
      }

      throw new ApiError(errorMessage, response.status, response);
    }

    // Parser la réponse JSON
    const data = await response.json();
    console.log('✅ Données reçues:', data);

    return data;
  } catch (error) {
    console.error('❌ Erreur appel API:', error);

    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError('Erreur de connexion au serveur. Vérifiez votre connexion internet.');
    }

    throw new ApiError(error instanceof Error ? error.message : 'Erreur inconnue');
  }
};

/**
 * Fonction spécialisée pour les mises à jour de statut
 */
export const updateStatus = async (
  endpoint: string,
  status: string,
  id: string
): Promise<ApiResponse> => {
  return apiCall(endpoint, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};

/**
 * Fonction pour tester la connectivité
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await apiCall('/api/health');
    return response.success !== false;
  } catch (error) {
    console.error('❌ Test de santé API échoué:', error);
    return false;
  }
};