import React from 'react';
import sensibilisationTexte from '../data/sensibilisationData';

const Sensibilisation: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-green-700">🧠 Sensibilisation</h1>
      <div className="bg-white p-4 rounded shadow text-gray-800 whitespace-pre-line">
        {sensibilisationTexte}
      </div>
    </div>
  );
};

export default Sensibilisation;

