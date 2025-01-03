"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const CrawlerController_1 = require("../../controllers/CrawlerController");
const auth_1 = require("../../middleware/auth");
const CrawlerService_1 = require("../../services/CrawlerService");
const router = express_1.default.Router();
// Initialize services
const crawlerService = new CrawlerService_1.CrawlerService();
// Initialize controller
const crawlerController = new CrawlerController_1.CrawlerController(crawlerService);
// Routes
router.post('/crawl', auth_1.authenticateToken, crawlerController.crawl);
router.get('/history', auth_1.authenticateToken, crawlerController.getSearchHistory);
exports.default = router;
