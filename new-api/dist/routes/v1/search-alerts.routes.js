"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SearchAlertController_1 = __importDefault(require("../../controllers/SearchAlertController"));
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticateToken, SearchAlertController_1.default.createSearchAlert);
router.get('/', auth_1.authenticateToken, SearchAlertController_1.default.getUserSearchAlerts);
router.delete('/:alertId', auth_1.authenticateToken, SearchAlertController_1.default.deactivateSearchAlert);
exports.default = router;
