"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AuthController_1 = __importDefault(require("../../controllers/AuthController"));
const auth_1 = require("../../middleware/auth");
const router = express_1.default.Router();
router.post('/register', AuthController_1.default.register);
router.post('/login', AuthController_1.default.login);
router.get('/profile', auth_1.authenticateToken, AuthController_1.default.getProfile);
router.put('/profile', auth_1.authenticateToken, AuthController_1.default.updateProfile);
router.put('/profile/notifications', auth_1.authenticateToken, AuthController_1.default.updateNotificationPreferences);
router.put('/profile/password', auth_1.authenticateToken, AuthController_1.default.updatePassword);
router.put('/push-token', auth_1.authenticateToken, AuthController_1.default.updatePushToken);
exports.default = router;
