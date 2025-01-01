"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const TCDDController_1 = require("../controllers/TCDDController");
const SearchAlert_1 = __importDefault(require("../models/SearchAlert"));
const NotificationService_1 = __importDefault(require("./NotificationService"));
class CronJobService {
    constructor() {
        this.tcddController = new TCDDController_1.TCDDController();
    }
    static getInstance() {
        if (!CronJobService.instance) {
            CronJobService.instance = new CronJobService();
        }
        return CronJobService.instance;
    }
    async getActiveSearchAlerts() {
        const alerts = await SearchAlert_1.default.find({
            isActive: true,
            departureTimeRange: { $ne: null }
        })
            .sort({ createdAt: 1 })
            .lean();
        console.log(`[SearchAlerts] Found ${alerts.length} active alerts`);
        return alerts;
    }
    groupSearchAlerts(searchAlerts) {
        const grouped = (0, lodash_1.groupBy)(searchAlerts, (alert) => `${alert.fromStationId}-${alert.toStationId}-${alert.date}`);
        console.log(`[SearchAlerts] Created ${Object.keys(grouped).length} groups from ${searchAlerts.length} alerts`);
        return grouped;
    }
    async processSearchGroup(alerts) {
        const firstAlert = alerts[0];
        if (!firstAlert.departureTimeRange)
            return;
        console.log(`[SearchAlerts] Processing ${alerts.length} alerts for ${firstAlert.fromStationId} -> ${firstAlert.toStationId} (${firstAlert.date})`);
        try {
            const dateParts = firstAlert.date.split(' ')[0].split('-');
            const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]} 00:00:00`;
            const searchPayload = {
                fromStationId: firstAlert.fromStationId,
                toStationId: firstAlert.toStationId,
                date: formattedDate,
                passengerCount: 1,
                departureTimeRange: firstAlert.departureTimeRange,
                preferredCabinClass: firstAlert.cabinClass,
                wantHighSpeedTrain: true
            };
            const searchResult = await this.tcddController.searchTrainsDirectly(searchPayload);
            for (const alert of alerts) {
                const now = new Date();
                const searchDate = new Date(alert.date.replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$2-$1'));
                if (searchDate < now) {
                    await SearchAlert_1.default.findByIdAndUpdate(alert._id, {
                        isActive: false,
                        status: 'FAILED',
                        lastChecked: now,
                        statusReason: 'Search date has passed'
                    });
                    await NotificationService_1.default.sendPushNotification(alert.userId, 'Search Alert Expired', `Your search alert for ${alert.fromStationId} to ${alert.toStationId} on ${alert.date} has expired.`);
                    console.log(`[SearchAlerts] Alert ${alert._id} expired - past date`);
                    continue;
                }
                await SearchAlert_1.default.findByIdAndUpdate(alert._id, { lastChecked: now });
                if ((searchResult === null || searchResult === void 0 ? void 0 : searchResult.data) && (searchResult === null || searchResult === void 0 ? void 0 : searchResult.data.length) > 0) {
                    await SearchAlert_1.default.findByIdAndUpdate(alert._id, {
                        isActive: false,
                        status: 'COMPLETED',
                        statusReason: 'Seats found'
                    });
                    await NotificationService_1.default.sendPushNotification(alert.userId, 'Seats Available!', `We found seats for your journey from ${alert.fromStationId} to ${alert.toStationId} on ${alert.date}. Book now!`, {
                        type: 'SEATS_FOUND',
                        fromStationId: alert.fromStationId,
                        toStationId: alert.toStationId,
                        date: alert.date,
                        cabinClass: alert.cabinClass
                    });
                    console.log(`[SearchAlerts] Alert ${alert._id} completed - seats found`);
                }
            }
        }
        catch (error) {
            console.error('[SearchAlerts] Error processing search group:', error);
            for (const alert of alerts) {
                await SearchAlert_1.default.findByIdAndUpdate(alert._id, {
                    isActive: false,
                    status: 'FAILED',
                    statusReason: 'Search failed due to technical error'
                });
                console.log(`[SearchAlerts] Alert ${alert._id} failed - technical error`);
            }
        }
    }
    async processSearchAlerts() {
        console.log('\n[SearchAlerts] Starting search alerts processing');
        try {
            const activeAlerts = await this.getActiveSearchAlerts();
            if (!activeAlerts.length) {
                console.log('[SearchAlerts] No active alerts found');
                return;
            }
            const groupedAlerts = this.groupSearchAlerts(activeAlerts);
            let groupIndex = 1;
            const totalGroups = Object.keys(groupedAlerts).length;
            for (const [key, alerts] of Object.entries(groupedAlerts)) {
                console.log(`[SearchAlerts] Processing group ${groupIndex}/${totalGroups}`);
                await this.processSearchGroup(alerts);
                groupIndex++;
            }
            console.log('[SearchAlerts] Completed processing all groups');
        }
        catch (error) {
            console.error('[SearchAlerts] Error processing search alerts:', error);
        }
    }
}
exports.default = CronJobService.getInstance();
