// import React, { useState } from 'react';
// import { Camera, MapPin, X } from 'lucide-react';
// import { useNotifications } from '../../context/NotificationContext';
// import { useAuth } from '../../context/AuthContext';

// const ReportForm: React.FC = () => {
//   const { user } = useAuth();
//   const { addNotification } = useNotifications();

//   const [description, setDescription] = useState('');
//   const [wasteType, setWasteType] = useState('general');
//   const [location, setLocation] = useState<{latitude: number; longitude: number; address: string} | null>(null);
//   const [photo, setPhoto] = useState<string | null>(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [locationLoading, setLocationLoading] = useState(false);
//   const [success, setSuccess] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setPhoto(reader.result as string);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const removePhoto = () => {
//     setPhoto(null);
//   };

//   const getCurrentLocation = () => {
//     setLocationLoading(true);
//     setError(null);

//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         setLocation({
//           latitude: position.coords.latitude,
//           longitude: position.coords.longitude,
//           address: 'Localisation actuelle'
//         });
//         setLocationLoading(false);
//       },
//       () => {
//         setError('Impossible de récupérer la localisation.');
//         setLocationLoading(false);
//       }
//     );
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!user) {
//       setError('Vous devez être connecté pour signaler un déchet');
//       return;
//     }

//     if (!description || !location || !photo) {
//       setError('Tous les champs sont obligatoires.');
//       return;
//     }

//     setIsSubmitting(true);
//     setError(null);

//     try {
//       // ✅ Enregistrement du signalement
//       const response = await fetch('http://localhost:4000/api/waste_reports', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           userId: user.id,
//           description,
//           wasteType,
//           imageUrl: photo,
//           address: location.address,
//           latitude: location.latitude,
//           longitude: location.longitude,
//           status: 'en_attente'
//         })
//       });

//       if (!response.ok) throw new Error("Erreur lors de l'enregistrement.");

//       // ✅ Enregistrement de la vraie notification dans MySQL
//       await fetch("http://localhost:4000/api/notifications", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           userId: user.id,
//           title: "Signalement reçu",
//           message: "Votre signalement a été enregistré avec succès."
//         })
//       });

//       // ✅ Ajout local pour React (optionnel)
//       addNotification({
//         userId: user.id,
//         title: 'Signalement reçu',
//         message: 'Votre signalement a été enregistré avec succès.',
//         read: false
//       });

//       setSuccess(true);
//       setDescription('');
//       setWasteType('general');
//       setLocation(null);
//       setPhoto(null);

//       setTimeout(() => setSuccess(false), 5000);
//     } catch (err) {
//       console.error(err);
//       setError('Une erreur est survenue. Veuillez réessayer.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="card max-w-2xl mx-auto">
//       <h2 className="text-xl font-semibold mb-4">Signaler un déchet</h2>

//       {success && <p className="bg-green-100 border-green-500 text-green-700 p-4">Signalement envoyé avec succès!</p>}
//       {error && <p className="bg-red-100 border-red-500 text-red-700 p-4">{error}</p>}

//       <form onSubmit={handleSubmit}>
//         <textarea
//           id="description"
//           value={description}
//           onChange={(e) => setDescription(e.target.value)}
//           className="form-input h-24"
//           placeholder="Décrivez le déchet..."
//           required
//         />

//         <select
//           id="wasteType"
//           value={wasteType}
//           onChange={(e) => setWasteType(e.target.value)}
//           className="form-input"
//           required
//         >
//           <option value="general">Général</option>
//           <option value="recyclable">Recyclable</option>
//           <option value="organic">Organique</option>
//           <option value="hazardous">Dangereux</option>
//         </select>

//         <button type="button" onClick={getCurrentLocation} className="btn-primary flex items-center gap-2">
//           <MapPin className="w-4 h-4" />
//           {locationLoading ? 'Localisation...' : 'Partager ma localisation'}
//         </button>

//         {location && (
//           <p className="mt-2">
//             Adresse: {location.address} | Coordonnées: 
//             {location.latitude ? location.latitude.toFixed(6) : 'N/A'}, 
//             {location.longitude ? location.longitude.toFixed(6) : 'N/A'}
//           </p>
//         )}

//         <div className="mt-4">
//           <label className="flex items-center gap-2 cursor-pointer">
//             <Camera className="w-5 h-5" />
//             <span>Ajouter une photo</span>
//             <input type="file" accept="image/*" onChange={handlePhotoChange} required hidden />
//           </label>
//         </div>

//         {photo && (
//           <div className="relative mt-4">
//             <img src={photo} alt="Déchet" className="w-full h-56 object-cover rounded" />
//             <button
//               type="button"
//               onClick={removePhoto}
//               className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
//               aria-label="Supprimer l'image"
//             >
//               <X className="w-4 h-4 text-red-500" />
//             </button>
//           </div>
//         )}

//         <button type="submit" className="btn-primary mt-4">
//           {isSubmitting ? 'Envoi...' : 'Envoyer le signalement'}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default ReportForm;


import React, { useState } from 'react';
import { Camera, MapPin, X, Upload } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { getLocationWithFallback, GeolocationError } from '../../utils/geolocation';
import { buildApiUrl } from '../../config/api';

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
      
      // Vérifier la taille (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('L\'image ne peut pas dépasser 10MB');
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

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    setError(null);

    try {
      const locationData = await getLocationWithFallback();
      setLocation(locationData);
      setLocationLoading(false);
    } catch (error: any) {
      const geoError = error as GeolocationError;
      
      if (geoError.isHttpsRequired) {
        setError(`${geoError.message}. Votre site doit être en HTTPS pour utiliser la géolocalisation précise sur mobile.`);
      } else {
        setError(geoError.message);
      }
      
      setLocationLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('Vous devez être connecté pour signaler un déchet');
      return;
    }

    if (!description || !location) {
      setError('La description et la localisation sont obligatoires.');
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

      // Créer FormData pour l'upload d'image
      const formData = new FormData();
      formData.append('description', description);
      formData.append('wasteType', wasteType);
      formData.append('location[lat]', location.latitude.toString());
      formData.append('location[lng]', location.longitude.toString());
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      console.log('🔍 Envoi du signalement avec image...');

      const response = await fetch(buildApiUrl('/api/waste'), {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
          // Ne pas définir Content-Type, le navigateur le fera automatiquement avec boundary pour FormData
        },
        body: formData
      });

      console.log('📥 Réponse du serveur:', response.status, response.statusText);

      const responseData = await response.json();
      console.log('📥 Données de la réponse:', responseData);
      
      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || "Erreur lors de l'enregistrement.");
      }

      // Créer une notification après succès
      try {
        await fetch(buildApiUrl('/api/notifications'), {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            userId: user.id,
            title: "Signalement reçu",
            message: "Votre signalement a été enregistré avec succès.",
            type: "success"
          })
        });
      } catch (notifError) {
        console.log('Erreur notification (non bloquante):', notifError);
      }

      addNotification({
        userId: user.id,
        title: 'Signalement reçu',
        message: 'Votre signalement a été enregistré avec succès.',
        read: false
      });

      setSuccess(true);
      setDescription('');
      setWasteType('plastique');
      setLocation(null);
      setImageFile(null);
      setImagePreview(null);

      // Callback de succès ou redirection
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        setTimeout(() => {
          window.location.href = '/map';
        }, 2000);
      }
    } catch (err: any) {
      console.error('❌ Erreur complète:', err);
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
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
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description du déchet *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Décrivez le type de déchet et son état..."
            required
          />
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
            Photo du déchet (optionnel)
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
                <p className="text-sm text-gray-500">PNG, JPG, WebP jusqu'à 10MB</p>
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
            {locationLoading ? 'Détection...' : 'Partager ma localisation'}
          </button>

          {location && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Adresse:</strong> {location.address}
              </p>
              <p className="text-sm text-green-700">
                <strong>Coordonnées:</strong> {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </p>
            </div>
          )}
        </div>

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={isSubmitting || !location}
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
