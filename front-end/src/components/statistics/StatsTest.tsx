import React, { useState } from 'react';

const StatsTest: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const testLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'babdoulrazzai@gmail.com',
          password: 'kathioure'
        })
      });
      
      const data = await response.json();
      setResult(`Login: ${JSON.stringify(data, null, 2)}`);
      
      if (data.success && data.data.token) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('userRole', data.data.user.role);
      }
    } catch (error) {
      setResult(`Erreur login: ${error}`);
    }
    setLoading(false);
  };

  const testPublicStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/stats/public', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      setResult(`Stats publiques: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`Erreur stats publiques: ${error}`);
    }
    setLoading(false);
  };

  const testAdminStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      setResult(`Stats admin: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`Erreur stats admin: ${error}`);
    }
    setLoading(false);
  };

  const testDashboard = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/stats/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      setResult(`Dashboard: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`Erreur dashboard: ${error}`);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Test des Statistiques</h2>
      
      <div className="flex gap-4 mb-6">
        <button 
          onClick={testLogin}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Test Login
        </button>
        <button 
          onClick={testPublicStats}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          Test Stats Publiques
        </button>
        <button 
          onClick={testAdminStats}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          Test Stats Admin
        </button>
        <button 
          onClick={testDashboard}
          disabled={loading}
          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
        >
          Test Dashboard
        </button>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      )}

      {result && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Résultat:</h3>
          <pre className="text-sm overflow-auto max-h-96">{result}</pre>
        </div>
      )}
    </div>
  );
};

export default StatsTest;