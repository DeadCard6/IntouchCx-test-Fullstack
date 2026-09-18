import { Router } from 'express';
import authRoutes from './auth.routes.js';
import flightRoutes from './flight.routes.js';
import bookingRoutes from './booking.routes.js';
import healthRoutes from './health.routes.js';

const apiRouter = Router();

apiRouter.use('/health', healthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/flights', flightRoutes);
apiRouter.use('/bookings', bookingRoutes);

export default apiRouter;
