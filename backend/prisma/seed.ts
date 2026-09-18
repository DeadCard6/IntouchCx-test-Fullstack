import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[INFO] Iniciando poblado exhaustivo de rutas nacionales de Colombia...');

  // 1. Usuario Demo
  const hashedPassword = await bcrypt.hash('Password123!', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@intouchcx.com' },
    update: {},
    create: {
      email: 'demo@intouchcx.com',
      password: hashedPassword,
      fullName: 'Juan Perez (Demo)',
      phoneNumber: '+57 300 123 4567',
      savedCardNumber: '4532********8888',
      savedCardHolder: 'JUAN PEREZ',
      savedCardExpiry: '12/28',
    },
  });

  console.log(`[USER] Usuario demo listo: ${user.email}`);

  // 2. Definición de Ciudades y Rutas Nacionales Bidireccionales
  // Cada ruta tendrá su viaje de ida y vuelta correspondiente
  const baseRoutes = [
    // Troncales principales desde Bogotá
    { orig: 'BOG', dest: 'MDE', price: 165000, duration: 1.0, airlines: ['Avianca', 'LATAM', 'Wingo', 'Clic Air'] },
    { orig: 'BOG', dest: 'CLO', price: 175000, duration: 1.1, airlines: ['Avianca', 'LATAM', 'Wingo'] },
    { orig: 'BOG', dest: 'CTG', price: 240000, duration: 1.5, airlines: ['Avianca', 'LATAM', 'Wingo'] },
    { orig: 'BOG', dest: 'BAQ', price: 230000, duration: 1.4, airlines: ['Avianca', 'LATAM', 'Wingo'] },
    { orig: 'BOG', dest: 'SMR', price: 260000, duration: 1.5, airlines: ['Avianca', 'LATAM', 'Wingo'] },
    { orig: 'BOG', dest: 'BGA', price: 190000, duration: 1.0, airlines: ['Avianca', 'LATAM', 'Clic Air'] },
    { orig: 'BOG', dest: 'PEI', price: 180000, duration: 1.0, airlines: ['Avianca', 'LATAM', 'Clic Air'] },
    { orig: 'BOG', dest: 'CUC', price: 220000, duration: 1.2, airlines: ['Avianca', 'LATAM', 'Clic Air'] },
    { orig: 'BOG', dest: 'ADZ', price: 380000, duration: 2.2, airlines: ['Avianca', 'LATAM', 'Wingo'] },
    { orig: 'BOG', dest: 'LET', price: 420000, duration: 2.1, airlines: ['Avianca', 'Satena'] },
    { orig: 'BOG', dest: 'MTR', price: 210000, duration: 1.3, airlines: ['Avianca', 'LATAM', 'Clic Air'] },
    { orig: 'BOG', dest: 'AXM', price: 185000, duration: 1.0, airlines: ['Avianca', 'Clic Air'] },
    { orig: 'BOG', dest: 'PSO', price: 250000, duration: 1.4, airlines: ['Avianca', 'Satena'] },
    { orig: 'BOG', dest: 'VUP', price: 245000, duration: 1.4, airlines: ['Avianca', 'Clic Air'] },
    { orig: 'BOG', dest: 'NVA', price: 160000, duration: 0.9, airlines: ['Avianca', 'Clic Air'] },

    // Conexiones desde Medellín (MDE / EOH)
    { orig: 'MDE', dest: 'CTG', price: 210000, duration: 1.1, airlines: ['Avianca', 'LATAM', 'Wingo'] },
    { orig: 'MDE', dest: 'SMR', price: 230000, duration: 1.2, airlines: ['Avianca', 'LATAM', 'Wingo'] },
    { orig: 'MDE', dest: 'CLO', price: 160000, duration: 1.0, airlines: ['Avianca', 'LATAM', 'Clic Air'] },
    { orig: 'MDE', dest: 'BAQ', price: 200000, duration: 1.1, airlines: ['Avianca', 'LATAM', 'Wingo'] },
    { orig: 'MDE', dest: 'ADZ', price: 340000, duration: 1.8, airlines: ['Avianca', 'LATAM', 'Wingo'] },
    { orig: 'MDE', dest: 'BGA', price: 175000, duration: 1.0, airlines: ['Clic Air', 'Avianca'] },
    { orig: 'MDE', dest: 'PEI', price: 150000, duration: 0.8, airlines: ['Clic Air', 'LATAM'] },
    { orig: 'MDE', dest: 'MTR', price: 165000, duration: 0.9, airlines: ['Clic Air', 'LATAM'] },
    { orig: 'MDE', dest: 'CUC', price: 215000, duration: 1.1, airlines: ['Clic Air', 'Avianca'] },

    // Conexiones desde Cali (CLO)
    { orig: 'CLO', dest: 'CTG', price: 250000, duration: 1.4, airlines: ['Avianca', 'LATAM', 'Wingo'] },
    { orig: 'CLO', dest: 'SMR', price: 270000, duration: 1.5, airlines: ['Avianca', 'LATAM'] },
    { orig: 'CLO', dest: 'ADZ', price: 360000, duration: 2.0, airlines: ['Avianca', 'LATAM'] },
    { orig: 'CLO', dest: 'BAQ', price: 245000, duration: 1.4, airlines: ['Avianca', 'LATAM'] },
    { orig: 'CLO', dest: 'PSO', price: 140000, duration: 0.8, airlines: ['Avianca', 'Satena'] },

    // Costa Caribe y otras interregionales
    { orig: 'CTG', dest: 'ADZ', price: 260000, duration: 1.2, airlines: ['LATAM', 'Wingo'] },
    { orig: 'BAQ', dest: 'SMR', price: 120000, duration: 0.7, airlines: ['Clic Air'] },
    { orig: 'BGA', dest: 'CTG', price: 230000, duration: 1.2, airlines: ['Clic Air', 'Avianca'] },
    { orig: 'PEI', dest: 'CTG', price: 240000, duration: 1.3, airlines: ['Avianca', 'Wingo'] },
  ];

  // Duplicar para crear ida y retorno automáticamente
  const allRoutes: { orig: string; dest: string; price: number; duration: number; airlines: string[] }[] = [];
  for (const r of baseRoutes) {
    allRoutes.push(r);
    // Retorno
    allRoutes.push({
      orig: r.dest,
      dest: r.orig,
      price: Math.round(r.price * 0.98), // Ligera variación
      duration: r.duration,
      airlines: r.airlines,
    });
  }

  const now = new Date();
  let flightSeq = 200;

  // Generar vuelos para hoy y los siguientes 14 días
  console.log(`[INFO] Generando vuelos para ${allRoutes.length} pares de rutas durante 14 dias...`);

  const aircrafts = ['Airbus A320-Neo', 'Boeing 737-800', 'Airbus A319', 'ATR 72-600', 'Embraer 190'];

  for (let dayOffset = 0; dayOffset <= 14; dayOffset++) {
    for (const route of allRoutes) {
      for (const airline of route.airlines) {
        const departureBase = new Date(now);
        departureBase.setDate(now.getDate() + dayOffset);

        // Generar 2 franjas horarias por aerolínea en cada ruta
        const timeSlots = [
          { hour: 6 + (flightSeq % 5), minute: (flightSeq * 15) % 60 },
          { hour: 14 + (flightSeq % 7), minute: (flightSeq * 20) % 60 },
        ];

        for (const slot of timeSlots) {
          const depTime = new Date(departureBase);
          depTime.setHours(slot.hour, slot.minute, 0, 0);

          const arrTime = new Date(depTime.getTime() + route.duration * 60 * 60 * 1000);
          const flightNumber = `${airline.substring(0, 2).toUpperCase()}-${flightSeq++}`;

          const isStopover = flightSeq % 7 === 0;
          const isDelayed = dayOffset === 0 && flightSeq % 11 === 0;

          const aircraft = aircrafts[flightSeq % aircrafts.length];
          const availableSeats = 35 + (flightSeq % 45);

          await prisma.flight.upsert({
            where: { flightNumber },
            update: {
              price: isStopover ? Math.round(route.price * 0.85) : route.price,
              departureTime: depTime,
              arrivalTime: arrTime,
              availableSeats,
            },
            create: {
              flightNumber,
              airline,
              origin: route.orig,
              destination: route.dest,
              departureTime: depTime,
              arrivalTime: arrTime,
              price: isStopover ? Math.round(route.price * 0.85) : route.price,
              status: isDelayed ? 'DELAYED' : 'ON_TIME',
              isDirect: !isStopover,
              stopsCount: isStopover ? 1 : 0,
              stopsInfo: isStopover ? `1 Escala en BOG/MDE - 1h 15m` : null,
              availableSeats,
              totalSeats: 80,
              aircraftModel: aircraft,
            },
          });
        }
      }
    }
  }

  const totalFlights = await prisma.flight.count();
  console.log(`[SUCCESS] Base de datos poblada con ${totalFlights} vuelos nacionales (origen y destino con retornos) para todas las aerolineas.`);
}

main()
  .catch((e) => {
    console.error('[ERROR] Fallo en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
