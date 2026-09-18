import { Request, Response, NextFunction } from 'express';
import { flightService } from '../services/flight.service.js';

export class FlightController {
  async searchFlights(req: Request, res: Response, next: NextFunction) {
    try {
      const { origin, destination, date, airline, onlyDirect, sortBy } = req.query;

      const flights = await flightService.searchFlights({
        origin: origin as string,
        destination: destination as string,
        date: date as string,
        airline: airline as string,
        onlyDirect: onlyDirect === 'true' ? true : onlyDirect === 'false' ? false : undefined,
        sortBy: sortBy as any,
      });

      res.status(200).json({
        success: true,
        count: flights.length,
        data: flights,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFlightById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const flight = await flightService.getFlightById(id);
      res.status(200).json({
        success: true,
        data: flight,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFlightStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { flightNumber } = req.params;
      const flight = await flightService.getFlightStatus(flightNumber);
      res.status(200).json({
        success: true,
        data: flight,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const flightController = new FlightController();
