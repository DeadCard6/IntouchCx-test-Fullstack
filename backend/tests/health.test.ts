import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('🏥 Health & Error Handlers API', () => {
  it('GET /api/health should return 200 and OK status', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('OK');
    expect(res.body.service).toBe('Flight Reservation API');
  });

  it('GET /api/non-existing-route should return 404 not found', async () => {
    const res = await request(app).get('/api/route-that-does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Ruta no encontrada');
  });
});
