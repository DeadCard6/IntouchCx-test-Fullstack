import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Mail,
  Building,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ApiService } from '../services/api.js';
import { Flight, Booking } from '../types/index.js';
import { InactivityTimer } from '../components/InactivityTimer.js';
import { useAuth } from '../context/AuthContext.js';

interface PassengerInput {
  fullName: string;
  documentNumber: string;
  seatNumber: string;
  seatClass: 'ECONOMY' | 'BUSINESS' | 'FIRST';
}

export const BookingCheckout: React.FC = () => {
  const [searchParams] = useSearchParams();
  const flightId = searchParams.get('flightId');
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [flight, setFlight] = useState<Flight | null>(null);
  const [loadingFlight, setLoadingFlight] = useState(true);

  // Reservation Phase state
  const [passengers, setPassengers] = useState<PassengerInput[]>([
    {
      fullName: user?.fullName || '',
      documentNumber: '',
      seatNumber: '12A',
      seatClass: 'ECONOMY',
    },
  ]);

  // Created Booking (Hold stage)
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [reserving, setReserving] = useState(false);
  const [reservationError, setReservationError] = useState<string | null>(null);

  // Payment simulation state
  const [cardNumber, setCardNumber] = useState(user?.savedCardNumber || '');
  const [cardHolder, setCardHolder] = useState(user?.savedCardHolder || user?.fullName || '');
  const [expiryDate, setExpiryDate] = useState(user?.savedCardExpiry || '');
  const [cvv, setCvv] = useState('123');
  const [saveCardForFuture, setSaveCardForFuture] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'EMAIL' | 'AIRPORT_COUNTER'>('EMAIL');
  const [paying, setPaying] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<any | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!flightId) {
      navigate('/flights');
      return;
    }

    const fetchFlight = async () => {
      try {
        const res = await ApiService.getFlightById(flightId);
        setFlight(res.data);
      } catch (err: any) {
        setReservationError(err.message || 'Error al cargar el vuelo');
      } finally {
        setLoadingFlight(false);
      }
    };

    fetchFlight();
  }, [flightId, isAuthenticated]);

  const handleAddPassenger = () => {
    setPassengers([
      ...passengers,
      {
        fullName: '',
        documentNumber: '',
        seatNumber: `${12 + passengers.length}B`,
        seatClass: 'ECONOMY',
      },
    ]);
  };

  const handleRemovePassenger = (index: number) => {
    if (passengers.length === 1) return;
    setPassengers(passengers.filter((_, i) => i !== index));
  };

  const handlePassengerChange = (index: number, field: keyof PassengerInput, value: string) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  // Step 1: Create Reservation (Generates PNR and 15-minute hold)
  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flight) return;
    setReserving(true);
    setReservationError(null);

    try {
      const payload = {
        passengers: passengers.map((p) => ({
          flightId: flight.id,
          fullName: p.fullName,
          documentNumber: p.documentNumber,
          seatNumber: p.seatNumber,
          seatClass: p.seatClass,
        })),
      };

      const res = await ApiService.createBooking(payload);
      setActiveBooking(res.data);
    } catch (err: any) {
      setReservationError(err.message || 'Error al crear la reserva');
    } finally {
      setReserving(false);
    }
  };

  // Step 2: Pay Booking Simulation (R3, R8, R9)
  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBooking) return;
    setPaying(true);
    setReservationError(null);

    try {
      const res = await ApiService.payBooking(activeBooking.pnr, {
        cardNumber,
        cardHolder,
        expiryDate,
        cvv,
        saveCardForFuture,
        deliveryMethod,
      });

      setPaymentSuccessData(res.data);
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      setReservationError(err.message || 'Error al procesar el pago simulado');
    } finally {
      setPaying(false);
    }
  };

  const calculateTotal = () => {
    if (!flight) return 0;
    return passengers.reduce((sum, p) => {
      let mult = 1.0;
      if (p.seatClass === 'BUSINESS') mult = 1.6;
      if (p.seatClass === 'FIRST') mult = 2.2;
      return sum + flight.price * mult;
    }, 0);
  };

  if (loadingFlight) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
        Cargando detalles de reserva...
      </div>
    );
  }

  return (
    <main style={{ maxWidth: '980px', margin: '0 auto', padding: '30px 20px' }}>
      {/* Flight Banner Summary */}
      {flight && (
        <div
          className="glass-panel"
          style={{
            padding: '20px 24px',
            marginBottom: '28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>{flight.airline}</span>
              <span className="badge badge-success">{flight.flightNumber}</span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {flight.origin} ➔ {flight.destination} | Salida: {new Date(flight.departureTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Base por pasajero</span>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
              ${flight.price.toLocaleString('es-CO')} COP
            </span>
          </div>
        </div>
      )}

      {/* Error alert */}
      {reservationError && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#f87171',
            marginBottom: '24px',
          }}
        >
          <AlertCircle size={20} />
          <span>{reservationError}</span>
        </div>
      )}

      {/* SUCCESS CONFIRMATION MODAL / PANEL */}
      {paymentSuccessData ? (
        <div className="glass-panel animate-fade-in" style={{ padding: '40px', textAlign: 'center' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '2px solid var(--success)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--success)',
              marginBottom: '20px',
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
            ¡Compra de Billetes Aéreos Exitosa!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto 24px auto' }}>
            {paymentSuccessData.message}
          </p>

          {/* Ticket Summary Card */}
          <div
            className="glass-card"
            style={{
              maxWidth: '520px',
              margin: '0 auto 30px auto',
              padding: '24px',
              textAlign: 'left',
              border: '1px dashed var(--accent-cyan)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Localizador (PNR):</span>
              <span style={{ fontWeight: 800, color: 'var(--accent-cyan)', letterSpacing: '0.1em' }}>
                {paymentSuccessData.pnr}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-muted)' }}>ID Transacción Simulada:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
                {paymentSuccessData.transactionId}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Entrega de Billetes:</span>
              <span style={{ fontWeight: 600 }}>
                {paymentSuccessData.deliveryMethod === 'EMAIL' ? '📧 Envío al Correo Registrado' : '🏢 Mostrador del Aeropuerto'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-glass)', paddingTop: '12px' }}>
              <span style={{ fontWeight: 700 }}>Total Pagado:</span>
              <span style={{ fontWeight: 800, color: '#ffffff' }}>
                ${paymentSuccessData.amount.toLocaleString('es-CO')} COP
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <button onClick={() => navigate('/my-bookings')} className="btn-primary" style={{ padding: '12px 24px' }}>
              Ver en Mis Reservas
            </button>
            <button onClick={() => navigate('/flights')} className="btn-secondary" style={{ padding: '12px 24px' }}>
              Buscar Otros Vuelos
            </button>
          </div>
        </div>
      ) : !activeBooking ? (
        /* PHASE 1: PASSENGER & SEAT RESERVATION (R2) */
        <form onSubmit={handleCreateReservation} className="glass-panel animate-fade-in" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Paso 1: Datos de Pasajeros y Asientos</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Puedes reservar para uno o más pasajeros en un solo itinerario
              </p>
            </div>
            <button
              id="add-passenger-btn"
              type="button"
              onClick={handleAddPassenger}
              className="btn-secondary"
              style={{ fontSize: '0.85rem' }}
            >
              <Plus size={16} /> Agregar Pasajero
            </button>
          </div>

          {passengers.map((passenger, index) => (
            <div
              key={index}
              className="glass-card"
              style={{ padding: '20px', marginBottom: '20px', position: 'relative' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontWeight: 700, color: 'var(--accent-cyan)', fontSize: '0.95rem' }}>
                  Pasajero #{index + 1}
                </span>
                {passengers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemovePassenger(index)}
                    style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
                    title="Eliminar pasajero"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Ej: Laura Gómez"
                    value={passenger.fullName}
                    onChange={(e) => handlePassengerChange(index, 'fullName', e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Documento de Identidad / Pasaporte *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Ej: 1020304050"
                    value={passenger.documentNumber}
                    onChange={(e) => handlePassengerChange(index, 'documentNumber', e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Clase de Asiento</label>
                  <select
                    className="form-select"
                    value={passenger.seatClass}
                    onChange={(e) => handlePassengerChange(index, 'seatClass', e.target.value as any)}
                  >
                    <option value="ECONOMY">Económica (Tarifa base)</option>
                    <option value="BUSINESS">Ejecutiva / Business (+60%)</option>
                    <option value="FIRST">Primera Clase (+120%)</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Asiento Deseado (Opcional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: 14A, 14B..."
                    value={passenger.seatNumber}
                    onChange={(e) => handlePassengerChange(index, 'seatNumber', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Pricing Summary */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid var(--border-glass)',
              paddingTop: '20px',
              marginTop: '10px',
            }}
          >
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Total para {passengers.length} pasajero(s)
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                ${calculateTotal().toLocaleString('es-CO')} COP
              </div>
            </div>

            <button id="create-reservation-btn" type="submit" disabled={reserving} className="btn-primary" style={{ padding: '12px 28px' }}>
              {reserving ? 'Generando reserva...' : 'Confirmar Reserva de Vuelo'}
            </button>
          </div>
        </form>
      ) : (
        /* PHASE 2: SIMULATED PAYMENT & 15-MIN INACTIVITY TIMER (R3, R8, R9) */
        <form onSubmit={handleSimulatePayment} className="glass-panel animate-fade-in" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Paso 2: Simulación de Compra de Billetes</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Reserva confirmada bajo el localizador: <strong style={{ color: 'var(--accent-cyan)' }}>{activeBooking.pnr}</strong>
              </p>
            </div>

            {/* Inactivity 15-min countdown timer (R8) */}
            <InactivityTimer
              expiresAt={activeBooking.expiresAt}
              onExpire={() => {
                alert('El tiempo de retención de 15 minutos ha expirado. Por favor genera una nueva reserva.');
                navigate('/flights');
              }}
            />
          </div>

          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              marginBottom: '24px',
            }}
          >
            ℹ️ <strong>Simulación Segura:</strong> No se generará ningún cobro real a tu tarjeta de crédito. Puedes usar cualquier número de prueba.
          </div>

          {/* Card Form */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Número de Tarjeta de Crédito Simulada *</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="checkout-card-number"
                  type="text"
                  required
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '38px' }}
                  placeholder="4532 1234 5678 9012"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
                <CreditCard size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Nombre del Titular *</label>
              <input
                id="checkout-card-holder"
                type="text"
                required
                className="form-input"
                placeholder="JUAN PEREZ"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Fecha de Expiración (MM/YY) *</label>
              <input
                id="checkout-card-expiry"
                type="text"
                required
                placeholder="12/28"
                className="form-input"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">CVV / CVC *</label>
              <input
                id="checkout-card-cvv"
                type="password"
                required
                maxLength={4}
                placeholder="123"
                className="form-input"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
              />
            </div>
          </div>

          {/* Delivery Method Selection */}
          <div style={{ margin: '20px 0' }}>
            <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
              Modalidad de Recepción de Billetes:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label
                className="glass-card"
                style={{
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  borderColor: deliveryMethod === 'EMAIL' ? 'var(--accent-cyan)' : 'var(--border-glass)',
                }}
              >
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="EMAIL"
                  checked={deliveryMethod === 'EMAIL'}
                  onChange={() => setDeliveryMethod('EMAIL')}
                  style={{ accentColor: 'var(--accent-cyan)' }}
                />
                <Mail size={18} color="var(--accent-cyan)" />
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Envío al Correo (R9)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Confirmación digital inmediata</div>
                </div>
              </label>

              <label
                className="glass-card"
                style={{
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  borderColor: deliveryMethod === 'AIRPORT_COUNTER' ? 'var(--accent-cyan)' : 'var(--border-glass)',
                }}
              >
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="AIRPORT_COUNTER"
                  checked={deliveryMethod === 'AIRPORT_COUNTER'}
                  onChange={() => setDeliveryMethod('AIRPORT_COUNTER')}
                  style={{ accentColor: 'var(--accent-cyan)' }}
                />
                <Building size={18} color="#3b82f6" />
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Mostrador de Aeropuerto</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Recoger antes del vuelo</div>
                </div>
              </label>
            </div>
          </div>

          {/* Save card checkbox */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            <input
              type="checkbox"
              id="checkout-save-card"
              checked={saveCardForFuture}
              onChange={(e) => setSaveCardForFuture(e.target.checked)}
              style={{ accentColor: 'var(--accent-cyan)' }}
            />
            Guardar datos de esta tarjeta para futuras compras
          </label>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: '20px' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Monto Total a Pagar:</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                ${activeBooking.totalAmount.toLocaleString('es-CO')} COP
              </div>
            </div>

            <button id="submit-payment-btn" type="submit" disabled={paying} className="btn-primary" style={{ padding: '12px 32px' }}>
              <ShieldCheck size={18} />
              {paying ? 'Procesando simulación...' : 'Comprar Billetes (Simulación)'}
            </button>
          </div>
        </form>
      )}
    </main>
  );
};
