import React from 'react';
import { buildApiUrl } from '../../config/api';

const ApiUrlDebug: React.FC = () => {
  const apiUrl = buildApiUrl('/api/health');
  
  const testConnection = async () => {
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      console.log('✅ Connexion API réussie:', data);
      alert(`✅ Connexion API OK: ${apiUrl}`);
    } catch (error) {
      console.error('❌ Erreur connexion API:', error);
      alert(`❌ Erreur connexion API: ${apiUrl}\nErreur: ${error.message}`);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-blue-100 border-2 border-blue-500 p-4 rounded-lg z-50">
      <h3 className="font-bold text-blue-800 mb-2">🔍 DEBUG API</h3>
      <div className="text-sm space-y-2">
        <p><strong>URL API:</strong></p>
        <p className="text-xs bg-white p-2 rounded break-all">{apiUrl}</p>
        <button 
          onClick={testConnection}
          className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
        >
          Tester Connexion
        </button>
      </div>
    </div>
  );
};

export default ApiUrlDebug;