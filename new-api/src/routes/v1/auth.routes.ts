import express from 'express';
import AuthController from '../../controllers/AuthController';
import { authenticateToken } from '../../middleware/auth';

const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/profile', authenticateToken, AuthController.getProfile);
router.put('/profile', authenticateToken, AuthController.updateProfile);
router.put('/profile/notifications', authenticateToken, AuthController.updateNotificationPreferences);
router.put('/profile/password', authenticateToken, AuthController.updatePassword);
router.put('/push-token', authenticateToken, AuthController.updatePushToken);
router.delete('/push-token', AuthController.removePushToken);
router.post('/test-notification', AuthController.testNotification);
router.post('/complete-onboarding', authenticateToken, AuthController.completeOnboarding);
router.delete('/profile', authenticateToken, AuthController.deleteAccount);

export default router; 