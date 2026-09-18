import { Request, Response } from 'express';

export class HealthController {
  getHealth(req: Request, res: Response) {
    res.status(200).json({
      success: true,
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'Flight Reservation API',
      version: '1.0.0',
    });
  }
}

export const healthController = new HealthController();
