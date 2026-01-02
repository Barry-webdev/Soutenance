import React, { useState, useEffect } from 'react';
import { buildApiUrl, buildImageUrl } from '../../config/api';

interface ImageSizeTestProps {
  reportId?: string;
}

const ImageSizeTest: React.FC<ImageSizeTestProps> = ({ reportId }) => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(buildApiUrl('/api/waste/public'));
        const data = await response.json();
        
        if (data.success) {
          // Trouver un signalement avec images
          const reportWithImages = data.data.find((r: any) => r.images !== null);
          if (reportWithImages) {
            setReport(reportWithImages);
          } else {
            setError('Aucun signalement avec images trouvé');
          }
        } else {
          setError('Erreur lors du chargement');
        }
      } catch (err) {
        setError('Erreur de connexion');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  if (loading) return <div className="p-4">Chargement...</div>;
  if (error) return <div className="p-4 text-red-600">Erreur: {error}</div>;
  if (!report) return <div className="p-4">Aucun signalement trouvé</div>;

  const sizes = [
    { name: 'Thumbnail', key: 'thumbnail', maxWidth: '300px' },
    { name: 'Medium', key: 'medium', maxWidth: '800px' },
    { name: 'Original', key: 'original', maxWidth: '100%' }
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Test des tailles d'images</h2>
      
      <div className="mb-4 p-3 bg-gray-100 rounded">
        <p><strong>Signalement:</strong> {report._id}</p>
        <p><strong>Description:</strong> {report.description.substring(0, 100)}...</p>
        <p><strong>Type:</strong> {report.wasteType}</p>
      </div>

      {report.images ? (
        <div className="space-y-6">
          {sizes.map(({ name, key, maxWidth }) => {
            const imageData = report.images[key];
            if (!imageData) {
              return (
                <div key={key} className="border border-red-200 p-4 rounded">
                  <h3 className="text-lg font-semibold text-red-600">{name}</h3>
                  <p className="text-red-500">Image manquante</p>
                </div>
              );
            }

            return (
              <div key={key} className="border border-gray-200 p-4 rounded">
                <h3 className="text-lg font-semibold mb-2">{name}</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <img
                      src={buildImageUrl(imageData.url)}
                      alt={`${name} - ${report.description}`}
                      className="w-full h-auto border rounded"
                      style={{ maxWidth }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.border = '2px solid red';
                        target.alt = 'Erreur de chargement';
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <p><strong>URL:</strong> <code className="bg-gray-100 px-1 rounded">{imageData.url}</code></p>
                    <p><strong>Fichier:</strong> {imageData.filename}</p>
                    <p><strong>Taille:</strong> {(imageData.size / 1024).toFixed(1)} KB</p>
                    {imageData.dimensions && (
                      <p><strong>Dimensions:</strong> {imageData.dimensions.width} × {imageData.dimensions.height} px</p>
                    )}
                    <p><strong>Type MIME:</strong> {imageData.mimeType || 'image/jpeg'}</p>
                    
                    <div className="mt-2">
                      <a
                        href={buildImageUrl(imageData.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                      >
                        Ouvrir dans un nouvel onglet
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Ce signalement n'a pas d'images
        </div>
      )}
    </div>
  );
};

export default ImageSizeTest;