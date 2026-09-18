import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plane,
  Clock,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { ApiService } from '../services/api.js';
import { Flight } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';

export const FlightSearch: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search filter states
  const [origin, setOrigin] = useState(searchParams.get('origin') || '');
  const [destination, setDestination] = useState(searchParams.get('destination') || '');
  const [airline, setAirline] = useState(searchParams.get('airline') || '');
  const [onlyDirect, setOnlyDirect] = useState(searchParams.get('onlyDirect') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'departure_asc');

  // Flight Status Search
  const [statusSearchQuery, setStatusSearchQuery] = useState('');
  const [flightStatusResult, setFlightStatusResult] = useState<Flight | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const fetchFlights = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (origin) params.origin = origin;
      if (destination) params.destination = destination;
      if (airline) params.airline = airline;
      if (onlyDirect) params.onlyDirect = 'true';
      if (sortBy) params.sortBy = sortBy;

      const res = await ApiService.searchFlights(params);
      setFlights(res.data);
    } catch (err: any) {
      setError(err.message || 'Error al obtener vuelos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, [sortBy]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams: Record<string, string> = {};
    if (origin) newParams.origin = origin;
    if (destination) newParams.destination = destination;
    if (airline) newParams.airline = airline;
    if (onlyDirect) newParams.onlyDirect = 'true';
    if (sortBy) newParams.sortBy = sortBy;
    setSearchParams(newParams);
    fetchFlights();
  };

  const handleSearchStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusSearchQuery.trim()) return;
    setStatusLoading(true);
    setStatusError(null);
    setFlightStatusResult(null);

    try {
      const res = await ApiService.getFlightStatus(statusSearchQuery.trim());
      setFlightStatusResult(res.data);
    } catch (err: any) {
      setStatusError(err.message || 'No se encontró vuelo con ese número');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleReserve = (flight: Flight) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/checkout?flightId=${flight.id}`);
  };

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
      {/* Search Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px' }}>
          Consulta y Reserva de Vuelos
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Horarios en tiempo real, comparación de tarifas y estado operativo de aeronaves
        </p>
      </div>

      {/* Flight Status Lookup Card (R6) */}
      <div
        className="glass-card"
        style={{
          padding: '20px 24px',
          marginBottom: '28px',
          backgroundColor: 'rgba(6, 182, 212, 0.05)',
          borderColor: 'rgba(6, 182, 212, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--accent-cyan)', fontWeight: 700 }}>
          <Clock size={20} />
          <span>Consultar Estado de un Vuelo Específico (R6)</span>
        </div>
        <form onSubmit={handleSearchStatus} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            id="status-flight-number-input"
            type="text"
            className="form-input"
            placeholder="Ej: AV-100, LA-101, WN-102..."
            value={statusSearchQuery}
            onChange={(e) => setStatusSearchQuery(e.target.value)}
            style={{ flex: '1', minWidth: '220px' }}
          />
          <button id="status-search-btn" type="submit" disabled={statusLoading} className="btn-secondary">
            {statusLoading ? 'Consultando...' : 'Consultar Estado'}
          </button>
        </form>

        {statusError && (
          <div style={{ marginTop: '12px', color: '#f87171', fontSize: '0.875rem' }}>
            ⚠️ {statusError}
          </div>
        )}

        {flightStatusResult && (
          <div
            className="glass-panel"
            style={{ marginTop: '16px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                {flightStatusResult.airline} — {flightStatusResult.flightNumber}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Ruta: {flightStatusResult.origin} ➔ {flightStatusResult.destination} | Avión: {flightStatusResult.aircraftModel}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span className={`badge ${flightStatusResult.status === 'ON_TIME' ? 'badge-success' : 'badge-warning'}`}>
                {flightStatusResult.status === 'ON_TIME' ? 'EN HORA' : 'DEMORADO'}
              </span>
              <button onClick={() => handleReserve(flightStatusResult)} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                Reservar este vuelo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Filter Panel (R1, R5) */}
      <form onSubmit={handleFilterSubmit} className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="filter-origin">
              Origen (Ciudad / Código)
            </label>
            <input
              id="filter-origin"
              type="text"
              className="form-input"
              placeholder="Ej: BOG, MDE..."
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="filter-destination">
              Destino
            </label>
            <input
              id="filter-destination"
              type="text"
              className="form-input"
              placeholder="Ej: CTG, CLO, MIA, MAD..."
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="filter-airline">
              Aerolínea
            </label>
            <input
              id="filter-airline"
              type="text"
              className="form-input"
              placeholder="Ej: Avianca, LATAM, Wingo..."
              value={airline}
              onChange={(e) => setAirline(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="filter-sort">
              Ordenar Resultados
            </label>
            <select
              id="filter-sort"
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="departure_asc">🕒 Horario de salida (Más temprano)</option>
              <option value="price_asc">💵 Tarifa: Menor a Mayor costo</option>
              <option value="price_desc">💎 Tarifa: Mayor a Menor costo</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <input
              type="checkbox"
              id="filter-direct-checkbox"
              checked={onlyDirect}
              onChange={(e) => setOnlyDirect(e.target.checked)}
              style={{ accentColor: 'var(--accent-cyan)', width: '16px', height: '16px' }}
            />
            Solo vuelos directos (sin escalas)
          </label>

          <button id="filter-submit-btn" type="submit" className="btn-primary">
            <Filter size={18} />
            Aplicar Filtros de Búsqueda
          </button>
        </div>
      </form>

      {/* Flight Results List */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            Vuelos Disponibles ({flights.length})
          </h2>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Acceso a reserva en 1 solo clic
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
            <div className="animate-fade-in">Cargando itinerarios y tarifas en tiempo real...</div>
          </div>
        ) : error ? (
          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: '#f87171' }}>
            {error}
          </div>
        ) : flights.length === 0 ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
            <Plane size={48} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>No se encontraron vuelos con esos filtros</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Intenta buscar con otros orígenes, destinos o borra los filtros.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {flights.map((flight) => {
              const depDate = new Date(flight.departureTime);
              const arrDate = new Date(flight.arrivalTime);
              const durationMins = Math.round((arrDate.getTime() - depDate.getTime()) / (1000 * 60));
              const hours = Math.floor(durationMins / 60);
              const minutes = durationMins % 60;

              return (
                <div
                  key={flight.id}
                  id={`flight-card-${flight.flightNumber}`}
                  className="glass-card animate-fade-in"
                  style={{
                    padding: '20px 24px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    alignItems: 'center',
                    gap: '20px',
                  }}
                >
                  {/* Airline & Number */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#ffffff' }}>
                        {flight.airline}
                      </span>
                      <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                        {flight.flightNumber}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {flight.aircraftModel} • {flight.availableSeats} asientos disp.
                    </div>
                  </div>

                  {/* Route & Times */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                        {depDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        {flight.origin}
                      </div>
                    </div>

                    <div style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        {hours}h {minutes > 0 ? `${minutes}m` : ''}
                      </div>
                      <div style={{ height: '2px', backgroundColor: 'var(--border-glass)', position: 'relative' }}>
                        <Plane
                          size={14}
                          color="var(--accent-cyan)"
                          style={{ position: 'absolute', top: '-6px', left: '50%', transform: 'translateX(-50%)' }}
                        />
                      </div>
                      <div style={{ fontSize: '0.75rem', color: flight.isDirect ? 'var(--success)' : '#fbbf24', marginTop: '4px' }}>
                        {flight.isDirect ? 'Directo' : flight.stopsInfo || '1 escala'}
                      </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                        {arrDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        {flight.destination}
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div style={{ textAlign: 'center' }}>
                    <span className={`badge ${flight.status === 'ON_TIME' ? 'badge-success' : 'badge-warning'}`}>
                      {flight.status === 'ON_TIME' ? 'EN HORA' : 'DEMORADO'}
                    </span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {depDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Tarifa desde</span>
                      <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                        ${flight.price.toLocaleString('es-CO')}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}> COP</span>
                    </div>

                    <button
                      id={`reserve-btn-${flight.flightNumber}`}
                      onClick={() => handleReserve(flight)}
                      className="btn-primary"
                      style={{ padding: '8px 18px', fontSize: '0.9rem' }}
                    >
                      Reservar <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};
