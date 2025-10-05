// models/ExportHistory.js
import mongoose from 'mongoose';

const exportHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    exportType: {
        type: String,
        required: true,
        enum: [
            'waste_reports',
            'collaborations', 
            'users',
            'audit_logs',
            'statistics'
        ]
    },
    fileName: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    filters: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'completed'
    },
    downloadUrl: {
        type: String
    }
}, {
    timestamps: true
});

export default mongoose.model('ExportHistory', exportHistorySchema);