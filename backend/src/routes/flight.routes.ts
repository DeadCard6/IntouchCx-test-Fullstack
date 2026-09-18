import { Router } from 'express';
import { flightController } from '../controllers/flight.controller.js';

const router = Router();

router.get('/', flightController.searchFlights);
router.get('/status/:flightNumber', flightController.getFlightStatus);
router.get('/:id', flightController.getFlightById);

export default router;
