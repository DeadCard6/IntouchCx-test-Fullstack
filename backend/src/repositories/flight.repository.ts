import { prisma } from '../config/database.js';
import { FlightQueryFilters } from '../types/index.js';

export class FlightRepository {
  async findAll(filters: FlightQueryFilters) {
    const where: any = {};

    if (filters.origin) {
      where.origin = filters.origin.toUpperCase().trim();
    }

    if (filters.destination) {
      where.destination = filters.destination.toUpperCase().trim();
    }

    if (filters.airline) {
      where.airline = { contains: filters.airline };
    }

    if (filters.onlyDirect !== undefined) {
      where.isDirect = filters.onlyDirect;
    }

    if (filters.date) {
      const searchDate = new Date(filters.date);
      const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));
      where.departureTime = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    let orderBy: any = { departureTime: 'asc' };
    if (filters.sortBy === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (filters.sortBy === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (filters.sortBy === 'departure_asc') {
      orderBy = { departureTime: 'asc' };
    }

    return prisma.flight.findMany({
      where,
      orderBy,
    });
  }

  async findById(id: string) {
    return prisma.flight.findUnique({
      where: { id },
    });
  }

  async findByFlightNumber(flightNumber: string) {
    return prisma.flight.findUnique({
      where: { flightNumber },
    });
  }

  async decrementSeats(flightId: string, count: number) {
    return prisma.flight.update({
      where: { id: flightId },
      data: {
        availableSeats: {
          decrement: count,
        },
      },
    });
  }
}

export const flightRepository = new FlightRepository();
