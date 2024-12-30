import { Router } from 'express';
import SearchAlertController from '../../controllers/SearchAlertController';
import { authenticateToken } from '../../middleware/auth';

const router = Router();

router.post('/', authenticateToken, SearchAlertController.createSearchAlert);
router.get('/', authenticateToken, SearchAlertController.getUserSearchAlerts);
router.delete('/:searchId', authenticateToken, SearchAlertController.deactivateSearchAlert);

export default router; 