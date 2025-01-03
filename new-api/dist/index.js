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
dotenv_1.default.config();
async function startServer() {
    try {
        (0, database_1.connectDatabase)().then(() => {
            console.log('Database connected');
            const app = (0, express_1.default)();
            app.use((0, morgan_1.default)('dev'));
            app.use(express_1.default.json());
            app.use('/api/v1', v1_1.default);
            app.use((err, req, res, next) => {
                console.error(err.stack);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                    error: env_1.env.NODE_ENV === 'development' ? err : undefined
                });
            });
            app.listen(env_1.env.PORT, () => {
                console.log(`Server is running on port ${env_1.env.PORT}`);
            });
            searchAlerts_cron_1.default.start();
            console.log('Search alerts cron job started');
        }).catch((error) => {
            console.error('Failed to connect to database:', error);
            process.exit(1);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Closing crawler and shutting down...');
    searchAlerts_cron_1.default.stop();
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('SIGINT received. Closing crawler and shutting down...');
    searchAlerts_cron_1.default.stop();
    process.exit(0);
});
startServer();
