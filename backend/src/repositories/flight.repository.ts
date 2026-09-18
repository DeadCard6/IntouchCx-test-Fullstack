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

export function normalizeCityOrCode(input?: string): string | undefined {
  if (!input || !input.trim()) return undefined;

  const rawTrimmed = input.trim();

  // 1. Extract airport code if enclosed in parentheses: e.g. "Cali (CLO)" -> "CLO"
  const parenthesizedMatch = rawTrimmed.match(/\(([A-Za-z]{3})\)/);
  if (parenthesizedMatch) {
    return parenthesizedMatch[1].toUpperCase();
  }

  // 2. Strip accents and normalize
  const normalized = rawTrimmed
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();

  // 3. Direct dictionary match
  if (CITY_CODE_MAP[normalized]) {
    return CITY_CODE_MAP[normalized];
  }

  // 4. Substring / partial search across city names
  for (const [key, code] of Object.entries(CITY_CODE_MAP)) {
    if (normalized.includes(key)) {
      return code;
    }
  }

  return normalized;
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

  async findByFlightNumber(rawFlightNumber: string) {
    if (!rawFlightNumber || !rawFlightNumber.trim()) return null;

    const raw = rawFlightNumber.trim().toUpperCase();

    // 1. Direct exact search: e.g. "AV-200"
    let flight = await prisma.flight.findUnique({
      where: { flightNumber: raw },
    });
    if (flight) return flight;

    // 2. Normalization for missing hyphens or spaces: e.g. "AV200" -> "AV-200", "AV 200" -> "AV-200"
    const autoHyphen = raw.replace(/\s+/g, '-').replace(/^([A-Z]{2})(\d+)$/, '$1-$2');
    flight = await prisma.flight.findUnique({
      where: { flightNumber: autoHyphen },
    });
    if (flight) return flight;

    // 3. Airline name replacement: e.g. "AVIANCA 200" -> "AV-200", "LATAM 201" -> "LA-201"
    const airlinePrefixMap: Record<string, string> = {
      AVIANCA: 'AV',
      LATAM: 'LA',
      WINGO: 'WN',
      CLIC: 'CL',
      SATENA: 'SA',
    };

    for (const [name, prefix] of Object.entries(airlinePrefixMap)) {
      if (raw.includes(name)) {
        const digits = raw.replace(/\D/g, '');
        if (digits) {
          flight = await prisma.flight.findUnique({
            where: { flightNumber: `${prefix}-${digits}` },
          });
          if (flight) return flight;
        }
      }
    }

    // 4. Fallback: Search containing the number or substring
    const match = await prisma.flight.findFirst({
      where: {
        OR: [
          { flightNumber: { contains: raw } },
          { flightNumber: { contains: autoHyphen } },
        ],
      },
    });

    return match;
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
