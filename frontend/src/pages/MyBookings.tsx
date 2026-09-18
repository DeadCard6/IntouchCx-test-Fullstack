import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plane } from 'lucide-react';
import { ApiService } from '../services/api.js';
import { Booking } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';

export const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchBookings = async () => {
      try {
        const res = await ApiService.getUserBookings();
        setBookings(res.data);
      } catch (err: any) {
        setError(err.message || 'Error al obtener tus reservas');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [isAuthenticated]);

  return (
    <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '30px 20px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px' }}>Mis Reservas y Billetes</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Historial de vuelos reservados y billetes aereos emitidos
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          Cargando tus reservas...
        </div>
      ) : error ? (
        <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: '#f87171' }}>
          {error}
        </div>
      ) : bookings.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px 20px', textAlign: 'center' }}>
          <Plane size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Aun no tienes reservas activas</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem' }}>
            Explora las rutas disponibles y adquiere tus billetes de manera rapida.
          </p>
          <Link to="/flights" className="btn-primary" style={{ padding: '10px 24px' }}>
            Buscar Vuelos Ahora
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {bookings.map((b) => {
            const isConfirmed = b.status === 'CONFIRMED';
            return (
              <div key={b.id} className="glass-card animate-fade-in" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '14px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Localizador:</span>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent-cyan)', letterSpacing: '0.08em' }}>
                      {b.pnr}
                    </span>
                  </div>

                  <span className={`badge ${isConfirmed ? 'badge-success' : b.status === 'PENDING' ? 'badge-warning' : 'badge-danger'}`}>
                    {isConfirmed ? 'CONFIRMADO / EMITIDO' : b.status === 'PENDING' ? 'PENDIENTE DE PAGO' : b.status}
                  </span>
                </div>

                {/* Passengers & Flight Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                  {b.passengers.map((p) => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '0.9rem' }}>
                      <div>
                        <strong>{p.fullName}</strong> ({p.documentNumber}) - Asiento: <code style={{ color: 'var(--accent-cyan)' }}>{p.seatNumber || 'N/A'}</code> ({p.seatClass})
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }}>
                        Vuelo {p.flight?.airline} {p.flight?.flightNumber}: {p.flight?.origin} a {p.flight?.destination}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer details */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid var(--border-glass)', paddingTop: '14px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Fecha de creacion: {new Date(b.createdAt).toLocaleDateString([], { dateStyle: 'medium' })}
                    {b.paymentSimulation && ` - Transaccion: ${b.paymentSimulation.transactionId}`}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#ffffff' }}>
                      ${b.totalAmount.toLocaleString('es-CO')} COP
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
};
