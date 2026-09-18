import { Router } from 'express';
import {
  bookingController,
  createBookingSchema,
  simulatePaymentSchema,
} from '../controllers/booking.controller.js';
import { authenticateJwt } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';

const router = Router();

router.use(authenticateJwt);

router.post('/', validateBody(createBookingSchema), bookingController.createReservation);
router.get('/my-bookings', bookingController.getUserBookings);
router.get('/:pnr', bookingController.getBookingByPnr);
router.post('/:pnr/pay', validateBody(simulatePaymentSchema), bookingController.processPayment);

export default router;
