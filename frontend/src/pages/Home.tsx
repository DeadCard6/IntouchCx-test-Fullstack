import React from 'react';
import { Link } from 'react-router-dom';
import { Plane, Search, ShieldCheck, CreditCard, Clock, MapPin, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const Home: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      {/* Terminal de Bienvenida */}
      <section
        id="hero-welcome-terminal"
        className="glass-panel animate-fade-in"
        style={{
          padding: '48px 36px',
          marginBottom: '40px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            color: 'var(--accent-cyan)',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '20px',
          }}
        >
          <Plane size={16} /> Terminal de Servicio y Reserva de Vuelos Digital
        </div>

        <h1
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '16px',
            letterSpacing: '-0.03em',
          }}
        >
          Reserva tus vuelos al mejor precio <br />
          <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            sin intermediarios humanos
          </span>
        </h1>

        <p
          style={{
            maxWidth: '680px',
            margin: '0 auto 32px auto',
            color: 'var(--text-secondary)',
            fontSize: '1.1rem',
          }}
        >
          {isAuthenticated
            ? `¡Bienvenido de nuevo, ${user?.fullName}! Accede a la consulta de horarios en tiempo real, tarifas optimizadas y emisión instantánea de billetes.`
            : 'Consulta horarios de todas las aerolíneas, compara tarifas ordenadas por costo y reserva billetes aéreos de forma 100% remota.'}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Link to="/flights" id="hero-search-flights-btn" className="btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
            <Search size={18} />
            Consultar Vuelos Disponibles
            <ArrowRight size={18} />
          </Link>

          {!isAuthenticated && (
            <Link to="/register" id="hero-register-btn" className="btn-secondary" style={{ padding: '14px 24px', fontSize: '1rem' }}>
              Registrarse por Primera Vez
            </Link>
          )}
        </div>
      </section>

      {/* Services Grid (Requerimientos R1, R2, R3, R5, R6) */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px', textAlign: 'center' }}>
          Servicios Ofrecidos por la Plataforma
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {/* Card 1 */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ color: 'var(--accent-cyan)', marginBottom: '14px' }}>
              <Clock size={32} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' }}>Consulta por Horarios</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
              Revisa los horarios de todas las aerolíneas que conectan ciudades con vuelos directos o con escalas.
            </p>
            <Link to="/flights" style={{ color: 'var(--accent-cyan)', fontSize: '0.875rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Ver horarios <ArrowRight size={14} />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ color: '#3b82f6', marginBottom: '14px' }}>
              <CreditCard size={32} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' }}>Consulta por Tarifas</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
              Compara precios entre diferentes aerolíneas ordenados de menor a mayor para maximizar tu ahorro.
            </p>
            <Link to="/flights?sortBy=price_asc" style={{ color: '#3b82f6', fontSize: '0.875rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Comparar tarifas <ArrowRight size={14} />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ color: 'var(--success)', marginBottom: '14px' }}>
              <MapPin size={32} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' }}>Reserva & Simulación de Compra</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
              Selecciona asientos, ingresa datos de múltiples pasajeros y adquiere tus billetes con confirmación inmediata por email.
            </p>
            <Link to="/flights" style={{ color: 'var(--success)', fontSize: '0.875rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Reservar ahora <ArrowRight size={14} />
            </Link>
          </div>

          {/* Card 4 */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ color: 'var(--warning)', marginBottom: '14px' }}>
              <ShieldCheck size={32} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' }}>Seguridad & Control de Sesión</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
              Contraseñas cifradas con bcrypt y retención segura de reserva con temporizador de inactividad de 15 minutos.
            </p>
            <Link to={isAuthenticated ? '/profile' : '/login'} style={{ color: 'var(--warning)', fontSize: '0.875rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              {isAuthenticated ? 'Gestionar cuenta' : 'Ingresar'} <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};
