import React from 'react';

interface ImageData {
  url: string;
  filename: string;
  size: number;
  dimensions: {
    width: number;
    height: number;
  };
  mimeType?: string;
}

interface Images {
  original?: ImageData;
  medium?: ImageData;
  thumbnail?: ImageData;
}

interface ImageDisplayProps {
  images?: Images;
  size?: 'thumbnail' | 'medium' | 'original';
  className?: string;
  alt?: string;
  onClick?: () => void;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ 
  images, 
  size = 'medium', 
  className = '', 
  alt = 'Image du signalement',
  onClick 
}) => {
  if (!images) {
    return (
      <div className={`bg-gray-200 rounded-lg flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm">Aucune image</span>
      </div>
    );
  }

  // Obtenir l'URL de l'image selon la taille demandée
  const getImageUrl = () => {
    switch (size) {
      case 'thumbnail':
        return images.thumbnail?.url || images.medium?.url || images.original?.url;
      case 'medium':
        return images.medium?.url || images.original?.url;
      case 'original':
        return images.original?.url;
      default:
        return images.medium?.url || images.original?.url;
    }
  };

  const imageUrl = getImageUrl();
  
  if (!imageUrl) {
    return (
      <div className={`bg-gray-200 rounded-lg flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm">Image non disponible</span>
      </div>
    );
  }

  // Construire l'URL complète
  const fullImageUrl = imageUrl.startsWith('http') 
    ? imageUrl 
    : `http://localhost:4000${imageUrl}`;

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <img
        src={fullImageUrl}
        alt={alt}
        className={`w-full h-full object-cover transition-transform duration-300 ${
          onClick ? 'cursor-pointer hover:scale-105' : ''
        }`}
        onClick={onClick}
        onError={(e) => {
          // En cas d'erreur de chargement, afficher un placeholder
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `
              <div class="bg-gray-200 rounded-lg flex items-center justify-center w-full h-full">
                <span class="text-gray-500 text-sm">Erreur de chargement</span>
              </div>
            `;
          }
        }}
      />
      
      {/* Indicateur de taille sur l'image originale */}
      {size === 'original' && images.original && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          {images.original.dimensions.width}×{images.original.dimensions.height}
        </div>
      )}
    </div>
  );
};

export default ImageDisplay;


