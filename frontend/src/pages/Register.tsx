import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, Lock, Mail, Phone, CreditCard, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    savedCardNumber: '',
    savedCardHolder: '',
    savedCardExpiry: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register(formData);
      navigate('/flights');
    } catch (err: any) {
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: '40px auto', padding: '0 20px' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'var(--accent-gradient)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              marginBottom: '16px',
            }}
          >
            <UserPlus size={24} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>Registro de Usuario</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Crea tu cuenta para acceder a compras y reservas remotas
          </p>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.875rem',
              marginBottom: '20px',
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="register-fullName">
              Nombre Completo *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="register-fullName"
                name="fullName"
                type="text"
                required
                className="form-input"
                style={{ width: '100%', paddingLeft: '38px' }}
                placeholder="Carlos Mendoza"
                value={formData.fullName}
                onChange={handleChange}
              />
              <User
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-email">
              Correo Electrónico (Login) *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="register-email"
                name="email"
                type="email"
                required
                className="form-input"
                style={{ width: '100%', paddingLeft: '38px' }}
                placeholder="carlos@correo.com"
                value={formData.email}
                onChange={handleChange}
              />
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-password">
              Contraseña *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="register-password"
                name="password"
                type="password"
                required
                minLength={6}
                className="form-input"
                style={{ width: '100%', paddingLeft: '38px' }}
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={handleChange}
              />
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-phoneNumber">
              Teléfono de Contacto (Opcional)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="register-phoneNumber"
                name="phoneNumber"
                type="tel"
                className="form-input"
                style={{ width: '100%', paddingLeft: '38px' }}
                placeholder="+57 300 000 0000"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
              <Phone
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
            </div>
          </div>

          {/* Opcional: Tarjeta Guardada para compras rápidas */}
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-glass)',
              margin: '20px 0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--accent-cyan)', fontSize: '0.9rem', fontWeight: 600 }}>
              <CreditCard size={18} />
              <span>Tarjeta de Crédito Simulada (Opcional)</span>
            </div>
            
            <div className="form-group" style={{ marginBottom: '10px' }}>
              <input
                id="register-savedCardNumber"
                name="savedCardNumber"
                type="text"
                className="form-input"
                style={{ width: '100%' }}
                placeholder="Número de tarjeta simulada (ej: 4532 1234 5678 9012)"
                value={formData.savedCardNumber}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input
                id="register-savedCardHolder"
                name="savedCardHolder"
                type="text"
                className="form-input"
                placeholder="Nombre Titular"
                value={formData.savedCardHolder}
                onChange={handleChange}
              />
              <input
                id="register-savedCardExpiry"
                name="savedCardExpiry"
                type="text"
                className="form-input"
                placeholder="MM/YY"
                value={formData.savedCardExpiry}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            id="register-submit-btn"
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '10px' }}
          >
            {loading ? 'Creando cuenta...' : 'Completar Registro'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" id="register-to-login-link" style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
};
