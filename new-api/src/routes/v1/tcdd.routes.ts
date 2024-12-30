import { Router } from 'express';
import { TCDDController } from '../../controllers/TCDDController';

const router = Router();
const tcddController = new TCDDController();

// Search trains
router.post('/search', tcddController.searchTrains);

// Get all departure stations
router.get('/stations/departure', tcddController.getDepartureStations);

// Get arrival stations for a specific departure station
router.get('/stations/arrival/:departureStationId', tcddController.getArrivalStations);

// Get available cabin classes
router.get('/cabin-classes', tcddController.getCabinClasses);

export default router; 