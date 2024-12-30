import express from 'express';
import { TCDDController } from '../../controllers/TCDDController';
import { auth } from '../../middleware/auth';

const router = express.Router();

const tcddController = new TCDDController();

router.post('/search-trains', auth, tcddController.searchTrains);
router.get('/stations', auth, tcddController.getStationsMap);

export default router; 