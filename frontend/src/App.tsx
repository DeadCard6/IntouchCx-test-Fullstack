import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { Navbar } from './components/Navbar.js';
import { Home } from './pages/Home.js';
import { Login } from './pages/Login.js';
import { Register } from './pages/Register.js';
import { FlightSearch } from './pages/FlightSearch.js';
import { BookingCheckout } from './pages/BookingCheckout.js';
import { MyBookings } from './pages/MyBookings.js';
import { Profile } from './pages/Profile.js';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <div style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/flights" element={<FlightSearch />} />
              <Route path="/checkout" element={<BookingCheckout />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <footer
            style={{
              padding: '24px 20px',
              textAlign: 'center',
              borderTop: '1px solid var(--border-glass)',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              backgroundColor: 'rgba(11, 15, 25, 0.95)',
            }}
          >
            © {new Date().getFullYear()} AeroIntouch — Sistema de Reserva de Vuelos (Prueba Técnica IntouchCX)
          </footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};
