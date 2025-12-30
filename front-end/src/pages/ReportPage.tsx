import React from 'react';
import ReportForm from '../components/reports/ReportForm';
import TestSignalement from '../components/debug/TestSignalement';

const ReportPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Signaler un déchet</h1>
        <p className="text-gray-600">
          Aidez à garder Pita propre en signalant les déchets que vous rencontrez. 
          Prenez une photo, décrivez le problème et partagez votre localisation.
        </p>
      </div>
      
      <ReportForm />
      
      {/* Composant de test pour le diagnostic */}
      <div className="mt-8">
        <TestSignalement />
      </div>
    </div>
  );
};

export default ReportPage;