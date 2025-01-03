"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SearchAlert_1 = __importDefault(require("../models/SearchAlert"));
const SearchAlertService_1 = __importDefault(require("../services/SearchAlertService"));
class SearchAlertController {
    constructor() {
        this.createSearchAlert = this.createSearchAlert.bind(this);
        this.deactivateSearchAlert = this.deactivateSearchAlert.bind(this);
        this.getUserSearchAlerts = this.getUserSearchAlerts.bind(this);
    }
    async createSearchAlert(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const searchAlert = await SearchAlertService_1.default.createSearchAlert(userId, {
                fromStationId: req.body.fromStationId,
                toStationId: req.body.toStationId,
                date: req.body.date,
                cabinClass: req.body.preferredCabinClass,
                departureTimeRange: req.body.departureTimeRange
            });
            res.status(201).json({
                message: 'Search alert created successfully',
                data: searchAlert
            });
        }
        catch (error) {
            console.error('Error creating search alert:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    async deactivateSearchAlert(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const searchAlert = await SearchAlert_1.default.findOne({
                _id: req.params.alertId,
                userId
            });
            if (!searchAlert) {
                return res.status(404).json({ message: 'Search alert not found' });
            }
            searchAlert.status = 'FAILED';
            searchAlert.isActive = false;
            searchAlert.statusReason = 'User declined the alert';
            await searchAlert.save();
            res.json({ message: 'Search alert deactivated successfully' });
        }
        catch (error) {
            console.error('Error deactivating search alert:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    async getUserSearchAlerts(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const searchAlerts = await SearchAlert_1.default.find({ userId, isActive: true })
                .sort({ createdAt: -1 });
            res.json({
                message: 'Search alerts retrieved successfully',
                data: searchAlerts
            });
        }
        catch (error) {
            console.error('Error retrieving search alerts:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}
exports.default = new SearchAlertController();
