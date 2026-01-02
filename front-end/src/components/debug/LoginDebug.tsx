import React, { useState } from 'react';
import { buildApiUrl } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginDebug: React.FC = () => {
  const [email, setEmail] = useState('babdoulrazzai@gmail.com');
  const [password, setPassword] = useState('kathioure');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const testLogin = async (useDebugRoute: boolean = false) => {
    setLoading(true);
    setResult('');
    
    try {
      const endpoint = useDebugRoute ? '/debug/auth/login' : '/api/auth/login';
      const url = useDebugRoute ? 
        `https://ecopulse-backend-00i3.onrender.com${endpoint}` : 
        buildApiUrl(endpoint);
      
      console.log('🔐 Test connexion:', { email, endpoint, url });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      console.log('📊 Réponse:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('📥 Données:', data);
      
      if (response.ok) {
        setResult(`✅ Connexion réussie !\n\n${JSON.stringify(data, null, 2)}`);
        
        // Si c'est un succès, sauvegarder les données et rediriger
        if (data.data?.token && data.data?.user) {
          localStorage.setItem('token', data.data.token);
          localStorage.setItem('user', JSON.stringify(data.data.user));
          
          setTimeout(() => {
            window.location.reload(); // Recharger pour mettre à jour le contexte auth
          }, 2000);
        }
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

  const testHealthAPI = async () => {
    setLoading(true);
    setResult('');
    
    try {
      // Tester l'endpoint de debug d'abord
      console.log('🏥 Test santé API debug...');
      const debugResponse = await fetch('https://ecopulse-backend-00i3.onrender.com/debug/health');
      
      if (debugResponse.ok) {
        const debugData = await debugResponse.json();
        setResult(`✅ API Debug OK\n\n${JSON.stringify(debugData, null, 2)}`);
      } else {
        setResult(`❌ API Debug erreur: ${debugResponse.status}`);
      }
    } catch (error: any) {
      setResult(`❌ Erreur API: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-red-600">🚨 Debug Connexion</h2>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Email admin"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Mot de passe"
          />
        </div>
      </div>
      
      <div className="space-y-3 mb-6">
        <button
          onClick={testHealthAPI}
          disabled={loading}
          className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
        >
          Test Santé API (Debug)
        </button>
        
        <button
          onClick={() => testLogin(true)}
          disabled={loading}
          className="w-full bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
        >
          Connexion Debug (Sans Rate Limit)
        </button>
        
        <button
          onClick={() => testLogin(false)}
          disabled={loading}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Connexion Normale
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
      
      <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <h4 className="font-semibold text-red-800 mb-2">⚠️ Problème de connexion détecté</h4>
        <p className="text-sm text-red-700">
          • Erreur 429 (Too Many Requests) détectée<br/>
          • Rate limiting trop restrictif<br/>
          • Utiliser la connexion debug pour contourner temporairement
        </p>
      </div>
    </div>
  );
};

export default LoginDebug;