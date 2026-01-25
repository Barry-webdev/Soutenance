// services/transcriptionService.js
import OpenAI from 'openai';
import fetch from 'node-fetch';

class TranscriptionService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    /**
     * Transcrire un fichier audio avec OpenAI Whisper
     */
    async transcribeAudio(audioUrl, language = 'fr') {
        try {
            console.log('🎵 Début transcription audio:', audioUrl);

            if (!process.env.OPENAI_API_KEY) {
                throw new Error('Clé API OpenAI non configurée');
            }

            // Télécharger le fichier audio depuis Cloudinary
            const response = await fetch(audioUrl);
            if (!response.ok) {
                throw new Error('Impossible de télécharger le fichier audio');
            }

            const audioBuffer = await response.buffer();
            console.log('📥 Audio téléchargé:', audioBuffer.length, 'bytes');

            // Créer un fichier temporaire pour Whisper
            const audioFile = new File([audioBuffer], 'audio.mp3', {
                type: 'audio/mp3'
            });

            // Mapper les codes de langue
            const languageMap = {
                'fr': 'fr',      // Français
                'ff': 'fr',      // Peul -> Français (Whisper ne supporte pas le Peul)
                'sus': 'fr',     // Soussou -> Français
                'man': 'fr'      // Malinké -> Français
            };

            const whisperLanguage = languageMap[language] || 'fr';

            // Transcription avec Whisper
            const transcription = await this.openai.audio.transcriptions.create({
                file: audioFile,
                model: 'whisper-1',
                language: whisperLanguage,
                response_format: 'json',
                temperature: 0.2 // Plus conservateur pour une meilleure précision
            });

            console.log('✅ Transcription réussie:', transcription.text);

            // Détecter la langue automatiquement si possible
            const detectedLanguage = await this.detectLanguage(transcription.text);

            return {
                text: transcription.text,
                detectedLanguage: detectedLanguage,
                confidence: 'high', // Whisper ne fournit pas de score de confiance
                duration: null // Whisper ne fournit pas la durée
            };

        } catch (error) {
            console.error('❌ Erreur transcription:', error);
            throw new Error(`Erreur lors de la transcription: ${error.message}`);
        }
    }

    /**
     * Détecter la langue d'un texte (basique)
     */
    async detectLanguage(text) {
        try {
            // Mots-clés pour détecter les langues locales
            const languageKeywords = {
                'ff': ['fulfulde', 'peul', 'haal', 'pulaar'], // Peul
                'sus': ['susu', 'soussou', 'soso'], // Soussou
                'man': ['maninka', 'malinke', 'mandingo'], // Malinké
                'fr': ['le', 'la', 'les', 'de', 'du', 'des', 'et', 'ou', 'avec'] // Français
            };

            const textLower = text.toLowerCase();
            
            // Compter les occurrences de mots-clés
            let scores = {};
            for (const [lang, keywords] of Object.entries(languageKeywords)) {
                scores[lang] = keywords.filter(keyword => 
                    textLower.includes(keyword)
                ).length;
            }

            // Retourner la langue avec le plus de correspondances
            const detectedLang = Object.keys(scores).reduce((a, b) => 
                scores[a] > scores[b] ? a : b
            );

            return scores[detectedLang] > 0 ? detectedLang : 'fr';

        } catch (error) {
            console.error('❌ Erreur détection langue:', error);
            return 'fr'; // Fallback vers français
        }
    }

    /**
     * Vérifier si le service est configuré
     */
    static isConfigured() {
        return !!process.env.OPENAI_API_KEY;
    }

    /**
     * Obtenir les langues supportées
     */
    static getSupportedLanguages() {
        return [
            { code: 'fr', name: 'Français', native: 'Français' },
            { code: 'ff', name: 'Peul', native: 'Fulfulde' },
            { code: 'sus', name: 'Soussou', native: 'Sosoxui' },
            { code: 'man', name: 'Malinké', native: 'Maninka' }
        ];
    }
}

export default TranscriptionService;