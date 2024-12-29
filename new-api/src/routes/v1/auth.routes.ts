import express from 'express';
import { AuthController } from '../../controllers/AuthController';
import { auth } from '../../middleware/auth';

const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/profile', auth, AuthController.getProfile);

export default router; 