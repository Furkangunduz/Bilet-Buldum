"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_routes_1 = __importDefault(require("./auth.routes"));
const crawler_routes_1 = __importDefault(require("./crawler.routes"));
const search_alerts_routes_1 = __importDefault(require("./search-alerts.routes"));
const tcdd_routes_1 = __importDefault(require("./tcdd.routes"));
const router = express_1.default.Router();
router.use('/auth', auth_routes_1.default);
router.use('/crawler', crawler_routes_1.default);
router.use('/search-alerts', search_alerts_routes_1.default);
router.use('/tcdd', tcdd_routes_1.default);
exports.default = router;
