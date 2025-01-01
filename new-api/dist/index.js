"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const database_1 = require("./config/database");
const env_1 = require("./config/env");
const searchAlerts_cron_1 = __importDefault(require("./cron/searchAlerts.cron"));
const v1_1 = __importDefault(require("./routes/v1"));
const CrawlerService_1 = require("./services/CrawlerService");
dotenv_1.default.config();
const app = (0, express_1.default)();
const crawlerService = new CrawlerService_1.CrawlerService();
// Middleware
app.use((0, morgan_1.default)('dev')); // Log requests to the console
app.use(express_1.default.json());
// Routes
app.use('/api/v1', v1_1.default);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: env_1.env.NODE_ENV === 'development' ? err : undefined
    });
});
async function runCrawler() {
    try {
        console.log('Starting crawler...');
        const results = await crawlerService.crawl();
        console.log('Crawler results:', results);
    }
    catch (error) {
        console.error('Crawler error:', error);
    }
}
async function startServer() {
    try {
        await (0, database_1.connectDatabase)();
        app.listen(env_1.env.PORT, () => {
            console.log(`Server is running on port ${env_1.env.PORT}`);
        });
        searchAlerts_cron_1.default.start();
        console.log('Search alerts cron job started');
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Closing crawler and shutting down...');
    await crawlerService.close();
    searchAlerts_cron_1.default.stop();
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('SIGINT received. Closing crawler and shutting down...');
    await crawlerService.close();
    searchAlerts_cron_1.default.stop();
    process.exit(0);
});
startServer();
