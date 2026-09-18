import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create a default demo user
  const hashedPassword = await bcrypt.hash('Password123!', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@intouchcx.com' },
    update: {},
    create: {
      email: 'demo@intouchcx.com',
      password: hashedPassword,
      fullName: 'Juan Pérez (Demo)',
      phoneNumber: '+57 300 123 4567',
      savedCardNumber: '4532********8888',
      savedCardHolder: 'JUAN PEREZ',
      savedCardExpiry: '12/28',
    },
  });

  console.log(`👤 Demo user created/verified: ${user.email}`);

  // 2. Flight schedules and routes
  const routes = [
    { origin: 'BOG', destination: 'MDE', airline: 'Avianca', basePrice: 180000, durationHours: 1 },
    { origin: 'BOG', destination: 'MDE', airline: 'LATAM', basePrice: 165000, durationHours: 1 },
    { origin: 'BOG', destination: 'MDE', airline: 'Wingo', basePrice: 140000, durationHours: 1.1 },
    { origin: 'MDE', destination: 'BOG', airline: 'Avianca', basePrice: 175000, durationHours: 1 },
    { origin: 'BOG', destination: 'CTG', airline: 'Avianca', basePrice: 280000, durationHours: 1.5 },
    { origin: 'BOG', destination: 'CTG', airline: 'LATAM', basePrice: 260000, durationHours: 1.5 },
    { origin: 'BOG', destination: 'CTG', airline: 'Wingo', basePrice: 220000, durationHours: 1.5 },
    { origin: 'BOG', destination: 'CLO', airline: 'Avianca', basePrice: 190000, durationHours: 1.1 },
    { origin: 'BOG', destination: 'CLO', airline: 'LATAM', basePrice: 185000, durationHours: 1.1 },
    { origin: 'BOG', destination: 'SMR', airline: 'Avianca', basePrice: 310000, durationHours: 1.6 },
    { origin: 'MDE', destination: 'CTG', airline: 'LATAM', basePrice: 240000, durationHours: 1.2 },
    { origin: 'BOG', destination: 'MIA', airline: 'Avianca', basePrice: 1250000, durationHours: 4.2 },
    { origin: 'BOG', destination: 'MIA', airline: 'American Airlines', basePrice: 1450000, durationHours: 4.0 },
    { origin: 'BOG', destination: 'MAD', airline: 'Iberia', basePrice: 3400000, durationHours: 9.8 },
    { origin: 'BOG', destination: 'MAD', airline: 'Avianca', basePrice: 3200000, durationHours: 10.0 },
  ];

  const now = new Date();

  // Generate flights for today, tomorrow, and next 7 days
  let flightIndex = 100;
  for (let dayOffset = 0; dayOffset <= 7; dayOffset++) {
    for (const route of routes) {
      const departure = new Date(now);
      departure.setDate(now.getDate() + dayOffset);
      
      // Slot 1: Morning flight (07:00)
      const depMorning = new Date(departure);
      depMorning.setHours(7 + (flightIndex % 4), 15 * (flightIndex % 4), 0, 0);
      const arrMorning = new Date(depMorning.getTime() + route.durationHours * 60 * 60 * 1000);

      const flightNumberMorning = `${route.airline.substring(0, 2).toUpperCase()}-${flightIndex++}`;
      await prisma.flight.upsert({
        where: { flightNumber: flightNumberMorning },
        update: {},
        create: {
          flightNumber: flightNumberMorning,
          airline: route.airline,
          origin: route.origin,
          destination: route.destination,
          departureTime: depMorning,
          arrivalTime: arrMorning,
          price: route.basePrice,
          status: dayOffset === 0 && (flightIndex % 5 === 0) ? 'DELAYED' : 'ON_TIME',
          isDirect: true,
          stopsCount: 0,
          availableSeats: 50 + (flightIndex % 15),
          totalSeats: 60,
          aircraftModel: 'Airbus A320-Neo',
        },
      });

      // Slot 2: Afternoon/Evening flight (15:00 - 20:00)
      const depEvening = new Date(departure);
      depEvening.setHours(15 + (flightIndex % 5), 20 * (flightIndex % 3), 0, 0);
      const arrEvening = new Date(depEvening.getTime() + (route.durationHours + 0.5) * 60 * 60 * 1000);

      const isStopover = flightIndex % 4 === 0;
      const flightNumberEvening = `${route.airline.substring(0, 2).toUpperCase()}-${flightIndex++}`;

      await prisma.flight.upsert({
        where: { flightNumber: flightNumberEvening },
        update: {},
        create: {
          flightNumber: flightNumberEvening,
          airline: route.airline,
          origin: route.origin,
          destination: route.destination,
          departureTime: depEvening,
          arrivalTime: arrEvening,
          price: isStopover ? Math.round(route.basePrice * 0.85) : route.basePrice * 1.1,
          status: 'ON_TIME',
          isDirect: !isStopover,
          stopsCount: isStopover ? 1 : 0,
          stopsInfo: isStopover ? '1 Escala en Medellín (MDE) - 1h 10m' : null,
          availableSeats: 40 + (flightIndex % 20),
          totalSeats: 60,
          aircraftModel: 'Boeing 737-800',
        },
      });
    }
  }

  console.log('✅ Database seeded with rich flight routes and initial demo user.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
