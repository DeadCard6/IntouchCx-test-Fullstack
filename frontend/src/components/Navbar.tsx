import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Plane, Calendar, User as UserIcon, LogOut, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      id="main-navbar"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(11, 15, 25, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-glass)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand */}
        <Link
          to="/"
          id="nav-brand-link"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <Plane size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
              <span style={{ color: '#ffffff' }}>Aero</span>
              <span style={{ color: 'var(--accent-cyan)' }}>Intouch</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Reserva & Billetes
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link
            to="/flights"
            id="nav-flights-link"
            className={isActive('/flights') ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.875rem', padding: '8px 14px' }}
          >
            <Calendar size={16} />
            Consultar Vuelos
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/my-bookings"
                id="nav-bookings-link"
                className={isActive('/my-bookings') ? 'btn-primary' : 'btn-secondary'}
                style={{ fontSize: '0.875rem', padding: '8px 14px' }}
              >
                Mis Reservas
              </Link>

              <Link
                to="/profile"
                id="nav-profile-link"
                className={isActive('/profile') ? 'btn-primary' : 'btn-secondary'}
                style={{ fontSize: '0.875rem', padding: '8px 14px' }}
              >
                <UserIcon size={16} />
                {user?.fullName?.split(' ')[0] || 'Mi Perfil'}
              </Link>

              <button
                id="nav-logout-btn"
                onClick={handleLogout}
                className="btn-secondary"
                style={{ fontSize: '0.875rem', padding: '8px 12px', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                title="Cerrar sesión"
              >
                <LogOut size={16} color="#f87171" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                id="nav-login-link"
                className="btn-secondary"
                style={{ fontSize: '0.875rem', padding: '8px 14px' }}
              >
                <LogIn size={16} />
                Iniciar Sesión
              </Link>

              <Link
                to="/register"
                id="nav-register-link"
                className="btn-primary"
                style={{ fontSize: '0.875rem', padding: '8px 14px' }}
              >
                <UserPlus size={16} />
                Registrarse
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
