import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, CreditCard, Save, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { ApiService } from '../services/api.js';

export const Profile: React.FC = () => {
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || '',
    savedCardNumber: user?.savedCardNumber || '',
    savedCardHolder: user?.savedCardHolder || '',
    savedCardExpiry: user?.savedCardExpiry || '',
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await ApiService.updateProfile(formData);
      updateUser(res.data);
      setSuccessMsg('Perfil actualizado correctamente');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      '¿Estás seguro de que deseas cancelar y eliminar tu registro de usuario? Esta acción no se puede deshacer.'
    );

    if (confirmDelete) {
      try {
        await ApiService.deleteAccount();
        logout();
        alert('Tu cuenta ha sido eliminada con éxito.');
        navigate('/login');
      } catch (err: any) {
        setErrorMsg(err.message || 'Error al eliminar la cuenta');
      }
    }
  };

  return (
    <main style={{ maxWidth: '640px', margin: '30px auto', padding: '0 20px' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <User size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Gestión de Perfil</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Modifica tus datos personales o cancela tu registro en el sistema
            </p>
          </div>
        </div>

        {successMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399', marginBottom: '20px' }}>
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171', marginBottom: '20px' }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label className="form-label">Correo Electrónico (Login)</label>
            <input
              type="email"
              disabled
              className="form-input"
              value={user?.email || ''}
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              El identificador de acceso es único y no modificable.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="profile-fullName">
              Nombre Completo *
            </label>
            <input
              id="profile-fullName"
              name="fullName"
              type="text"
              required
              className="form-input"
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="profile-phoneNumber">
              Teléfono de Contacto
            </label>
            <input
              id="profile-phoneNumber"
              name="phoneNumber"
              type="tel"
              className="form-input"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </div>

          {/* Tarjeta Guardada */}
          <div style={{ padding: '18px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)', margin: '24px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: 'var(--accent-cyan)', fontWeight: 600 }}>
              <CreditCard size={18} />
              <span>Tarjeta de Crédito Simulada Guardada</span>
            </div>

            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label">Número de Tarjeta</label>
              <input
                name="savedCardNumber"
                type="text"
                className="form-input"
                placeholder="4532 **** **** 8888"
                value={formData.savedCardNumber}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Titular</label>
                <input
                  name="savedCardHolder"
                  type="text"
                  className="form-input"
                  placeholder="NOMBRE APELLIDO"
                  value={formData.savedCardHolder}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Vencimiento (MM/YY)</label>
                <input
                  name="savedCardExpiry"
                  type="text"
                  className="form-input"
                  placeholder="12/28"
                  value={formData.savedCardExpiry}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px' }}>
            <button id="profile-save-btn" type="submit" disabled={loading} className="btn-primary" style={{ padding: '10px 24px' }}>
              <Save size={16} />
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>

            <button
              id="profile-delete-btn"
              type="button"
              onClick={handleDeleteAccount}
              className="btn-secondary"
              style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)', padding: '10px 18px' }}
            >
              <Trash2 size={16} />
              Cancelar Registro
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};
