export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  savedCardNumber?: string;
  savedCardHolder?: string;
  savedCardExpiry?: string;
}

export interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  status: 'ON_TIME' | 'DELAYED' | 'BOARDING' | 'CANCELLED';
  isDirect: boolean;
  stopsCount: number;
  stopsInfo?: string | null;
  availableSeats: number;
  totalSeats: number;
  aircraftModel: string;
}

export interface BookingPassenger {
  id: string;
  flightId: string;
  flight: Flight;
  fullName: string;
  documentNumber: string;
  seatNumber?: string;
  seatClass: 'ECONOMY' | 'BUSINESS' | 'FIRST';
}

export interface PaymentSimulation {
  id: string;
  transactionId: string;
  cardLast4: string;
  cardHolder: string;
  amount: number;
  deliveryMethod: string;
  status: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  pnr: string;
  userId: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';
  totalAmount: number;
  expiresAt: string;
  createdAt: string;
  passengers: BookingPassenger[];
  paymentSimulation?: PaymentSimulation;
}
