"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const CronJobService_1 = __importDefault(require("../services/CronJobService"));
// Run every 10 seconds
const schedule = '*/10 * * * * *';
let isRunning = false;
const searchAlertsCron = node_cron_1.default.schedule(schedule, async () => {
    if (isRunning) {
        console.log('[CronJob] Previous job still running, skipping this iteration');
        return;
    }
    console.log('\n----------------------------------------');
    console.log('[CronJob] Starting search alerts job');
    console.log('[CronJob] Time:', new Date().toISOString());
    console.log('----------------------------------------\n');
    isRunning = true;
    try {
        const startTime = Date.now();
        await CronJobService_1.default.processSearchAlerts();
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        console.log('\n----------------------------------------');
        console.log('[CronJob] Search alerts job completed');
        console.log(`[CronJob] Duration: ${duration.toFixed(2)} seconds`);
        console.log('[CronJob] Time:', new Date().toISOString());
        console.log('----------------------------------------\n');
    }
    catch (error) {
        console.error('[CronJob] Fatal error in search alerts job:', error);
    }
    finally {
        isRunning = false;
    }
});
exports.default = searchAlertsCron;
