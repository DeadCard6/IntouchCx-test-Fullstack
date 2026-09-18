import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/config/database.js';

const app = createApp();

describe('🎫 Bookings, Multi-Passenger & Payment Simulation API (R2, R3, R8, R9)', () => {
  let authToken: string;
  let testUserId: string;
  let sampleFlight: any;
  let createdPnr: string;

  beforeAll(async () => {
    // 1. Create a test user and get JWT
    const regRes = await request(app).post('/api/auth/register').send({
      email: `booking-tester-${Date.now()}@intouchcx.com`,
      password: 'SecurePassword123!',
      fullName: 'David Tester',
    });

    authToken = regRes.body.data.token;
    testUserId = regRes.body.data.user.id;

    // 2. Fetch an existing flight from seeded DB
    sampleFlight = await prisma.flight.findFirst();
  });

  afterAll(async () => {
    try {
      await prisma.user.delete({ where: { id: testUserId } });
    } catch {}
  });

  it('POST /api/bookings should create a multi-passenger reservation with 15m hold (R2, R8)', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        passengers: [
          {
            flightId: sampleFlight.id,
            fullName: 'David Tester',
            documentNumber: 'CC10203040',
            seatNumber: '14A',
            seatClass: 'ECONOMY',
          },
          {
            flightId: sampleFlight.id,
            fullName: 'Ana Gomez Tester',
            documentNumber: 'CC50607080',
            seatNumber: '14B',
            seatClass: 'BUSINESS',
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.pnr).toBeDefined();
    expect(res.body.data.pnr).toHaveLength(6);
    expect(res.body.data.status).toBe('PENDING');
    expect(res.body.data.passengers).toHaveLength(2);

    createdPnr = res.body.data.pnr;

    // Verify 15-minute expiration timestamp (R8)
    const expiresAt = new Date(res.body.data.expiresAt).getTime();
    const createdAt = new Date(res.body.data.createdAt).getTime();
    const diffMinutes = Math.round((expiresAt - createdAt) / (1000 * 60));
    expect(diffMinutes).toBe(15);
  });

  it('GET /api/bookings/:pnr should return reservation details', async () => {
    const res = await request(app)
      .get(`/api/bookings/${createdPnr}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.pnr).toBe(createdPnr);
    expect(res.body.data.passengers).toHaveLength(2);
  });

  it('GET /api/bookings/my-bookings should list all bookings for authenticated user', async () => {
    const res = await request(app)
      .get('/api/bookings/my-bookings')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].pnr).toBe(createdPnr);
  });

  it('POST /api/bookings/:pnr/pay should simulate credit card purchase and emit tickets (R3, R9)', async () => {
    const res = await request(app)
      .post(`/api/bookings/${createdPnr}/pay`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        cardNumber: '4532 1111 2222 3333',
        cardHolder: 'DAVID TESTER',
        expiryDate: '12/28',
        cvv: '999',
        deliveryMethod: 'EMAIL',
        saveCardForFuture: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('CONFIRMED');
    expect(res.body.data.transactionId).toBeDefined();
    expect(res.body.data.pnr).toBe(createdPnr);

    // Verify booking status is now CONFIRMED in database
    const bookingInDb = await prisma.booking.findUnique({
      where: { pnr: createdPnr },
      include: { paymentSimulation: true },
    });
    expect(bookingInDb?.status).toBe('CONFIRMED');
    expect(bookingInDb?.paymentSimulation?.cardLast4).toBe('3333');
  });

  it('POST /api/bookings/:pnr/pay should reject paying an already confirmed booking', async () => {
    const res = await request(app)
      .post(`/api/bookings/${createdPnr}/pay`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        cardNumber: '4532 1111 2222 3333',
        cardHolder: 'DAVID TESTER',
        expiryDate: '12/28',
        cvv: '999',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('ya ha sido pagada');
  });

  it('POST /api/bookings/:pnr/pay should reject payment if 15-min timeout has expired (R8)', async () => {
    // Create an expired booking directly to test the timeout constraint
    const expiredBooking = await prisma.booking.create({
      data: {
        pnr: 'EXP123',
        userId: testUserId,
        totalAmount: 180000,
        expiresAt: new Date(Date.now() - 60000), // Expired 1 minute ago
        status: 'PENDING',
        passengers: {
          create: [
            {
              flightId: sampleFlight.id,
              fullName: 'Expired Passenger',
              documentNumber: 'CC999999',
              seatClass: 'ECONOMY',
            },
          ],
        },
      },
    });

    const res = await request(app)
      .post(`/api/bookings/${expiredBooking.pnr}/pay`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        cardNumber: '4532 1111 2222 3333',
        cardHolder: 'DAVID TESTER',
        expiryDate: '12/28',
        cvv: '999',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('BOOKING_EXPIRED');
    expect(res.body.message).toContain('15 minutos');
  });
});
