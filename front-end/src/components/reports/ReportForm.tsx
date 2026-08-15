import React, { useState, useEffect, useCallback } from 'react';
import { Camera, MapPin, X, Upload, AlertTriangle, WifiOff, Keyboard, RefreshCw } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { buildApiUrl } from '../../config/api';
import WhatsAppVoiceInput from '../voice/WhatsAppVoiceInput';

interface ReportFormProps {
  onSuccess?: () => void;
}

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

// Quartiers et zones de Pita pour la saisie manuelle
const PITA_ZONES = [
  'Pita Centre',
  'Ley-Miro',
  'Ninguélandé',
  'Sangaréah',
  'Bowé',
  'Timbi Madina',
  'Pellel',
  'Autre zone de Pita',
];

const ReportForm: React.FC<ReportFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [description, setDescription] = useState('');
  const [wasteType, setWasteType] = useState('plastique');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Erreurs par champ (ciblées)
  const [errors, setErrors] = useState<{
    description?: string;
    location?: string;
    image?: string;
    submit?: string;
  }>({});

  // Mode de localisation : 'gps' ou 'manual'
  const [locationMode, setLocationMode] = useState<'gps' | 'manual'>('gps');
  const [manualZone, setManualZone] = useState('');
  const [manualAddress, setManualAddress] = useState('');

  // Suivi de connexion réseau
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const clearFieldError = (field: keyof typeof errors) => {
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  // ─── Image ──────────────────────────────────────────────────────────────────
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: 'Veuillez sélectionner une image valide (JPG, PNG, WebP).' }));
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: "L'image ne peut pas dépasser 15 Mo." }));
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
    clearFieldError('image');
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    const fileInput = document.getElementById('imageInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleAudioChange = (blob: Blob | null, duration: number) => {
    setAudioBlob(blob);
    setAudioDuration(duration);
  };

  // ─── Géolocalisation GPS ────────────────────────────────────────────────────
  const getGPSLocation = async () => {
    setLocationLoading(true);
    clearFieldError('location');

    if (!navigator.geolocation) {
      setErrors(prev => ({
        ...prev,
        location: "Votre navigateur ne supporte pas la géolocalisation. Utilisez la saisie manuelle."
      }));
      setLocationMode('manual');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=fr`
          );
          if (response.ok) {
            const data = await response.json();
            const address = [data.locality, data.city, data.principalSubdivision]
              .filter(Boolean).join(', ');
            setLocation({ latitude, longitude, address: address || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}` });
          } else {
            setLocation({ latitude, longitude, address: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}` });
          }
        } catch {
          setLocation({ latitude, longitude, address: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}` });
        }
        setLocationLoading(false);
      },
      (error) => {
        let message = '';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Accès à la position refusé. Autorisez la géolocalisation dans vos paramètres ou utilisez la saisie manuelle.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Position GPS non disponible. Vérifiez que le GPS est activé ou utilisez la saisie manuelle.";
            break;
          case error.TIMEOUT:
            message = "Délai GPS dépassé (signal faible). Réessayez ou utilisez la saisie manuelle.";
            break;
          default:
            message = "Impossible d'obtenir votre position. Utilisez la saisie manuelle.";
        }
        setErrors(prev => ({ ...prev, location: message }));
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 10000 }
    );
  };

  // ─── Localisation manuelle ──────────────────────────────────────────────────
  const confirmManualLocation = () => {
    if (!manualZone) {
      setErrors(prev => ({ ...prev, location: "Veuillez sélectionner une zone." }));
      return;
    }
    const fullAddress = manualAddress.trim()
      ? `${manualAddress.trim()}, ${manualZone}, Pita, Guinée`
      : `${manualZone}, Pita, Guinée`;

    // Coordonnées du centre de Pita comme valeur par défaut pour la saisie manuelle
    setLocation({
      latitude: 11.054444,
      longitude: -12.396111,
      address: fullAddress,
    });
    clearFieldError('location');
  };

  // ─── Compression image ──────────────────────────────────────────────────────
  const compressImage = (file: File, quality: number): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      img.onload = () => {
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
          if (blob) resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
          else resolve(file);
        }, 'image/jpeg', quality);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  // ─── Envoi avec retry ───────────────────────────────────────────────────────
  const submitWithRetry = async (formData: FormData, token: string, maxRetries = 2): Promise<Response> => {
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 1) {
          setIsRetrying(true);
          await new Promise(res => setTimeout(res, 1500 * attempt)); // délai progressif
        }
        const response = await fetch(buildApiUrl('/api/waste'), {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
          signal: AbortSignal.timeout(30000),
        });
        setIsRetrying(false);
        return response;
      } catch (err: any) {
        lastError = err;
        console.warn(`Tentative ${attempt}/${maxRetries} échouée:`, err.message);
        setIsRetrying(false);
      }
    }
    throw lastError;
  };

  // ─── Soumission ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation champ par champ
    const newErrors: typeof errors = {};

    if (!user) {
      newErrors.submit = 'Vous devez être connecté pour signaler un déchet.';
    }
    if (!description?.trim() && !audioBlob) {
      newErrors.description = 'Veuillez fournir une description écrite ou un enregistrement vocal.';
    }
    if (description?.trim() && audioBlob) {
      newErrors.description = 'Choisissez soit la description écrite, soit le vocal — pas les deux.';
    }
    if (!location) {
      newErrors.location = 'La localisation est obligatoire. Utilisez le GPS ou la saisie manuelle.';
    }
    if (!imageFile) {
      newErrors.image = 'Une photo du déchet est obligatoire.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!isOnline) {
      setErrors({ submit: 'Pas de connexion internet. Vérifiez votre réseau et réessayez.' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setErrors({ submit: 'Session expirée. Veuillez vous reconnecter.' });
        setTimeout(() => { window.location.href = '/login'; }, 1500);
        return;
      }

      let processedImageFile = imageFile!;
      if (imageFile!.size > 1024 * 1024) {
        processedImageFile = await compressImage(imageFile!, 0.7);
      }

      const formData = new FormData();
      if (description?.trim()) formData.append('description', description.trim());
      formData.append('wasteType', wasteType);
      formData.append('location', JSON.stringify({
        lat: location!.latitude,
        lng: location!.longitude,
        address: location!.address,
      }));
      formData.append('image', processedImageFile);
      if (audioBlob) {
        formData.append('audio', new File([audioBlob], `audio_${Date.now()}.webm`, { type: 'audio/webm;codecs=opus' }));
        formData.append('audioDuration', audioDuration.toString());
      }

      const response = await submitWithRetry(formData, token);
      const responseData = await response.json();

      if (response.status === 401) {
        localStorage.removeItem('token');
        setErrors({ submit: 'Session expirée. Redirection vers la connexion...' });
        setTimeout(() => { window.location.href = '/login'; }, 1500);
        return;
      }

      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || "Erreur lors de l'enregistrement.");
      }

      // Succès — reset et redirection
      setDescription('');
      setWasteType('plastique');
      setLocation(null);
      setImageFile(null);
      setImagePreview(null);
      setAudioBlob(null);
      setAudioDuration(0);
      setManualZone('');
      setManualAddress('');

      if (onSuccess) onSuccess();
      else window.location.href = '/map';

    } catch (err: any) {
      const isNetworkError = err instanceof TypeError || err?.name === 'TimeoutError';
      setErrors({
        submit: isNetworkError
          ? 'Connexion au serveur échouée. Vérifiez votre réseau et réessayez.'
          : err.message || 'Une erreur est survenue. Veuillez réessayer.',
      });
    } finally {
      setIsSubmitting(false);
      setIsRetrying(false);
    }
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Signaler un déchet</h2>

      {/* Bannière hors-ligne */}
      {!isOnline && (
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-300 text-orange-800 p-3 rounded-lg mb-4">
          <WifiOff className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">Vous êtes hors ligne. La soumission ne sera pas possible sans connexion.</p>
        </div>
      )}

      {/* Erreur globale de soumission */}
      {errors.submit && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-400 text-red-700 p-4 rounded-lg mb-4">
          <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p>{errors.submit}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Description ── */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description du déchet
          </label>
          <div className="relative">
            <textarea
              id="description"
              value={description}
              onChange={(e) => { setDescription(e.target.value); clearFieldError('description'); }}
              rows={4}
              disabled={audioBlob !== null || isSubmitting}
              className={`w-full px-3 py-2 pr-16 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.description ? 'border-red-400 bg-red-50' : 'border-gray-300'
              } ${audioBlob ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder={audioBlob ? 'Enregistrement vocal actif' : 'Décrivez le type de déchet et son état...'}
            />
            <WhatsAppVoiceInput
              onAudioChange={handleAudioChange}
              disabled={isSubmitting || (description?.trim().length > 0)}
            />
          </div>
          {/* Erreur ciblée sous le champ */}
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> {errors.description}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {audioBlob
              ? <span className="text-green-600">Enregistrement vocal ajouté ({audioDuration}s)</span>
              : description?.trim()
                ? <span className="text-blue-600">Description écrite active</span>
                : 'Description écrite OU enregistrement vocal (pas les deux)'}
          </p>
        </div>

        {/* ── Type de déchet ── */}
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

        {/* ── Photo ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photo du déchet *
          </label>
          {!imagePreview ? (
            <div className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-green-400 transition-colors ${
              errors.image ? 'border-red-400 bg-red-50' : 'border-gray-300'
            }`}>
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
                <p className="text-sm text-gray-500">PNG, JPG, WebP jusqu'à 15 Mo</p>
              </label>
            </div>
          ) : (
            <div className="relative">
              <img src={imagePreview} alt="Aperçu" className="w-full h-64 object-cover rounded-lg border border-gray-300" />
              <button type="button" onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600">
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                {imageFile?.name}
              </div>
            </div>
          )}
          {errors.image && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> {errors.image}
            </p>
          )}
        </div>

        {/* ── Localisation ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Localisation *
          </label>

          {/* Sélecteur de mode */}
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => { setLocationMode('gps'); setLocation(null); clearFieldError('location'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                locationMode === 'gps'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
              }`}
            >
              <MapPin className="w-4 h-4" />
              GPS automatique
            </button>
            <button
              type="button"
              onClick={() => { setLocationMode('manual'); setLocation(null); clearFieldError('location'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                locationMode === 'manual'
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
              }`}
            >
              <Keyboard className="w-4 h-4" />
              Saisie manuelle
            </button>
          </div>

          {/* Mode GPS */}
          {locationMode === 'gps' && (
            <div>
              <button
                type="button"
                onClick={getGPSLocation}
                disabled={locationLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MapPin className="w-4 h-4" />
                {locationLoading ? 'Détection en cours...' : 'Détecter ma position'}
              </button>
              {!location && !locationLoading && (
                <p className="text-xs text-gray-500 mt-1">
                  Si le GPS ne fonctionne pas, utilisez la saisie manuelle.
                </p>
              )}
            </div>
          )}

          {/* Mode Manuel */}
          {locationMode === 'manual' && (
            <div className="space-y-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Zone / Quartier *
                </label>
                <select
                  value={manualZone}
                  onChange={(e) => { setManualZone(e.target.value); clearFieldError('location'); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                >
                  <option value="">-- Sélectionnez une zone --</option>
                  {PITA_ZONES.map(zone => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Adresse ou repère (optionnel)
                </label>
                <input
                  type="text"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  placeholder="Ex: Près du marché central, rue principale..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button
                type="button"
                onClick={confirmManualLocation}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                <MapPin className="w-4 h-4" />
                Confirmer la localisation
              </button>
            </div>
          )}

          {/* Erreur localisation — sous le champ */}
          {errors.location && (
            <div className="mt-2 flex items-start gap-2 p-3 bg-red-50 border border-red-300 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-700">{errors.location}</p>
                {locationMode === 'gps' && (
                  <button
                    type="button"
                    onClick={() => setLocationMode('manual')}
                    className="mt-1 text-xs text-red-600 underline hover:text-red-800"
                  >
                    Passer à la saisie manuelle
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Confirmation de localisation */}
          {location && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-green-800 font-medium">Localisation confirmée</p>
                  <p className="text-sm text-green-700">{location.address}</p>
                  {locationMode === 'gps' && (
                    <p className="text-xs text-green-600 mt-0.5">
                      {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setLocation(null)}
                    className="text-xs text-gray-500 underline mt-1 hover:text-gray-700"
                  >
                    Modifier
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Bouton soumission ── */}
        <button
          type="submit"
          disabled={isSubmitting || !isOnline}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              {isRetrying ? 'Nouvelle tentative...' : 'Envoi en cours...'}
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
