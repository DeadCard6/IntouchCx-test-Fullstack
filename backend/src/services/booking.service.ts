import { bookingRepository } from '../repositories/booking.repository.js';
import { flightRepository } from '../repositories/flight.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { emailService } from './email.service.js';
import { generatePNR, generateTransactionId } from '../utils/pnr.util.js';
import { CreateBookingInput, SimulatePaymentInput } from '../types/index.js';

export class BookingService {
  async createReservation(userId: string, input: CreateBookingInput) {
    if (!input.passengers || input.passengers.length === 0) {
      throw { statusCode: 400, message: 'Se requiere al menos un pasajero para realizar la reserva' };
    }

    let totalAmount = 0;
    const flightMap: { [id: string]: number } = {};

    for (const p of input.passengers) {
      const flight = await flightRepository.findById(p.flightId);
      if (!flight) {
        throw { statusCode: 404, message: `Vuelo ${p.flightId} no encontrado` };
      }

      flightMap[p.flightId] = (flightMap[p.flightId] || 0) + 1;

      // Price calculation considering seat class multiplier
      let multiplier = 1.0;
      if (p.seatClass === 'BUSINESS') multiplier = 1.6;
      if (p.seatClass === 'FIRST') multiplier = 2.2;

      totalAmount += flight.price * multiplier;
    }

    // Check capacity
    for (const [flightId, neededSeats] of Object.entries(flightMap)) {
      const flight = await flightRepository.findById(flightId);
      if (flight && flight.availableSeats < neededSeats) {
        throw {
          statusCode: 400,
          message: `El vuelo ${flight.flightNumber} no tiene suficientes asientos disponibles`,
        };
      }
    }

    // 15-minute expiration hold (R8)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const pnr = generatePNR();

    const booking = await bookingRepository.create({
      pnr,
      userId,
      totalAmount,
      expiresAt,
      passengers: input.passengers.map((p) => ({
        flightId: p.flightId,
        fullName: p.fullName,
        documentNumber: p.documentNumber,
        seatNumber: p.seatNumber || null,
        seatClass: p.seatClass || 'ECONOMY',
      })),
    });

    // Temporarily reduce seats
    for (const [flightId, neededSeats] of Object.entries(flightMap)) {
      await flightRepository.decrementSeats(flightId, neededSeats);
    }

    return booking;
  }

  async getBookingByPnr(pnr: string) {
    const booking = await bookingRepository.findByPnr(pnr);
    if (!booking) {
      throw { statusCode: 404, message: 'Reserva no encontrada con ese código localizador (PNR)' };
    }
    return booking;
  }

  async getUserBookings(userId: string) {
    return bookingRepository.findByUserId(userId);
  }

  async processPayment(pnr: string, userId: string, paymentInput: SimulatePaymentInput) {
    const booking = await bookingRepository.findByPnr(pnr);
    if (!booking) {
      throw { statusCode: 404, message: 'Reserva no encontrada' };
    }

    if (booking.userId !== userId) {
      throw { statusCode: 403, message: 'No tienes autorización para pagar esta reserva' };
    }

    if (booking.status === 'CONFIRMED') {
      throw { statusCode: 400, message: 'Esta reserva ya ha sido pagada y confirmada anteriormente' };
    }

    if (booking.status === 'CANCELLED' || booking.status === 'EXPIRED') {
      throw { statusCode: 400, message: 'La reserva ya no se encuentra activa' };
    }

    // Verify 15-minute timeout (R8)
    const now = new Date();
    if (now > booking.expiresAt) {
      await bookingRepository.cancelBooking(booking.id);
      throw {
        statusCode: 400,
        code: 'BOOKING_EXPIRED',
        message: 'El tiempo límite de 15 minutos para completar la compra ha expirado',
      };
    }

    // Validate simulated card
    const cleanCard = paymentInput.cardNumber.replace(/\s+/g, '');
    if (cleanCard.length < 13 || cleanCard.length > 19) {
      throw { statusCode: 400, message: 'Número de tarjeta inválido para la simulación' };
    }

    const cardLast4 = cleanCard.slice(-4);
    const transactionId = generateTransactionId();

    // Confirm booking and create payment record
    await bookingRepository.confirmBooking(booking.id, {
      transactionId,
      cardLast4,
      cardHolder: paymentInput.cardHolder.toUpperCase(),
      amount: booking.totalAmount,
      deliveryMethod: paymentInput.deliveryMethod || 'EMAIL',
    });

    // Optionally save card info for future bookings
    if (paymentInput.saveCardForFuture) {
      await userRepository.update(userId, {
        savedCardNumber: `**** **** **** ${cardLast4}`,
        savedCardHolder: paymentInput.cardHolder.toUpperCase(),
        savedCardExpiry: paymentInput.expiryDate,
      });
    }

    // Send confirmation email simulation (R9)
    const passengerNames = booking.passengers.map((p) => p.fullName);
    const flightsSummary = booking.passengers
      .map((p) => `${p.flight.flightNumber} (${p.flight.origin} -> ${p.flight.destination})`)
      .join(', ');

    await emailService.sendBookingConfirmationEmail({
      to: booking.user.email,
      userName: booking.user.fullName,
      pnr: booking.pnr,
      flightDetails: flightsSummary,
      passengers: passengerNames,
      total: booking.totalAmount,
    });

    return {
      pnr: booking.pnr,
      status: 'CONFIRMED',
      transactionId,
      amount: booking.totalAmount,
      deliveryMethod: paymentInput.deliveryMethod || 'EMAIL',
      message: '¡Pago simulado exitoso! Billetes aéreos emitidos y confirmación enviada por correo.',
    };
  }
}

export const bookingService = new BookingService();
