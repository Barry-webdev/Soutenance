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

    // Timeout pour éviter les appels qui traînent
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondes

    try {
      const response = await fetch(url, {
        ...finalOptions,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
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
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    console.error('❌ Erreur appel API:', error);

    if (error instanceof ApiError) {
      throw error;
    }

    if (error.name === 'AbortError') {
      throw new ApiError('Timeout: La requête a pris trop de temps à répondre');
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
 * Fonction pour tester la connectivité avec diagnostic détaillé
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    console.log('🔍 Test de connectivité API détaillé...');
    
    // Test 1: Health check simple
    const response = await apiCall('/api/health');
    console.log('✅ Health check réussi:', response);
    
    return response.success !== false;
  } catch (error) {
    console.error('❌ Test de santé API échoué:', error);
    
    // Diagnostic détaillé
    if (error instanceof ApiError) {
      console.error('📊 Détails erreur API:');
      console.error('- Status:', error.status);
      console.error('- Message:', error.message);
      
      if (error.status === 0 || !error.status) {
        console.error('🚨 Problème de CORS ou serveur inaccessible');
      }
    }
    
    return false;
  }
};

/**
 * Test de connectivité avec fallback sur différentes URLs
 */
export const testConnectivityWithFallback = async (): Promise<string | null> => {
  const urls = [
    'https://ecopulse-backend-00i3.onrender.com',
    'http://localhost:4000'
  ];
  
  for (const baseUrl of urls) {
    try {
      console.log(`🔍 Test connectivité: ${baseUrl}`);
      
      const response = await fetch(`${baseUrl}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log(`✅ Connectivité OK avec: ${baseUrl}`);
        return baseUrl;
      }
    } catch (error) {
      console.error(`❌ Échec connectivité ${baseUrl}:`, error.message);
    }
  }
  
  return null;
};