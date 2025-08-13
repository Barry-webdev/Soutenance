import React, { useState } from 'react';

const Collaboration: React.FC = () => {
  const [formData, setFormData] = useState({
    organisation: '',
    type: '',
    activite: '',
    message: '',
    email: ''
  });

  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    console.log('📤 Demande envoyée :', formData);

    try {
      const res = await fetch('http://localhost:4000/api/collaboration/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setErrorMessage(data.error || 'Impossible d’envoyer la demande.');
      }
    } catch (error) {
      console.error('❌ Erreur de connexion :', error);
      setErrorMessage('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-green-700 mb-4">🤝 Formulaire de Collaboration</h1>

      {success ? (
        <div className="bg-green-100 text-green-800 p-4 rounded shadow">
          ✅ Demande envoyée avec succès ! Nous vous répondrons dans les plus brefs délais.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="bg-red-100 text-red-800 p-3 rounded shadow">
              ❌ {errorMessage}
            </div>
          )}
          <input
            name="organisation"
            type="text"
            placeholder="Nom de l'organisation"
            value={formData.organisation}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Type d'organisation</option>
            <option value="ONG">ONG</option>
            <option value="Entreprise">Entreprise</option>
            <option value="Mairie">Mairie</option>
          </select>
          <input
            name="activite"
            type="text"
            placeholder="Activité principale"
            value={formData.activite}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <textarea
            name="message"
            placeholder="Message ou proposition"
            value={formData.message}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Adresse email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={loading}
          >
            {loading ? '⏳ Envoi en cours...' : '📤 Envoyer la demande'}
          </button>
        </form>
      )}
    </div>
  );
};

export default Collaboration;
