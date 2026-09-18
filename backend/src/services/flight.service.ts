import { flightRepository } from '../repositories/flight.repository.js';
import { FlightQueryFilters } from '../types/index.js';

export class FlightService {
  async searchFlights(filters: FlightQueryFilters) {
    return flightRepository.findAll(filters);
  }

  async getFlightById(id: string) {
    const flight = await flightRepository.findById(id);
    if (!flight) {
      throw { statusCode: 404, message: 'Vuelo no encontrado' };
    }
    return flight;
  }

  async getFlightStatus(flightNumber: string) {
    const flight = await flightRepository.findByFlightNumber(flightNumber);
    if (!flight) {
      throw { statusCode: 404, message: 'Vuelo no encontrado con ese número' };
    }
    return flight;
  }
}

export const flightService = new FlightService();
