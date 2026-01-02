import React, { useState } from 'react';
import { buildApiUrl } from '../../config/api';

const StatsDebug: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const testStatsAPI = async (endpoint: string) => {
    setLoading(true);
    setResult('');
    
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      console.log('🔍 Test API Stats:', endpoint);
      console.log('🔑 Token présent:', !!token);
      console.log('👤 Utilisateur:', user ? JSON.parse(user) : 'Non connecté');
      
      const response = await fetch(buildApiUrl(endpoint), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📊 Statut réponse:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('📥 Données reçues:', data);
      
      if (response.ok) {
        setResult(`✅ Succès (${response.status})\n\n${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ Erreur (${response.status})\n\n${JSON.stringify(data, null, 2)}`);
      }
    } catch (error: any) {
      console.error('❌ Erreur:', error);
      setResult(`❌ Erreur réseau: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Debug API Statistiques</h2>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={() => testStatsAPI('/api/stats/public')}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 mr-2"
        >
          Test Stats Publiques
        </button>
        
        <button
          onClick={() => testStatsAPI('/api/stats')}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 mr-2"
        >
          Test Stats Complètes (Admin)
        </button>
        
        <button
          onClick={() => testStatsAPI('/api/stats/dashboard')}
          disabled={loading}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50 mr-2"
        >
          Test Dashboard (Admin)
        </button>
        
        <button
          onClick={() => testStatsAPI('/api/health')}
          disabled={loading}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
        >
          Test Santé API
        </button>
      </div>
      
      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Test en cours...</span>
        </div>
      )}
      
      {result && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Résultat :</h3>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm whitespace-pre-wrap">
            {result}
          </pre>
        </div>
      )}
      
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">Informations de debug :</h4>
        <p className="text-sm text-yellow-700">
          • API URL: {buildApiUrl('')}<br/>
          • Token présent: {localStorage.getItem('token') ? '✅ Oui' : '❌ Non'}<br/>
          • Utilisateur connecté: {localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).role : 'Non connecté'}
        </p>
      </div>
    </div>
  );
};

export default StatsDebug;