import React, { useState, useEffect } from 'react';
import { Camera, MapPin, X, Upload, AlertTriangle } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { buildApiUrl } from '../../config/api';
import WhatsAppVoiceInput from '../voice/WhatsAppVoiceInput';

interface ReportFormProps {
  onSuccess?: () => void;
}

const ReportForm: React.FC<ReportFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [description, setDescription] = useState('');
  const [wasteType, setWasteType] = useState('plastique');
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner une image valide');
        return;
      }
      
      // Vérifier la taille (15MB max)
      if (file.size > 15 * 1024 * 1024) {
        setError('L\'image ne peut pas dépasser 15MB');
        return;
      }

      setImageFile(file);
      
      // Créer un aperçu
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    // Reset l'input file
    const fileInput = document.getElementById('imageInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  // Gérer l'audio du composant vocal
  const handleAudioChange = (blob: Blob | null, duration: number) => {
    setAudioBlob(blob);
    setAudioDuration(duration);
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    setError(null);

    // Version simple et robuste
    if (!navigator.geolocation) {
      // Fallback : utiliser Pita par défaut
      setLocation({
        latitude: 11.054444,
        longitude: -12.396111,
        address: 'Pita, Guinée (position par défaut)'
      });
      setLocationLoading(false);
      return;
    }

    // Options simplifiées
    const options = {
      enableHighAccuracy: false, // Plus rapide
      timeout: 8000, // 8 secondes max
      maximumAge: 300000 // 5 minutes de cache OK
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Validation simple : zone élargie autour de Pita
        const isNearPita = (
          latitude >= 10.8 && latitude <= 11.3 && 
          longitude >= -12.7 && longitude <= -12.1
        );
        
        if (isNearPita) {
          setLocation({
            latitude,
            longitude,
            address: `Pita, Guinée (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
          });
        } else {
          // Même si hors zone, utiliser Pita par défaut
          setLocation({
            latitude: 11.054444,
            longitude: -12.396111,
            address: 'Pita, Guinée (position ajustée)'
          });
        }
        
        setLocationLoading(false);
      },
      (error) => {
        // En cas d'erreur, toujours utiliser Pita par défaut
        setLocation({
          latitude: 11.054444,
          longitude: -12.396111,
          address: 'Pita, Guinée (position par défaut)'
        });
        setLocationLoading(false);
      },
      options
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('Vous devez être connecté pour signaler un déchet');
      return;
    }

    if (!description && !audioBlob) {
      setError('Veuillez choisir une méthode de description : soit écrire un texte, soit enregistrer un message vocal.');
      return;
    }

    if (!location) {
      setError('La localisation est obligatoire.');
      return;
    }

    if (!imageFile) {
      setError('Une photo du déchet est obligatoire.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token d\'authentification manquant. Veuillez vous reconnecter.');
        setIsSubmitting(false);
        return;
      }

      // OPTIMISATION 1: Compresser l'image avant envoi
      let processedImageFile = imageFile;
      if (imageFile.size > 1024 * 1024) { // Si > 1MB, compresser
        processedImageFile = await compressImage(imageFile, 0.7); // 70% qualité
      }

      // OPTIMISATION 2: Créer FormData optimisé
      const formData = new FormData();
      formData.append('description', description);
      formData.append('wasteType', wasteType);
      formData.append('location[lat]', location.latitude.toString());
      formData.append('location[lng]', location.longitude.toString());
      formData.append('image', processedImageFile);

      if (audioBlob) {
        const audioFile = new File([audioBlob], `audio_${Date.now()}.webm`, {
          type: 'audio/webm;codecs=opus'
        });
        formData.append('audio', audioFile);
        formData.append('audioDuration', audioDuration.toString());
      }

      // OPTIMISATION 3: Envoi rapide sans logs verbeux
      const response = await fetch(buildApiUrl('/api/waste'), {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || "Erreur lors de l'enregistrement.");
      }

      // OPTIMISATION 4: Notification locale immédiate (pas d'appel serveur)
      addNotification({
        userId: user.id,
        title: 'Signalement envoyé !',
        message: 'Votre signalement a été enregistré avec succès.',
        read: false
      });

      // OPTIMISATION 5: Reset immédiat + redirection rapide
      setSuccess(true);
      setDescription('');
      setWasteType('plastique');
      setLocation(null);
      setImageFile(null);
      setImagePreview(null);
      setAudioBlob(null);
      setAudioDuration(0);

      // Redirection immédiate (pas de délai)
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.href = '/map';
      }

    } catch (err: any) {
      console.error('❌ Erreur:', err);
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // OPTIMISATION 6: Fonction de compression d'image
  const compressImage = (file: File, quality: number): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Redimensionner si trop grand
        const maxWidth = 1200;
        const maxHeight = 900;
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file); // Fallback si compression échoue
          }
        }, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Signaler un déchet</h2>

      {success && (
        <div className="bg-green-100 border border-green-500 text-green-700 p-4 rounded mb-4">
          <p className="font-semibold">✅ Signalement envoyé avec succès!</p>
          <p className="text-sm mt-1">Redirection vers la carte dans 2 secondes...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-500 text-red-700 p-4 rounded mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Description OU Vocal - Choix clair */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Description du déchet *
          </label>
          
          {/* Indicateur de choix */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800 font-medium">
              📝 Choisissez votre méthode de description :
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Vous pouvez soit écrire une description, soit enregistrer un message vocal (pas les deux obligatoires)
            </p>
          </div>

          {/* Option 1: Description écrite */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-600">Option 1: Description écrite</span>
              {description && description.trim().length > 0 && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Écrite</span>
              )}
            </div>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Décrivez le type de déchet, son état, sa localisation précise..."
            />
          </div>

          {/* Séparateur OU */}
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-3 text-sm text-gray-500 bg-white">OU</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Option 2: Message vocal */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-600">Option 2: Message vocal</span>
              {audioBlob && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  ✓ Enregistré ({audioDuration}s)
                </span>
              )}
            </div>
            
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <WhatsAppVoiceInput 
                onAudioChange={handleAudioChange}
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-2">
                {audioBlob ? (
                  <span className="text-green-600">
                    ✅ Message vocal enregistré - Vous pouvez envoyer le signalement
                  </span>
                ) : (
                  "Maintenez le micro enfoncé pour enregistrer votre description vocale"
                )}
              </p>
            </div>
          </div>

          {/* Statut global */}
          <div className="mt-3 p-2 rounded-lg bg-gray-50">
            <p className="text-xs text-gray-600">
              <strong>Statut:</strong> {
                (description && description.trim().length > 0) || audioBlob
                  ? <span className="text-green-600">✅ Description fournie</span>
                  : <span className="text-orange-600">⚠️ Description requise (écrite OU vocale)</span>
              }
            </p>
          </div>
        </div>

        {/* Type de déchet */}
        <div>
          <label htmlFor="wasteType" className="block text-sm font-medium text-gray-700 mb-2">
            Type de déchet *
          </label>
          <select
            id="wasteType"
            value={wasteType}
            onChange={(e) => setWasteType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          >
            <option value="plastique">Plastique</option>
            <option value="verre">Verre</option>
            <option value="métal">Métal</option>
            <option value="organique">Organique</option>
            <option value="papier">Papier</option>
            <option value="dangereux">Dangereux</option>
            <option value="autre">Autre</option>
          </select>
        </div>

        {/* Upload d'image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photo du déchet *
          </label>
          
          {!imagePreview ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
              <input
                type="file"
                id="imageInput"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                className="hidden"
              />
              <label htmlFor="imageInput" className="cursor-pointer">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Cliquez pour ajouter une photo</p>
                <p className="text-sm text-gray-500">PNG, JPG, WebP jusqu'à 15MB</p>
              </label>
            </div>
          ) : (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Aperçu"
                className="w-full h-64 object-cover rounded-lg border border-gray-300"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                {imageFile?.name}
              </div>
            </div>
          )}
        </div>

        {/* Localisation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Localisation *
          </label>
          
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={locationLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
          >
            <MapPin className="w-4 h-4" />
            {locationLoading ? 'Localisation en cours...' : 'Obtenir ma position'}
          </button>

          {location && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-green-800">
                    <strong>Position:</strong> {location.address}
                  </p>
                  <p className="text-sm text-green-700">
                    <strong>Coordonnées:</strong> {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    ✅ Position confirmée
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={isSubmitting || !location || (!description && !audioBlob) || !imageFile}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Envoi en cours...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Envoyer le signalement
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ReportForm;