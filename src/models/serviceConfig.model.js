import mongoose from "mongoose";

const serviceConfigSchema = new mongoose.Schema({
    serviceName: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    config: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
}, { timestamps: true });

const ServiceConfig = mongoose.model('ServiceConfig', serviceConfigSchema);
