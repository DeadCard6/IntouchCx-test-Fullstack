import { Response, NextFunction } from 'express';
import { bookingService } from '../services/booking.service.js';
import { AuthenticatedRequest } from '../types/index.js';
import { z } from 'zod';

export const createBookingSchema = z.object({
  passengers: z
    .array(
      z.object({
        flightId: z.string().uuid('ID de vuelo inválido'),
        fullName: z.string().min(2, 'El nombre completo del pasajero es requerido'),
        documentNumber: z.string().min(4, 'El documento de identidad es requerido'),
        seatNumber: z.string().optional(),
        seatClass: z.enum(['ECONOMY', 'BUSINESS', 'FIRST']).default('ECONOMY'),
      })
    )
    .min(1, 'Debe incluir al menos un pasajero'),
});

export const simulatePaymentSchema = z.object({
  cardNumber: z.string().min(13, 'Número de tarjeta inválido'),
  cardHolder: z.string().min(2, 'Nombre del titular requerido'),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Formato de expiración debe ser MM/YY'),
  cvv: z.string().min(3).max(4, 'CVV debe tener 3 o 4 dígitos'),
  saveCardForFuture: z.boolean().optional(),
  deliveryMethod: z.enum(['EMAIL', 'AIRPORT_COUNTER']).default('EMAIL'),
});

export class BookingController {
  async createReservation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const booking = await bookingService.createReservation(req.user!.userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Reserva creada exitosamente. Tienes 15 minutos para completar el pago.',
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBookingByPnr(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { pnr } = req.params;
      const booking = await bookingService.getBookingByPnr(pnr);
      res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserBookings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const bookings = await bookingService.getUserBookings(req.user!.userId);
      res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  }

  async processPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { pnr } = req.params;
      const result = await bookingService.processPayment(pnr, req.user!.userId, req.body);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const bookingController = new BookingController();
