import React, { useState } from 'react';
import { Users, Mail, Building, Phone, MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { buildApiUrl } from '../config/api';

interface FormData {
  organizationName: string;
  contactPerson: string;
  email: string;
  phone: string;
  type: 'ngo' | 'company' | 'government' | 'educational' | 'other';
  message?: string;
}

const CollaborationPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    organizationName: '',
    contactPerson: '',
    email: '',
    phone: '',
    type: 'ngo',
    message: ''
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  const collaborationTypes = [
    { value: 'ngo', label: 'ONG / Association', icon: '🤝' },
    { value: 'company', label: 'Entreprise', icon: '🏢' },
    { value: 'government', label: 'Institution Gouvernementale', icon: '🏛️' },
    { value: 'educational', label: 'Établissement Éducatif', icon: '🎓' },
    { value: 'other', label: 'Autre', icon: '📋' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setFeedback('');

    try {
      console.log('📤 Envoi demande collaboration:', formData);
      
      const response = await fetch(buildApiUrl('/api/collaborations'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      console.log('📊 Réponse:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('📥 Données reçues:', data);

      if (!response.ok) {
        throw new Error(data.error || `Erreur ${response.status}`);
      }

      setStatus('success');
      setFeedback('✅ Merci ! Votre demande de collaboration a été envoyée avec succès. Nous vous contacterons bientôt.');
      
      // Reset form
      setFormData({
        organizationName: '',
        contactPerson: '',
        email: '',
        phone: '',
        type: 'ngo',
        message: ''
      });
    } catch (error: any) {
      console.error('❌ Erreur collaboration:', error);
      setStatus('error');
      setFeedback(`❌ Erreur: ${error.message}. Veuillez réessayer.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Collaborons pour un Environnement Plus Propre
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Rejoignez notre réseau de partenaires engagés dans la protection de l'environnement. 
            Ensemble, nous pouvons faire la différence pour notre communauté.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Informations sur la collaboration */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Pourquoi Collaborer ?
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Impact Collectif</h3>
                  <p className="text-sm text-gray-600">Amplifiez votre impact environnemental en rejoignant notre réseau de partenaires engagés.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-semibold">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Visibilité</h3>
                  <p className="text-sm text-gray-600">Mettez en avant vos initiatives environnementales auprès de notre communauté.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-yellow-600 font-semibold">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Ressources Partagées</h3>
                  <p className="text-sm text-gray-600">Accédez à nos outils, données et expertise pour optimiser vos actions.</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Types de Partenariats</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Campagnes de sensibilisation conjointes</li>
                <li>• Événements de nettoyage communautaire</li>
                <li>• Programmes éducatifs environnementaux</li>
                <li>• Initiatives de recyclage et réduction des déchets</li>
                <li>• Projets de recherche et développement durable</li>
              </ul>
            </div>
          </div>

          {/* Formulaire */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Send className="w-5 h-5 text-green-600" />
              Demande de Collaboration
            </h2>

            {status === 'success' && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-green-800 font-medium">Demande envoyée !</p>
                </div>
                <p className="text-green-700 text-sm mt-1">{feedback}</p>
              </div>
            )}

            {status === 'error' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-800 font-medium">Erreur</p>
                </div>
                <p className="text-red-700 text-sm mt-1">{feedback}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Nom de l'organisation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'organisation *
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Nom de votre organisation"
                  />
                </div>
              </div>

              {/* Personne de contact */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personne de contact *
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Nom et prénom du contact"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email de contact *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="contact@organisation.com"
                  />
                </div>
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="+224 XX XX XX XX"
                  />
                </div>
              </div>

              {/* Type d'organisation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type d'organisation *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {collaborationTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message (optionnel)
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Décrivez votre projet de collaboration, vos objectifs, ou toute information pertinente..."
                  />
                </div>
              </div>

              {/* Bouton de soumission */}
              <button
                type="submit"
                disabled={status === 'loading'}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                  status === 'loading'
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500'
                }`}
              >
                {status === 'loading' ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Envoi en cours...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" />
                    Envoyer la demande
                  </div>
                )}
              </button>
            </form>

            <p className="text-xs text-gray-500 mt-4 text-center">
              En soumettant ce formulaire, vous acceptez d'être contacté par notre équipe 
              concernant votre demande de collaboration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationPage;