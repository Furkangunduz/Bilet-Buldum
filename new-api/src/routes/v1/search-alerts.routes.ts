import { Router } from 'express';
import SearchAlertController from '../../controllers/SearchAlertController';
import { authenticateToken } from '../../middleware/auth';

const router = Router();

router.post('/', authenticateToken, SearchAlertController.createSearchAlert);
router.get('/', authenticateToken, SearchAlertController.getUserSearchAlerts);
router.post('/:alertId/decline', authenticateToken, SearchAlertController.declineSearchAlert);
router.delete('/:alertId', authenticateToken, SearchAlertController.deleteSearchAlert);

export default router; 