import mongoose from 'mongoose';

const wasteReportSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'L\'utilisateur est obligatoire']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'La description ne peut pas dépasser 500 caractères'],
        validate: {
            validator: function() {
                // Description OU audio requis (pas les deux obligatoires)
                const hasDescription = this.description && this.description.trim().length > 0;
                const hasAudio = this.audio?.url;
                return hasDescription || hasAudio;
            },
            message: 'Une description écrite ou un enregistrement vocal est requis'
        }
    },
    images: {
        original: {
            url: {
                type: String,
                required: false
            },
            filename: {
                type: String,
                required: false
            },
            size: {
                type: Number, // Taille en bytes
                required: false
            },
            dimensions: {
                width: {
                    type: Number,
                    required: false
                },
                height: {
                    type: Number,
                    required: false
                }
            },
            mimeType: {
                type: String,
                required: false
            }
        },
        thumbnail: {
            url: {
                type: String,
                required: false
            },
            filename: {
                type: String,
                required: false
            },
            size: {
                type: Number,
                required: false
            },
            dimensions: {
                width: {
                    type: Number,
                    required: false
                },
                height: {
                    type: Number,
                    required: false
                }
            }
        },
        medium: {
            url: {
                type: String,
                required: false
            },
            filename: {
                type: String,
                required: false
            },
            size: {
                type: Number,
                required: false
            },
            dimensions: {
                width: {
                    type: Number,
                    required: false
                },
                height: {
                    type: Number,
                    required: false
                }
            }
        }
    },
    audio: {
        url: {
            type: String,
            required: false
        },
        publicId: {
            type: String,
            required: false
        },
        duration: {
            type: Number, // Durée en secondes
            required: false,
            min: 1,
            max: 60
        },
        size: {
            type: Number, // Taille en bytes
            required: false
        },
        mimeType: {
            type: String,
            required: false,
            default: 'audio/webm'
        },
        transcription: {
            type: String,
            required: false,
            maxlength: [1000, 'La transcription ne peut pas dépasser 1000 caractères']
        },
        language: {
            type: String,
            required: false,
            enum: ['fr', 'ff', 'sus', 'man'], // Français, Peul, Soussou, Malinké
            default: 'fr'
        },
        transcribedAt: {
            type: Date,
            required: false
        },
        transcribedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false
        }
    },
    location: {
        lat: {
            type: Number,
            required: [true, 'La latitude est obligatoire'],
            min: -90,
            max: 90
        },
        lng: {
            type: Number,
            required: [true, 'La longitude est obligatoire'],
            min: -180,
            max: 180
        }
    },
    status: {
        type: String,
        enum: ['pending', 'collected', 'not_collected'],
        default: 'pending'
    },
    wasteType: {
        type: String,
        required: [true, 'Le type de déchet est obligatoire'],
        enum: ['plastique', 'verre', 'métal', 'organique', 'papier', 'dangereux', 'autre']
    }
}, {
    timestamps: true
});

// Index pour les requêtes géospatiales
wasteReportSchema.index({ location: '2dsphere' });

// Index pour les statistiques
wasteReportSchema.index({ createdAt: 1 });
wasteReportSchema.index({ status: 1 });
wasteReportSchema.index({ wasteType: 1 });

export default mongoose.model('WasteReport', wasteReportSchema);