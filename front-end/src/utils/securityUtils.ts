/**
 * Utilitaires de sécurité pour le frontend
 */

/**
 * Échappe les caractères HTML dangereux pour prévenir les attaques XSS
 * @param text - Texte à échapper
 * @returns Texte sécurisé
 */
export const escapeHtml = (text: string): string => {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return text.replace(/[&<>"'/]/g, (char) => map[char]);
};

/**
 * Sanitize une chaîne en supprimant les caractères dangereux
 * @param text - Texte à nettoyer
 * @returns Texte nettoyé
 */
export const sanitizeText = (text: string): string => {
  // Supprimer les balises HTML
  return text.replace(/<[^>]*>/g, '');
};

/**
 * Valide un nom (lettres, espaces, tirets, apostrophes uniquement)
 * @param name - Nom à valider
 * @returns true si valide, false sinon
 */
export const isValidName = (name: string): boolean => {
  const validNameRegex = /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/;
  return validNameRegex.test(name.trim());
};

/**
 * Détecte les tentatives d'injection de code
 * @param text - Texte à vérifier
 * @returns true si suspect, false sinon
 */
export const containsSuspiciousCode = (text: string): boolean => {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick, onerror, etc.
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\(/i,
    /alert\(/i,
    /prompt\(/i,
    /confirm\(/i,
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(text));
};

/**
 * Nettoie et valide une entrée utilisateur
 * @param input - Entrée à nettoyer
 * @param maxLength - Longueur maximale
 * @returns Entrée nettoyée ou null si invalide
 */
export const cleanUserInput = (input: string, maxLength: number = 100): string | null => {
  if (!input || typeof input !== 'string') {
    return null;
  }
  
  const trimmed = input.trim();
  
  // Vérifier la longueur
  if (trimmed.length === 0 || trimmed.length > maxLength) {
    return null;
  }
  
  // Détecter le code suspect
  if (containsSuspiciousCode(trimmed)) {
    return null;
  }
  
  // Échapper le HTML
  return escapeHtml(trimmed);
};

/**
 * Composant React pour afficher du texte utilisateur en toute sécurité
 */
export const SafeText: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  const safeText = escapeHtml(text);
  return <span className={className}>{safeText}</span>;
};
