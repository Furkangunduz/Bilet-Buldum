import express from 'express';
import { ContactController } from '../../controllers/ContactController';
import { authenticateToken } from '../../middleware/auth';

const router = express.Router();

// Create a new contact message (requires authentication)
router.post('/messages', authenticateToken, ContactController.createMessage);

// Get all contact messages (admin only)
router.get('/messages', authenticateToken, ContactController.getMessages);

// Update message status (admin only)
router.patch('/messages/:id/status', authenticateToken, ContactController.updateMessageStatus);

export default router; 