import React from 'react';
import { Leaf, Target, Users, MapPin, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import EcoPulseLogo from '../assets/images/EcoPulse.logo.png';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* Header */}
        <div className="text-center">
          <img src={EcoPulseLogo} alt="EcoPulse" className="w-24 h-24 mx-auto object-contain mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Qui sommes-nous ?</h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            EcoPulse est une plateforme citoyenne de signalement des déchets urbains,
            développée pour et par la communauté de la préfecture de Pita, en Guinée.
          </p>
        </div>

        {/* Notre mission */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-2 rounded-lg">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Notre mission</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Faciliter le signalement des dépôts sauvages et déchets mal gérés dans la préfecture
            de Pita, afin de permettre aux autorités locales d'intervenir rapidement et efficacement.
            Nous croyons qu'un environnement propre commence par des citoyens informés et engagés.
          </p>
        </div>

        {/* Notre vision */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Leaf className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Notre vision</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Une Guinée plus propre, où chaque citoyen dispose des outils numériques pour
            contribuer à la gestion environnementale de sa communauté. EcoPulse ambitionne
            de s'étendre progressivement à d'autres préfectures du pays.
          </p>
        </div>

        {/* L'équipe */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Notre équipe</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: 'Barry Abdoul Razzaï', role: 'Fondateur & Développeur principal', initials: 'AB' },
              { name: 'Équipe technique', role: 'Développement & Infrastructure', initials: 'ET' },
              { name: 'Partenaires locaux', role: 'Coordination terrain à Pita', initials: 'PL' },
              { name: 'Testeurs communautaires', role: 'Retours utilisateurs & amélioration', initials: 'TC' },
            ].map((member) => (
              <div key={member.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {member.initials}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Zone couverte */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <MapPin className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Zone couverte</h2>
          </div>
          <p className="text-gray-600 mb-2">
            EcoPulse est actuellement opérationnel dans la <strong>Préfecture de Pita</strong>,
            région de Mamou, Guinée — couvrant :
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
            <li>Pita Centre</li>
            <li>Ley-Miro</li>
            <li>Ninguélandé</li>
            <li>Sangaréah</li>
            <li>Et les zones environnantes (rayon de 50 km)</li>
          </ul>
        </div>

        {/* CTA */}
        <div className="text-center flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            <Mail className="w-5 h-5" /> Nous contacter
          </Link>
          <Link
            to="/faq"
            className="inline-flex items-center gap-2 px-6 py-3 border border-green-600 text-green-700 rounded-lg hover:bg-green-50 font-medium"
          >
            Questions fréquentes
          </Link>
        </div>

      </div>
    </div>
  );
};

export default AboutPage;
