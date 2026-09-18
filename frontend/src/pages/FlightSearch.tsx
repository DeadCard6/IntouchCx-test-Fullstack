import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plane,
  Clock,
  ArrowRight,
  Filter,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { ApiService } from '../services/api.js';
import { Flight } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';

const POPULAR_CITIES = [
  { code: 'BOG', name: 'Bogota (BOG)' },
  { code: 'MDE', name: 'Medellin (MDE)' },
  { code: 'CLO', name: 'Cali (CLO)' },
  { code: 'CTG', name: 'Cartagena (CTG)' },
  { code: 'BAQ', name: 'Barranquilla (BAQ)' },
  { code: 'SMR', name: 'Santa Marta (SMR)' },
  { code: 'ADZ', name: 'San Andres Isla (ADZ)' },
  { code: 'BGA', name: 'Bucaramanga (BGA)' },
  { code: 'PEI', name: 'Pereira (PEI)' },
  { code: 'CUC', name: 'Cucuta (CUC)' },
  { code: 'LET', name: 'Leticia (LET)' },
  { code: 'MTR', name: 'Monteria (MTR)' },
  { code: 'PSO', name: 'Pasto (PSO)' },
  { code: 'VUP', name: 'Valledupar (VUP)' },
  { code: 'NVA', name: 'Neiva (NVA)' },
];

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
      if (origin) params.origin = origin.trim();
      if (destination) params.destination = destination.trim();
      if (airline) params.airline = airline.trim();
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
    if (origin.trim()) newParams.origin = origin.trim();
    if (destination.trim()) newParams.destination = destination.trim();
    if (airline.trim()) newParams.airline = airline.trim();
    if (onlyDirect) newParams.onlyDirect = 'true';
    if (sortBy) newParams.sortBy = sortBy;
    setSearchParams(newParams);
    fetchFlights();
  };

  const handleResetFilters = () => {
    setOrigin('');
    setDestination('');
    setAirline('');
    setOnlyDirect(false);
    setSortBy('departure_asc');
    setSearchParams({});
    setTimeout(() => {
      ApiService.searchFlights({ sortBy: 'departure_asc' }).then((res) => setFlights(res.data));
    }, 50);
  };

  const handleQuickRoute = (origCode: string, destCode: string) => {
    setOrigin(origCode);
    setDestination(destCode);
    const newParams: Record<string, string> = { origin: origCode, destination: destCode };
    if (airline) newParams.airline = airline;
    if (onlyDirect) newParams.onlyDirect = 'true';
    if (sortBy) newParams.sortBy = sortBy;
    setSearchParams(newParams);
    ApiService.searchFlights(newParams).then((res) => setFlights(res.data));
  };

  const handleLookupStatus = async (flightNum: string) => {
    if (!flightNum.trim()) return;
    setStatusSearchQuery(flightNum.trim());
    setStatusLoading(true);
    setStatusError(null);
    setFlightStatusResult(null);

    try {
      const res = await ApiService.getFlightStatus(flightNum.trim());
      setFlightStatusResult(res.data);
    } catch (err: any) {
      setStatusError(err.message || `No se encontro vuelo con el identificador "${flightNum}"`);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleSearchStatus = (e: React.FormEvent) => {
    e.preventDefault();
    handleLookupStatus(statusSearchQuery);
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
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px' }}>
          Consulta y Reserva de Vuelos
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Horarios en tiempo real, comparacion de tarifas y disponibilidad nacional
        </p>
      </div>

      {/* Quick Route Shortcuts */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Rutas Populares:</span>
        <button
          type="button"
          onClick={() => handleQuickRoute('BOG', 'MDE')}
          className="btn-secondary"
          style={{ fontSize: '0.75rem', padding: '4px 10px' }}
        >
          Bogota a Medellin
        </button>
        <button
          type="button"
          onClick={() => handleQuickRoute('CLO', 'CTG')}
          className="btn-secondary"
          style={{ fontSize: '0.75rem', padding: '4px 10px' }}
        >
          Cali a Cartagena
        </button>
        <button
          type="button"
          onClick={() => handleQuickRoute('MDE', 'BAQ')}
          className="btn-secondary"
          style={{ fontSize: '0.75rem', padding: '4px 10px' }}
        >
          Medellin a Barranquilla
        </button>
        <button
          type="button"
          onClick={() => handleQuickRoute('BOG', 'CTG')}
          className="btn-secondary"
          style={{ fontSize: '0.75rem', padding: '4px 10px' }}
        >
          Bogota a Cartagena
        </button>
        <button
          type="button"
          onClick={() => handleQuickRoute('MDE', 'ADZ')}
          className="btn-secondary"
          style={{ fontSize: '0.75rem', padding: '4px 10px' }}
        >
          Medellin a San Andres
        </button>
      </div>

      {/* Flight Status Lookup Card (R6) */}
      <div
        id="flight-status-panel"
        className="glass-card"
        style={{
          padding: '24px',
          marginBottom: '28px',
          backgroundColor: 'rgba(6, 182, 212, 0.05)',
          borderColor: 'rgba(6, 182, 212, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', fontWeight: 700 }}>
            <Clock size={20} />
            <span style={{ fontSize: '1.05rem' }}>Consultar Estado de un Vuelo Especifico (R6)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>Ejemplos:</span>
            <button
              type="button"
              onClick={() => handleLookupStatus('AV-200')}
              className="badge"
              style={{ background: 'rgba(255,255,255,0.08)', cursor: 'pointer', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}
            >
              AV-200
            </button>
            <button
              type="button"
              onClick={() => handleLookupStatus('LA-202')}
              className="badge"
              style={{ background: 'rgba(255,255,255,0.08)', cursor: 'pointer', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}
            >
              LA-202
            </button>
            <button
              type="button"
              onClick={() => handleLookupStatus('WN-204')}
              className="badge"
              style={{ background: 'rgba(255,255,255,0.08)', cursor: 'pointer', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}
            >
              WN-204
            </button>
          </div>
        </div>

        <form onSubmit={handleSearchStatus} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            id="status-flight-number-input"
            type="text"
            className="form-input"
            placeholder="Ingresa el numero de vuelo (ej: AV-200, LA202, WN 204, o digitos)..."
            value={statusSearchQuery}
            onChange={(e) => setStatusSearchQuery(e.target.value)}
            style={{ flex: '1', minWidth: '260px' }}
          />
          <button id="status-search-btn" type="submit" disabled={statusLoading} className="btn-primary" style={{ padding: '10px 22px' }}>
            {statusLoading ? 'Consultando...' : 'Consultar Estado'}
          </button>
        </form>

        {statusError && (
          <div style={{ marginTop: '14px', color: '#f87171', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={16} />
            <span>[AVISO] {statusError}</span>
          </div>
        )}

        {flightStatusResult && (
          <div
            className="glass-panel animate-fade-in"
            style={{
              marginTop: '18px',
              padding: '20px',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 800, fontSize: '1.25rem', color: '#ffffff' }}>
                  {flightStatusResult.airline}
                </span>
                <span className="badge" style={{ backgroundColor: 'rgba(6, 182, 212, 0.2)', color: 'var(--accent-cyan)' }}>
                  {flightStatusResult.flightNumber}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {flightStatusResult.aircraftModel} | {flightStatusResult.availableSeats} asientos disponibles
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#ffffff' }}>
                {flightStatusResult.origin} a {flightStatusResult.destination}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Salida: {new Date(flightStatusResult.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {' - '}Llegada: {new Date(flightStatusResult.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <span
                className={`badge ${flightStatusResult.status === 'ON_TIME' ? 'badge-success' : 'badge-warning'}`}
                style={{ fontSize: '0.85rem', padding: '6px 14px' }}
              >
                {flightStatusResult.status === 'ON_TIME' ? 'EN HORA' : 'DEMORADO'}
              </span>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {flightStatusResult.isDirect ? 'Vuelo Directo' : flightStatusResult.stopsInfo || 'Con Escala'}
              </div>
            </div>

            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                ${flightStatusResult.price.toLocaleString('es-CO')} COP
              </div>
              <button
                onClick={() => handleReserve(flightStatusResult)}
                className="btn-primary"
                style={{ padding: '6px 16px', fontSize: '0.85rem' }}
              >
                Reservar Vuelo <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Datalists for Autocomplete */}
      <datalist id="city-options">
        {POPULAR_CITIES.map((c) => (
          <option key={c.code} value={c.name} />
        ))}
      </datalist>

      <datalist id="airline-options">
        <option value="Avianca" />
        <option value="LATAM" />
        <option value="Wingo" />
        <option value="Clic Air" />
        <option value="Satena" />
      </datalist>

      {/* Main Filter Panel (R1, R5) */}
      <form onSubmit={handleFilterSubmit} className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="filter-origin">
              Origen (Ciudad / Codigo)
            </label>
            <input
              id="filter-origin"
              type="text"
              list="city-options"
              className="form-input"
              placeholder="Ej: Cali, Medellin, Bogota..."
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
              list="city-options"
              className="form-input"
              placeholder="Ej: Cartagena, Barranquilla, Cali..."
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="filter-airline">
              Aerolinea
            </label>
            <input
              id="filter-airline"
              type="text"
              list="airline-options"
              className="form-input"
              placeholder="Todas o ej: LATAM, Avianca..."
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
              <option value="departure_asc">Horario de salida (Mas temprano)</option>
              <option value="price_asc">Tarifa: Menor a Mayor costo</option>
              <option value="price_desc">Tarifa: Mayor a Menor costo</option>
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

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={handleResetFilters} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
              <RotateCcw size={15} /> Limpiar Filtros
            </button>
            <button id="filter-submit-btn" type="submit" className="btn-primary">
              <Filter size={18} />
              Buscar Vuelos
            </button>
          </div>
        </div>
      </form>

      {/* Flight Results List */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            Vuelos Disponibles ({flights.length})
          </h2>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Tip: Haz clic en el codigo del vuelo (ej: AV-200) para ver su estado arriba
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
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
              Intenta buscar con otros origenes o restablece los filtros.
            </p>
            <button onClick={handleResetFilters} className="btn-secondary">
              Ver todos los vuelos
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {flights.slice(0, 100).map((flight) => {
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
                      <button
                        type="button"
                        onClick={() => handleLookupStatus(flight.flightNumber)}
                        className="badge"
                        title="Clic para consultar estado de este vuelo"
                        style={{
                          backgroundColor: 'rgba(6, 182, 212, 0.15)',
                          color: 'var(--accent-cyan)',
                          border: '1px solid rgba(6, 182, 212, 0.3)',
                          cursor: 'pointer',
                        }}
                      >
                        {flight.flightNumber}
                      </button>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {flight.aircraftModel} - {flight.availableSeats} asientos disp.
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
