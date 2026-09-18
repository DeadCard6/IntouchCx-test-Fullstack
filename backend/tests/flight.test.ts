import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('Flight Queries, Schedules & Tariffs API (R1, R5, R6)', () => {
  let sampleFlightId: string;
  let sampleFlightNumber: string;

  it('GET /api/flights should list all available flights', async () => {
    const res = await request(app).get('/api/flights');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);

    const firstFlight = res.body.data[0];
    sampleFlightId = firstFlight.id;
    sampleFlightNumber = firstFlight.flightNumber;

    expect(firstFlight).toHaveProperty('flightNumber');
    expect(firstFlight).toHaveProperty('origin');
    expect(firstFlight).toHaveProperty('destination');
    expect(firstFlight).toHaveProperty('price');
    expect(firstFlight).toHaveProperty('availableSeats');
  });

  it('GET /api/flights with code filter (BOG to MDE)', async () => {
    const res = await request(app).get('/api/flights?origin=BOG&destination=MDE');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    res.body.data.forEach((flight: any) => {
      expect(flight.origin).toBe('BOG');
      expect(flight.destination).toBe('MDE');
    });
  });

  it('GET /api/flights with full city names (Cali to Cartagena)', async () => {
    const res = await request(app).get('/api/flights?origin=Cali&destination=Cartagena');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    res.body.data.forEach((flight: any) => {
      expect(flight.origin).toBe('CLO');
      expect(flight.destination).toBe('CTG');
    });
  });

  it('GET /api/flights with parenthesized names (Medellin (MDE) to Barranquilla (BAQ))', async () => {
    const res = await request(app).get('/api/flights?origin=Medellin%20(MDE)&destination=Barranquilla%20(BAQ)');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    res.body.data.forEach((flight: any) => {
      expect(flight.origin).toBe('MDE');
      expect(flight.destination).toBe('BAQ');
    });
  });

  it('GET /api/flights with onlyDirect=true filter', async () => {
    const res = await request(app).get('/api/flights?onlyDirect=true');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    res.body.data.forEach((flight: any) => {
      expect(flight.isDirect).toBe(true);
    });
  });

  it('GET /api/flights?sortBy=price_asc should order flights by cost ascending (R5)', async () => {
    const res = await request(app).get('/api/flights?sortBy=price_asc');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const prices = res.body.data.map((f: any) => f.price);
    for (let i = 0; i < prices.length - 1; i++) {
      expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
    }
  });

  it('GET /api/flights?sortBy=price_desc should order flights by cost descending', async () => {
    const res = await request(app).get('/api/flights?sortBy=price_desc');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const prices = res.body.data.map((f: any) => f.price);
    for (let i = 0; i < prices.length - 1; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i + 1]);
    }
  });

  it('GET /api/flights/status/:flightNumber should return flight status and delays (R6)', async () => {
    const res = await request(app).get(`/api/flights/status/${sampleFlightNumber}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.flightNumber).toBe(sampleFlightNumber);
    expect(['ON_TIME', 'DELAYED', 'BOARDING', 'CANCELLED']).toContain(res.body.data.status);
  });

  it('GET /api/flights/status should normalize flight numbers without hyphen (e.g. AV200)', async () => {
    const cleanNumber = sampleFlightNumber.replace('-', '');
    const res = await request(app).get(`/api/flights/status/${cleanNumber}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.flightNumber).toBe(sampleFlightNumber);
  });

  it('GET /api/flights/status/INVALID-9999 should return 404', async () => {
    const res = await request(app).get('/api/flights/status/INVALID-9999');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/flights/:id should return flight details by ID', async () => {
    const res = await request(app).get(`/api/flights/${sampleFlightId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(sampleFlightId);
  });
});
