import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'L\'utilisateur est obligatoire']
    },
    title: {
        type: String,
        required: [true, 'Le titre est obligatoire'],
        trim: true,
        maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
    },
    message: {
        type: String,
        required: [true, 'Le message est obligatoire'],
        trim: true,
        maxlength: [500, 'Le message ne peut pas dépasser 500 caractères']
    },
    read: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        enum: ['info', 'success', 'warning', 'error'],
        default: 'info'
    }
}, {
    timestamps: true
});

// Index pour les requêtes fréquentes
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);


