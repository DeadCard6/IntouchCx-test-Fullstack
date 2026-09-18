import { prisma } from '../config/database.js';
import { FlightQueryFilters } from '../types/index.js';

const CITY_CODE_MAP: Record<string, string> = {
  BOGOTA: 'BOG',
  BOG: 'BOG',
  MEDELLIN: 'MDE',
  RIONEGRO: 'MDE',
  MDE: 'MDE',
  CALI: 'CLO',
  CLO: 'CLO',
  CARTAGENA: 'CTG',
  CTG: 'CTG',
  BARRANQUILLA: 'BAQ',
  BAQ: 'BAQ',
  SANTAMARTA: 'SMR',
  'SANTA MARTA': 'SMR',
  SMR: 'SMR',
  BUCARAMANGA: 'BGA',
  BGA: 'BGA',
  PEREIRA: 'PEI',
  PEI: 'PEI',
  CUCUTA: 'CUC',
  CUC: 'CUC',
  SANANDRES: 'ADZ',
  'SAN ANDRES': 'ADZ',
  ADZ: 'ADZ',
  LETICIA: 'LET',
  LET: 'LET',
  MONTERIA: 'MTR',
  MTR: 'MTR',
  ARMENIA: 'AXM',
  AXM: 'AXM',
  PASTO: 'PSO',
  PSO: 'PSO',
  VALLEDUPAR: 'VUP',
  VUP: 'VUP',
  NEIVA: 'NVA',
  NVA: 'NVA',
  MIAMI: 'MIA',
  MIA: 'MIA',
  MADRID: 'MAD',
  MAD: 'MAD',
};

function normalizeCityOrCode(input?: string): string | undefined {
  if (!input || !input.trim()) return undefined;
  
  // Strip accents (e.g. Bogotá -> BOGOTA, Medellín -> MEDELLIN)
  const normalized = input
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();

  return CITY_CODE_MAP[normalized] || normalized;
}

export class FlightRepository {
  async findAll(filters: FlightQueryFilters) {
    const where: any = {};

    const normalizedOrigin = normalizeCityOrCode(filters.origin);
    if (normalizedOrigin) {
      where.origin = normalizedOrigin;
    }

    const normalizedDest = normalizeCityOrCode(filters.destination);
    if (normalizedDest) {
      where.destination = normalizedDest;
    }

    if (filters.airline && filters.airline.trim()) {
      const air = filters.airline.trim();
      // Match case-insensitive in SQLite
      where.airline = { contains: air };
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
      where: { flightNumber: flightNumber.trim().toUpperCase() },
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
