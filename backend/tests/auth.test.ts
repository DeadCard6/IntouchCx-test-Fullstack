import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/config/database.js';

const app = createApp();

describe('Auth & User Management API (R4, R7, RNF Seguridad)', () => {
  const testUser = {
    email: `test-${Date.now()}@intouchcx.com`,
    password: 'SecurePassword123!',
    fullName: 'Maria Rodriguez Test',
    phoneNumber: '+57 311 987 6543',
    savedCardNumber: '4532 9999 8888 7777',
    savedCardHolder: 'MARIA RODRIGUEZ',
    savedCardExpiry: '10/27',
  };

  let authToken: string;
  let userId: string;

  afterAll(async () => {
    // Clean up created test user if needed
    try {
      await prisma.user.deleteMany({
        where: { email: testUser.email },
      });
    } catch {}
  });

  it('POST /api/auth/register should create a new user and return JWT token', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.data.user.fullName).toBe(testUser.fullName);
    expect(res.body.data.token).toBeDefined();

    authToken = res.body.data.token;
    userId = res.body.data.user.id;
  });

  it('POST /api/auth/register should fail when registering with existing email', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('ya se encuentra registrado');
  });

  it('POST /api/auth/register should validate payload fields with Zod', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'invalid-email',
      password: '123', // Too short
      fullName: '',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it('POST /api/auth/login should authenticate successfully with valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
  });

  it('POST /api/auth/login should reject incorrect password with 401', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: 'WrongPassword!',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Credenciales');
  });

  it('GET /api/auth/profile should return authenticated user data', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(testUser.email.toLowerCase());
  });

  it('GET /api/auth/profile without token should return 401 unauthorized', async () => {
    const res = await request(app).get('/api/auth/profile');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('PUT /api/auth/profile should update user details and saved card', async () => {
    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        fullName: 'Maria R. Actualizada',
        savedCardNumber: '**** **** **** 1234',
        savedCardHolder: 'MARIA R ACTUALIZADA',
        savedCardExpiry: '11/29',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.fullName).toBe('Maria R. Actualizada');
    expect(res.body.data.savedCardNumber).toBe('**** **** **** 1234');
  });

  it('DELETE /api/auth/profile should cancel and delete user account', async () => {
    const res = await request(app)
      .delete('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('cancelado y eliminado');

    // Verify user no longer exists
    const checkUser = await prisma.user.findUnique({ where: { id: userId } });
    expect(checkUser).toBeNull();
  });
});
