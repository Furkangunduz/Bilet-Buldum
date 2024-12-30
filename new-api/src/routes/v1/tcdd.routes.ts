import { Router } from 'express';
import { TCDDController } from '../../controllers/TCDDController';

const router = Router();
const tcddController = new TCDDController();

router.post('/search', tcddController.searchTrains);
router.get('/stations/departure', tcddController.getDepartureStations);
router.get('/stations/arrival/:departureStationId', tcddController.getArrivalStations);
router.get('/cabin-classes', tcddController.getCabinClasses);

export default router; 