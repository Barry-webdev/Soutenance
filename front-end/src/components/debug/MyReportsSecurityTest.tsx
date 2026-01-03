import React, { useState } from 'react';
import { buildApiUrl } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

const MyReportsSecurityTest: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useAuth();

  const testMyReports = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const token = localStorage.getItem('token');
      
      console.log('🔍 Test sécurité "Mes signalements"');
      console.log('👤 Utilisateur connecté:', user);
      console.log('🔑 Token présent:', !!token);
      
      const response = await fetch(buildApiUrl('/api/waste/my-reports'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📊 Statut réponse:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('📥 Données reçues:', data);
      
      if (response.ok) {
        const reports = data.data || [];
        
        let securityAnalysis = `✅ Succès (${response.status})\n\n`;
        securityAnalysis += `📊 Nombre de signalements: ${reports.length}\n\n`;
        
        if (reports.length > 0) {
          securityAnalysis += `🔍 Analyse de sécurité:\n`;
          
          // Vérifier que tous les signalements appartiennent à l'utilisateur connecté
          const userIds = [...new Set(reports.map((r: any) => r.userId))];
          
          securityAnalysis += `- Utilisateurs propriétaires: ${userIds.length}\n`;
          securityAnalysis += `- ID utilisateur connecté: ${user?.id}\n`;
          
          if (userIds.length === 1 && userIds[0] === user?.id) {
            securityAnalysis += `✅ SÉCURITÉ OK: Tous les signalements appartiennent à l'utilisateur connecté\n\n`;
          } else {
            securityAnalysis += `❌ PROBLÈME DE SÉCURITÉ: Des signalements d'autres utilisateurs sont visibles!\n`;
            securityAnalysis += `- IDs trouvés: ${userIds.join(', ')}\n\n`;
          }
          
          // Détails des premiers signalements
          securityAnalysis += `📋 Détails des signalements:\n`;
          reports.slice(0, 3).forEach((report: any, index: number) => {
            securityAnalysis += `${index + 1}. ID: ${report._id}\n`;
            securityAnalysis += `   Propriétaire: ${report.userId}\n`;
            securityAnalysis += `   Description: ${report.description?.substring(0, 50)}...\n`;
            securityAnalysis += `   Date: ${new Date(report.createdAt).toLocaleDateString()}\n\n`;
          });
          
          if (reports.length > 3) {
            securityAnalysis += `... et ${reports.length - 3} autres signalements\n`;
          }
        } else {
          securityAnalysis += `ℹ️ Aucun signalement trouvé pour cet utilisateur\n`;
          securityAnalysis += `✅ SÉCURITÉ OK: Pas de fuite de données\n`;
        }
        
        setResult(securityAnalysis);
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

  const testAllReports = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const token = localStorage.getItem('token');
      
      console.log('🔍 Test accès à TOUS les signalements (doit être refusé pour citoyen)');
      
      const response = await fetch(buildApiUrl('/api/waste'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📊 Statut réponse:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('📥 Données reçues:', data);
      
      if (response.status === 403) {
        setResult(`✅ SÉCURITÉ OK: Accès refusé aux signalements de tous les utilisateurs\n\n${JSON.stringify(data, null, 2)}`);
      } else if (response.ok) {
        const reports = data.data?.wasteReports || [];
        setResult(`❌ PROBLÈME DE SÉCURITÉ: Accès autorisé à ${reports.length} signalements de tous les utilisateurs!\n\n${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`ℹ️ Erreur (${response.status}): ${JSON.stringify(data, null, 2)}`);
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
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        🔒 Test Sécurité "Mes Signalements"
      </h2>
      
      {/* Informations utilisateur */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">👤 Utilisateur connecté :</h3>
        {user ? (
          <div className="text-sm">
            <p>Nom : {user.name}</p>
            <p>Email : {user.email}</p>
            <p>Rôle : {user.role}</p>
            <p>ID : {user.id}</p>
          </div>
        ) : (
          <p className="text-red-600">❌ Aucun utilisateur connecté</p>
        )}
      </div>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={testMyReports}
          disabled={loading || !user}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 mr-2"
        >
          🔍 Tester "Mes Signalements"
        </button>
        
        <button
          onClick={testAllReports}
          disabled={loading || !user}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50 mr-2"
        >
          🚨 Tester Accès "Tous Signalements" (doit échouer)
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
          <h3 className="text-lg font-semibold mb-2">📋 Résultat du test :</h3>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm whitespace-pre-wrap">
            {result}
          </pre>
        </div>
      )}
      
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">🔒 Tests de sécurité :</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>✅ Vérifier que seuls MES signalements sont visibles</li>
          <li>✅ Vérifier que l'accès aux signalements de tous est refusé</li>
          <li>✅ Analyser les IDs des propriétaires des signalements</li>
          <li>✅ Confirmer l'authentification et l'autorisation</li>
        </ul>
      </div>
    </div>
  );
};

export default MyReportsSecurityTest;