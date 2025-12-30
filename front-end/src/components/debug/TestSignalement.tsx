import React, { useState } from 'react';

const TestSignalement: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testSignalement = async () => {
    setLoading(true);
    setResult('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setResult('❌ Pas de token - connectez-vous d\'abord');
        return;
      }

      // Créer un FormData pour tester l'upload d'image
      const formData = new FormData();
      formData.append('description', 'Test de signalement automatique');
      formData.append('wasteType', 'plastique');
      formData.append('location', JSON.stringify({ lat: 11.0591, lng: -12.3953 }));

      // Créer une image de test (canvas)
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(0, 0, 400, 300);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText('Test Image', 150, 150);
      }
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'test-image.jpg', { type: 'image/jpeg' });
          formData.append('image', file);
        }
      }, 'image/jpeg', 0.8);

      console.log('🔍 Test signalement avec image:', formData);

      const response = await fetch('http://localhost:4000/api/waste', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ Succès! Signalement créé: ${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ Erreur ${response.status}: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setResult(`❌ Erreur de connexion: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testAuth = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    setResult(`
🔍 Diagnostic d'authentification:
Token: ${token ? '✅ Présent' : '❌ Manquant'}
User: ${user ? '✅ Présent' : '❌ Manquant'}
${user ? `Détails: ${user}` : ''}
    `);
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">🧪 Test de Signalement</h2>
      
      <div className="space-y-4">
        <button 
          onClick={testAuth}
          className="btn-primary"
        >
          Vérifier l'authentification
        </button>
        
        <button 
          onClick={testSignalement}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Test en cours...' : 'Tester le signalement'}
        </button>
        
        {result && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestSignalement;
