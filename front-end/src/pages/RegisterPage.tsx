import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    // 🔒 SÉCURITÉ: Validation et sanitization du nom
    const sanitizedName = name.trim();
    
    // Bloquer les caractères dangereux (< > " ' / \ etc.)
    const dangerousCharsRegex = /[<>\"'\/\\]/;
    if (dangerousCharsRegex.test(sanitizedName)) {
      setError('Le nom contient des caractères non autorisés. Utilisez uniquement des lettres, chiffres, espaces et tirets.');
      return;
    }
    
    // Vérifier que le nom contient au moins 2 caractères alphabétiques
    const validNameRegex = /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/;
    if (!validNameRegex.test(sanitizedName)) {
      setError('Le nom doit contenir entre 2 et 50 caractères (lettres, espaces, tirets et apostrophes uniquement).');
      return;
    }
    
    // Bloquer les mots-clés suspects (script, alert, etc.)
    const suspiciousKeywords = ['script', 'alert', 'prompt', 'confirm', 'eval', 'function', 'javascript', 'onclick', 'onerror', 'onload'];
    const lowerName = sanitizedName.toLowerCase();
    for (const keyword of suspiciousKeywords) {
      if (lowerName.includes(keyword)) {
        setError('Le nom contient des mots non autorisés. Veuillez utiliser votre vrai nom.');
        return;
      }
    }
    
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    
    try {
      // ✅ Inscription avec nom sanitizé
      const result = await register(email, password, sanitizedName);
      
      if (result.success) {
        setSuccess('Inscription réussie ! Redirection...');
        
        // ✅ Redirection immédiate vers login
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Inscription réussie ! Veuillez vous connecter.',
              email: email
            }
          });
        }, 1000); // Délai réduit à 1 seconde
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'inscription. Veuillez réessayer.');
    }
  };

  return (
    <div className="flex w-screen mt-5 items-center justify-center">
      <div className="card">
        <h2 className="text-2xl font-bold text-center mb-6">Créer un compte</h2>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
            <p className="font-semibold">✅ {success}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nom complet
            </label>
                      <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-gray-400" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg 
                          focus:outline-none focus:ring-2 focus:ring-green-400 
                          focus:border-green-400 text-sm"
                placeholder="Votre nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          {/* Champ Email */}
          <div className="mt-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Adresse e-mail
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg 
                          focus:outline-none focus:ring-2 focus:ring-green-400 
                          focus:border-green-400 text-sm"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Champ Mot de passe */}
          <div className="mt-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg 
                          focus:outline-none focus:ring-2 focus:ring-green-400 
                          focus:border-green-400 text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Champ Confirmation mot de passe */}
          <div className="mt-4">
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg 
                          focus:outline-none focus:ring-2 focus:ring-green-400 
                          focus:border-green-400 text-sm"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Inscription en cours...
                </div>
              ) : (
                'S\'inscrire'
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Déjà inscrit?{' '}
            <Link to="/login" className="font-medium text-green-700 hover:text-green-800">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;