"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrawlerController = void 0;
const BaseController_1 = require("./BaseController");
class CrawlerController extends BaseController_1.BaseController {
    constructor(crawlerService) {
        super();
        this.crawlerService = crawlerService;
        this.crawl = async (req, res) => {
            var _a;
            try {
                const { url } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!url) {
                    this.sendError(res, new Error('URL is required'), 400);
                    return;
                }
                try {
                    const result = await this.crawlerService.crawl(url);
                    this.sendSuccess(res, result);
                }
                catch (error) {
                    throw error;
                }
            }
            catch (error) {
                this.sendError(res, error);
            }
        };
        this.getSearchHistory = async (req, res) => {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            }
            catch (error) {
                this.sendError(res, error);
            }
        };
        this.getAllStations = async (_req, res) => {
            try {
                await this.crawlerService.getAllStationsAndDestinations();
                this.sendSuccess(res, { message: 'Stations map has been generated successfully. Check stations_map.json file.' });
            }
            catch (error) {
                if (error instanceof Error) {
                    this.sendError(res, error);
                }
                else {
                    this.sendError(res, new Error('An unknown error occurred'));
                }
            }
        };
    }
}
exports.CrawlerController = CrawlerController;
