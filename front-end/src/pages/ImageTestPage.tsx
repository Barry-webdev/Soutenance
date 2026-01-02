import React from 'react';
import ImageSizeTest from '../components/debug/ImageSizeTest';

const ImageTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Test des Images de Signalements</h1>
        <ImageSizeTest />
      </div>
    </div>
  );
};

export default ImageTestPage;