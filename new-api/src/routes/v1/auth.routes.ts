import express from 'express';
import { AuthController } from '../../controllers/AuthController';
import { auth } from '../../middleware/auth';

const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/profile', auth, AuthController.getProfile);
router.put('/profile', auth, AuthController.updateProfile);
router.put('/profile/notifications', auth, AuthController.updateNotificationPreferences);
router.put('/profile/password', auth, AuthController.updatePassword);

export default router; 