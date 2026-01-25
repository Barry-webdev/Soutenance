import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaPlay, FaPause, FaTrash } from 'react-icons/fa';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';

const WhatsAppVoiceInput = ({ onAudioChange, disabled = false }) => {
  const {
    isRecording,
    audioBlob,
    audioDuration,
    recordingTime,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    deleteRecording,
    formatTime
  } = useVoiceRecorder();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  
  const micButtonRef = useRef(null);
  const audioRef = useRef(null);
  const pressTimerRef = useRef(null);

  // Notifier le parent quand l'audio change
  useEffect(() => {
    if (onAudioChange) {
      onAudioChange(audioBlob, audioDuration);
    }
  }, [audioBlob, audioDuration, onAudioChange]);

  // Démarrer l'enregistrement (version simplifiée)
  const handleStart = async () => {
    if (disabled || isRecording) return;
    
    console.log('🎤 Tentative de démarrage enregistrement...');
    setIsPressed(true);
    
    try {
      await startRecording();
      console.log('✅ Enregistrement démarré');
    } catch (err) {
      console.error('❌ Erreur démarrage:', err);
      setIsPressed(false);
    }
  };

  // Arrêter l'enregistrement
  const handleStop = () => {
    console.log('🛑 Arrêt enregistrement...');
    setIsPressed(false);
    
    if (isRecording) {
      stopRecording();
      console.log('✅ Enregistrement arrêté');
    }
  };

  // Annuler l'enregistrement
  const handleCancel = () => {
    console.log('❌ Annulation enregistrement...');
    setIsPressed(false);
    
    if (isRecording) {
      cancelRecording();
      console.log('✅ Enregistrement annulé');
    }
  };

  // Gestion des événements souris
  const handleMouseDown = (e) => {
    e.preventDefault();
    console.log('🖱️ Mouse down');
    handleStart();
  };

  const handleMouseUp = (e) => {
    e.preventDefault();
    console.log('🖱️ Mouse up');
    handleStop();
  };

  // Gestion des événements tactiles
  const handleTouchStart = (e) => {
    e.preventDefault();
    console.log('👆 Touch start');
    handleStart();
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    console.log('👆 Touch end');
    handleStop();
  };

  // Lecture de l'audio
  const togglePlayback = () => {
    if (!audioRef.current || !audioBlob) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      const audioUrl = URL.createObjectURL(audioBlob);
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setIsPlaying(true);
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
    }
  };

  // Supprimer l'enregistrement
  const handleDelete = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    deleteRecording();
  };

  return (
    <div className="relative">
      {/* Overlay d'enregistrement simplifié */}
      {isRecording && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 mx-4 max-w-sm w-full">
            <div className="text-center">
              {/* Animation d'onde sonore */}
              <div className="flex justify-center items-center mb-4">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                  <FaMicrophone className="w-8 h-8 text-white" />
                </div>
              </div>
              
              {/* Timer */}
              <div className="text-3xl font-mono text-gray-800 mb-4">
                {formatTime(recordingTime)}
              </div>
              
              {/* Boutons d'action */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleStop}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
                >
                  ✓ Terminer
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
                >
                  ✕ Annuler
                </button>
              </div>
              
              <p className="text-sm text-gray-500 mt-4">
                Enregistrement en cours... (max 60s)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Version de test avec boutons séparés */}
      {!audioBlob && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-2">
          {!isRecording ? (
            <button
              type="button"
              onClick={handleStart}
              disabled={disabled}
              className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors"
            >
              <FaMicrophone className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStop}
              className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors animate-pulse"
            >
              <FaMicrophone className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Lecteur audio après enregistrement */}
      {audioBlob && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={togglePlayback}
                className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors"
              >
                {isPlaying ? (
                  <FaPause className="w-3 h-3" />
                ) : (
                  <FaPlay className="w-3 h-3 ml-0.5" />
                )}
              </button>
              
              <div className="flex items-center space-x-2">
                <FaMicrophone className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-mono text-gray-700">
                  {formatTime(audioDuration)}
                </span>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleDelete}
              className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <FaTrash className="w-3 h-3" />
            </button>
          </div>
          
          {/* Forme d'onde visuelle */}
          <div className="mt-2 flex items-center justify-center space-x-1">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-green-300 rounded-full"
                style={{
                  height: `${8 + Math.random() * 12}px`
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Audio element pour la lecture */}
      <audio ref={audioRef} className="hidden" />

      {/* Affichage des erreurs */}
      {error && (
        <div className="mt-2 p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
          <strong>Erreur:</strong> {error}
          <br />
          <button 
            onClick={() => window.location.reload()} 
            className="text-blue-600 underline mt-1"
          >
            Recharger la page
          </button>
        </div>
      )}

      {/* Instructions */}
      {!audioBlob && !error && (
        <p className="text-xs text-gray-500 mt-1">
          Maintenez le micro enfoncé pour enregistrer
        </p>
      )}
    </div>
  );
};

export default WhatsAppVoiceInput;