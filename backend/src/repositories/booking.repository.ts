import { prisma } from '../config/database.js';

export class BookingRepository {
  async create(data: {
    pnr: string;
    userId: string;
    totalAmount: number;
    expiresAt: Date;
    passengers: {
      flightId: string;
      fullName: string;
      documentNumber: string;
      seatNumber?: string | null;
      seatClass: string;
    }[];
  }) {
    return prisma.booking.create({
      data: {
        pnr: data.pnr,
        userId: data.userId,
        totalAmount: data.totalAmount,
        expiresAt: data.expiresAt,
        status: 'PENDING',
        passengers: {
          create: data.passengers,
        },
      },
      include: {
        passengers: {
          include: {
            flight: true,
          },
        },
      },
    });
  }

  async findByPnr(pnr: string) {
    return prisma.booking.findUnique({
      where: { pnr: pnr.toUpperCase().trim() },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        passengers: {
          include: {
            flight: true,
          },
        },
        paymentSimulation: true,
      },
    });
  }

  async findByUserId(userId: string) {
    return prisma.booking.findMany({
      where: { userId },
      include: {
        passengers: {
          include: {
            flight: true,
          },
        },
        paymentSimulation: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async confirmBooking(
    bookingId: string,
    paymentData: {
      transactionId: string;
      cardLast4: string;
      cardHolder: string;
      amount: number;
      deliveryMethod: string;
    }
  ) {
    return prisma.$transaction([
      prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'CONFIRMED' },
      }),
      prisma.paymentSimulation.create({
        data: {
          bookingId,
          transactionId: paymentData.transactionId,
          cardLast4: paymentData.cardLast4,
          cardHolder: paymentData.cardHolder,
          amount: paymentData.amount,
          deliveryMethod: paymentData.deliveryMethod,
          status: 'COMPLETED',
        },
      }),
    ]);
  }

  async cancelBooking(bookingId: string) {
    return prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
    });
  }
}

export const bookingRepository = new BookingRepository();
