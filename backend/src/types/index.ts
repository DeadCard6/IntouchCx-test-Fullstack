import { Request } from 'express';

export interface AuthUserPayload {
  userId: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

export interface FlightQueryFilters {
  origin?: string;
  destination?: string;
  date?: string;
  airline?: string;
  seatClass?: string;
  onlyDirect?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'departure_asc' | 'duration_asc';
}

export interface CreateBookingPassengerInput {
  flightId: string;
  fullName: string;
  documentNumber: string;
  seatNumber?: string;
  seatClass?: 'ECONOMY' | 'BUSINESS' | 'FIRST';
}

export interface CreateBookingInput {
  passengers: CreateBookingPassengerInput[];
}

export interface SimulatePaymentInput {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  saveCardForFuture?: boolean;
  deliveryMethod?: 'EMAIL' | 'AIRPORT_COUNTER';
}
