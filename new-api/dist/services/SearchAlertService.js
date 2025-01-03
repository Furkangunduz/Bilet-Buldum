"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SearchAlert_1 = __importDefault(require("../models/SearchAlert"));
class SearchAlertService {
    constructor() { }
    static getInstance() {
        if (!SearchAlertService.instance) {
            SearchAlertService.instance = new SearchAlertService();
        }
        return SearchAlertService.instance;
    }
    async createSearchAlert(userId, searchData) {
        const searchAlert = new SearchAlert_1.default(Object.assign(Object.assign({ userId }, searchData), { isActive: true }));
        await searchAlert.save();
        return searchAlert;
    }
    async deactivateSearchAlert(searchId) {
        const searchAlert = await SearchAlert_1.default.findById(searchId);
        if (!searchAlert) {
            throw new Error('Search alert not found');
        }
        searchAlert.isActive = false;
        searchAlert.status = 'FAILED';
        searchAlert.statusReason = 'User declined the alert';
        await searchAlert.save();
        return searchAlert;
    }
}
exports.default = SearchAlertService.getInstance();
