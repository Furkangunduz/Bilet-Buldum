"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const searchAlertSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fromStationId: {
        type: String,
        required: true
    },
    toStationId: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    cabinClass: {
        type: String,
        required: true
    },
    departureTimeRange: {
        start: {
            type: String,
            required: true
        },
        end: {
            type: String,
            required: true
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED'],
        default: 'PENDING'
    },
    statusReason: {
        type: String,
        default: null
    },
    lastChecked: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});
searchAlertSchema.index({ fromStationId: 1, toStationId: 1, date: 1 });
const SearchAlert = mongoose_1.default.model('SearchAlert', searchAlertSchema);
exports.default = SearchAlert;
