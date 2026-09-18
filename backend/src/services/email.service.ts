export class EmailService {
  async sendBookingConfirmationEmail(data: {
    to: string;
    userName: string;
    pnr: string;
    flightDetails: string;
    passengers: string[];
    total: number;
  }) {
    console.log('----------------------------------------------------');
    console.log('📧 [SIMULACIÓN DE ENVÍO DE CORREO ELECTRÓNICO (R9)]');
    console.log(`Para: ${data.to}`);
    console.log(`Asunto: ¡Confirmación de compra de billetes aéreos - Localizador ${data.pnr}!`);
    console.log(`Estimado/a ${data.userName},`);
    console.log(`Su compra ha sido procesada exitosamente.`);
    console.log(`Código de Reserva (PNR): ${data.pnr}`);
    console.log(`Itinerario: ${data.flightDetails}`);
    console.log(`Pasajeros: ${data.passengers.join(', ')}`);
    console.log(`Monto Total: $${data.total.toLocaleString('es-CO')} COP`);
    console.log(`Estado: Vuelo Confirmado`);
    console.log('----------------------------------------------------');

    return {
      sent: true,
      messageId: `sim-mail-${Date.now()}`,
      sentAt: new Date(),
    };
  }
}

export const emailService = new EmailService();
