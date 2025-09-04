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
import { Camera, MapPin, X } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

const ReportForm: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [description, setDescription] = useState('');
  const [wasteType, setWasteType] = useState('general');
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          address: 'Localisation actuelle'
        });
        setLocationLoading(false);
      },
      () => {
        setError('Impossible de récupérer la localisation.');
        setLocationLoading(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('Vous devez être connecté pour signaler un déchet');
      return;
    }

    if (!description || !location || !photo) {
      setError('Tous les champs sont obligatoires.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:4000/api/waste_reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          description,
          wasteType,
          imageUrl: photo,
          address: location.address,
          latitude: location.latitude,
          longitude: location.longitude,
          status: 'en_attente'
        })
      });

      if (!response.ok) throw new Error("Erreur lors de l'enregistrement.");

      await fetch("http://localhost:4000/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          title: "Signalement reçu",
          message: "Votre signalement a été enregistré avec succès."
        })
      });

      addNotification({
        userId: user.id,
        title: 'Signalement reçu',
        message: 'Votre signalement a été enregistré avec succès.',
        read: false
      });

      setSuccess(true);
      setDescription('');
      setWasteType('general');
      setLocation(null);
      setPhoto(null);

      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Signaler un déchet</h2>

      {success && <p className="bg-green-100 border-green-500 text-green-700 p-4">Signalement envoyé avec succès!</p>}
      {error && <p className="bg-red-100 border-red-500 text-red-700 p-4">{error}</p>}

      <form onSubmit={handleSubmit}>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="form-input h-24"
          placeholder="Décrivez le déchet..."
          required
        />

        <select
          id="wasteType"
          value={wasteType}
          onChange={(e) => setWasteType(e.target.value)}
          className="form-input"
          required
        >
          <option value="general">Général</option>
          <option value="recyclable">Recyclable</option>
          <option value="organic">Organique</option>
          <option value="hazardous">Dangereux</option>
        </select>

        <button type="button" onClick={getCurrentLocation} className="btn-primary flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          {locationLoading ? 'Localisation...' : 'Partager ma localisation'}
        </button>

        {location && (
          <p className="mt-2">
            Adresse: {location.address} | Coordonnées: 
            {location.latitude ? location.latitude.toFixed(6) : 'N/A'}, 
            {location.longitude ? location.longitude.toFixed(6) : 'N/A'}
          </p>
        )}

        <div className="mt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <Camera className="w-5 h-5" />
            <span>Ajouter une photo</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              required
              hidden
            />
          </label>
        </div>

        {photo && (
          <div className="relative mt-4">
            <img src={photo} alt="Déchet" className="w-full h-56 object-cover rounded" />
            <button
              type="button"
              onClick={removePhoto}
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
              aria-label="Supprimer l'image"
            >
              <X className="w-4 h-4 text-red-500" />
            </button>
          </div>
        )}

        <button type="submit" className="btn-primary mt-4">
          {isSubmitting ? 'Envoi...' : 'Envoyer le signalement'}
        </button>
      </form>
    </div>
  );
};

export default ReportForm;
