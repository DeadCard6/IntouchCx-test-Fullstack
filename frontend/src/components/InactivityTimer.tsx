import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface InactivityTimerProps {
  expiresAt: string;
  onExpire?: () => void;
}

export const InactivityTimer: React.FC<InactivityTimerProps> = ({ expiresAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateSeconds = () => {
      const difference = new Date(expiresAt).getTime() - new Date().getTime();
      return Math.max(0, Math.floor(difference / 1000));
    };

    setTimeLeft(calculateSeconds());

    const interval = setInterval(() => {
      const remaining = calculateSeconds();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        if (onExpire) onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft < 180; // Less than 3 minutes

  return (
    <div
      id="inactivity-timer-badge"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 14px',
        borderRadius: '9999px',
        backgroundColor: isUrgent ? 'rgba(239, 68, 68, 0.15)' : 'rgba(6, 182, 212, 0.15)',
        border: `1px solid ${isUrgent ? 'rgba(239, 68, 68, 0.4)' : 'rgba(6, 182, 212, 0.4)'}`,
        color: isUrgent ? '#f87171' : 'var(--accent-cyan)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.9rem',
        fontWeight: 600,
      }}
    >
      {isUrgent ? <AlertTriangle size={16} /> : <Clock size={16} />}
      <span>
        Tiempo de retención de reserva: {String(minutes).padStart(2, '0')}:
        {String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
};
