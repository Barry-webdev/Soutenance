import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqItems: FAQItem[] = [
  // Utilisation générale
  {
    category: 'Utilisation',
    question: "Comment créer un compte sur EcoPulse ?",
    answer: "Cliquez sur 'Connexion' puis 'Créer un compte'. Renseignez votre nom, email et mot de passe. Votre compte sera actif immédiatement."
  },
  {
    category: 'Utilisation',
    question: "Comment signaler un déchet ?",
    answer: "Connectez-vous, cliquez sur 'Signaler' dans le menu. Remplissez le formulaire : décrivez le déchet, choisissez son type, prenez une photo et partagez votre localisation. La localisation peut être automatique (GPS) ou manuelle si le GPS ne fonctionne pas."
  },
  {
    category: 'Utilisation',
    question: "La localisation GPS ne fonctionne pas, que faire ?",
    answer: "Pas de panique. Dans le formulaire de signalement, cliquez sur 'Saisie manuelle' et sélectionnez votre zone ou quartier dans la liste. Vous pouvez aussi ajouter un repère (ex: près du marché). Votre signalement sera quand même enregistré."
  },
  {
    category: 'Utilisation',
    question: "Est-ce que je peux signaler un déchet sans internet ?",
    answer: "Non, une connexion internet est nécessaire pour envoyer le signalement. Si vous êtes hors ligne, l'application vous affichera un message. Attendez d'avoir du réseau pour soumettre."
  },
  {
    category: 'Utilisation',
    question: "Puis-je utiliser EcoPulse sur mon téléphone Android ?",
    answer: "Oui, EcoPulse est optimisé pour Android. Vous pouvez l'installer comme application (PWA) en cliquant sur 'Ajouter à l'écran d'accueil' dans votre navigateur Chrome, sans passer par le Play Store."
  },
  // Signalements
  {
    category: 'Signalements',
    question: "Que se passe-t-il après mon signalement ?",
    answer: "Votre signalement est reçu par les administrateurs EcoPulse. Il passe par plusieurs statuts : 'En attente' → 'En cours de traitement' → 'Collecté' → 'Résolu'. Vous pouvez suivre l'état dans 'Mes signalements'."
  },
  {
    category: 'Signalements',
    question: "La photo est-elle obligatoire ?",
    answer: "Oui, une photo est requise pour valider le signalement. Elle permet aux équipes de confirmer et prioriser l'intervention. Prenez la photo directement avec votre téléphone."
  },
  {
    category: 'Signalements',
    question: "Je n'arrive pas à envoyer mon signalement. Que faire ?",
    answer: "Vérifiez d'abord votre connexion internet. Ensuite, assurez-vous que tous les champs obligatoires sont remplis (description ou audio, photo, localisation). Si le problème persiste, réessayez dans quelques minutes ou contactez-nous."
  },
  // Gamification
  {
    category: 'Points & Badges',
    question: "Comment gagner des points ?",
    answer: "Vous gagnez des points à chaque signalement validé. Plus vous signalez, plus vous montez dans le classement. Des badges spéciaux sont attribués pour certains accomplissements."
  },
  {
    category: 'Points & Badges',
    question: "À quoi servent les badges ?",
    answer: "Les badges reconnaissent votre engagement environnemental. Ils valorisent votre contribution et vous positionnent dans le classement communautaire. C'est une façon de motiver la participation citoyenne."
  },
  // Compte
  {
    category: 'Compte',
    question: "Comment modifier mon profil ?",
    answer: "Cliquez sur votre nom dans le menu puis 'Profil'. Vous pourrez modifier votre nom, photo de profil et mot de passe."
  },
  {
    category: 'Compte',
    question: "J'ai oublié mon mot de passe.",
    answer: "Contactez-nous par email à contact.sondme@gmail.com ou via WhatsApp au +224 661 02 16 16 en indiquant l'email de votre compte. Notre équipe vous aidera à le réinitialiser."
  },
  // Zone couverte
  {
    category: 'Zone couverte',
    question: "EcoPulse est-il disponible en dehors de Pita ?",
    answer: "Pour l'instant, EcoPulse couvre uniquement la préfecture de Pita et ses environs (rayon de 50 km). Nous prévoyons d'étendre la couverture à d'autres préfectures dans les prochains mois."
  },
];

const categories = [...new Set(faqItems.map(f => f.category))];

const FAQPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('Tous');

  const filtered = activeCategory === 'Tous'
    ? faqItems
    : faqItems.filter(f => f.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <HelpCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Questions fréquentes</h1>
          <p className="text-gray-600">Trouvez rapidement une réponse à votre question.</p>
        </div>

        {/* Filtres catégories */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {['Tous', ...categories].map(cat => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setOpenIndex(null); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-green-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-600 hover:border-green-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordéon */}
        <div className="space-y-3">
          {filtered.map((item, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900 pr-4">{item.question}</span>
                {openIndex === index
                  ? <ChevronUp className="w-5 h-5 text-green-600 flex-shrink-0" />
                  : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                }
              </button>
              {openIndex === index && (
                <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pas de réponse ? */}
        <div className="mt-8 text-center bg-green-50 border border-green-200 rounded-xl p-6">
          <p className="text-gray-700 mb-3 font-medium">Vous n'avez pas trouvé votre réponse ?</p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            Contactez-nous
          </Link>
        </div>

      </div>
    </div>
  );
};

export default FAQPage;
