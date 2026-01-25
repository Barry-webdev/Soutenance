import { useState, useRef, useCallback } from 'react';

export const useVoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const streamRef = useRef(null);

  // Démarrer l'enregistrement
  const startRecording = useCallback(async () => {
    try {
      console.log('🎤 Démarrage enregistrement...');
      setError(null);
      
      // Demander permission microphone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });

      console.log('✅ Stream audio obtenu');
      streamRef.current = stream;

      // Créer MediaRecorder avec fallback pour le format
      let mediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus'
        });
      } catch (e) {
        try {
          mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'audio/webm'
          });
        } catch (e2) {
          mediaRecorder = new MediaRecorder(stream);
        }
      }

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Événements MediaRecorder
      mediaRecorder.ondataavailable = (event) => {
        console.log('📦 Données audio reçues:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('🛑 MediaRecorder arrêté');
        
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { 
            type: mediaRecorder.mimeType || 'audio/webm' 
          });
          
          console.log('✅ Blob audio créé:', audioBlob.size, 'bytes');
          setAudioBlob(audioBlob);
          
          // Calculer la durée finale
          const endTime = Date.now();
          const duration = Math.round((endTime - startTimeRef.current) / 1000);
          setAudioDuration(duration);
          console.log('⏱️ Durée finale:', duration, 'secondes');
        } else {
          console.log('❌ Aucune donnée audio enregistrée');
          setError('Aucune donnée audio enregistrée');
        }
        
        // Arrêter le stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => {
            track.stop();
            console.log('🔇 Track audio arrêté');
          });
          streamRef.current = null;
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('❌ Erreur MediaRecorder:', event.error);
        setError('Erreur lors de l\'enregistrement: ' + event.error);
      };

      // Démarrer l'enregistrement
      mediaRecorder.start(100); // Collecte des données toutes les 100ms
      setIsRecording(true);
      startTimeRef.current = Date.now();
      setRecordingTime(0);

      console.log('✅ Enregistrement démarré, état:', mediaRecorder.state);

      // Timer pour afficher le temps d'enregistrement
      timerRef.current = setInterval(() => {
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
        setRecordingTime(elapsed);
        
        // Arrêter automatiquement après 60 secondes
        if (elapsed >= 60) {
          console.log('⏰ Limite de 60s atteinte, arrêt automatique');
          stopRecording();
        }
      }, 100);

    } catch (err) {
      console.error('❌ Erreur démarrage enregistrement:', err);
      
      if (err.name === 'NotAllowedError') {
        setError('Permission microphone refusée. Veuillez autoriser l\'accès au microphone.');
      } else if (err.name === 'NotFoundError') {
        setError('Aucun microphone détecté sur cet appareil.');
      } else if (err.name === 'NotSupportedError') {
        setError('Enregistrement audio non supporté par ce navigateur.');
      } else {
        setError('Erreur lors du démarrage de l\'enregistrement: ' + err.message);
      }
      
      setIsRecording(false);
    }
  }, []);

  // Arrêter l'enregistrement
  const stopRecording = useCallback(() => {
    console.log('🛑 Arrêt enregistrement demandé...');
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      console.log('🛑 Arrêt du MediaRecorder...');
      mediaRecorderRef.current.stop();
    }
    
    setIsRecording(false);
  }, []);

  // Annuler l'enregistrement
  const cancelRecording = useCallback(() => {
    console.log('❌ Annulation enregistrement...');
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    // Arrêter le stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsRecording(false);
    setAudioBlob(null);
    setAudioDuration(0);
    setRecordingTime(0);
  }, []);

  // Supprimer l'enregistrement
  const deleteRecording = useCallback(() => {
    console.log('🗑️ Suppression enregistrement...');
    setAudioBlob(null);
    setAudioDuration(0);
    setRecordingTime(0);
  }, []);

  // Formater le temps en MM:SS
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
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
  };
};