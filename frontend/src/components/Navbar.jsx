import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  PlusCircle, 
  Calendar, 
  Clock, 
  Sparkles, 
  ShieldAlert,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ onOpenNewBooking, occupancyRate = 78.5 }) => {
  const { currentUser } = useAuth();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header style={{
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '14px 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 30
    }}>
      {/* Search and Resort Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{
          position: 'relative',
          width: '320px'
        }}>
          <Search size={17} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search room #, guest name, booking code..."
            className="input-dark"
            style={{
              paddingLeft: '38px',
              height: '38px',
              fontSize: '0.85rem',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.09)'
            }}
          />
        </div>

        {/* Live Occupancy Pulse */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          padding: '6px 14px',
          borderRadius: '999px',
          fontSize: '0.8rem',
          color: '#34D399',
          fontWeight: '600'
        }}>
          <span className="pulse-dot dot-emerald"></span>
          <span>Resort Occupancy: {occupancyRate}%</span>
        </div>
      </div>

      {/* Right Controls: Clock, Actions, User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Live Clock */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          color: '#94A3B8',
          fontSize: '0.82rem',
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '6px 12px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <Clock size={15} color="#D4AF37" />
          <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>

        {/* New Reservation / Walk-In Button */}
        <button 
          onClick={onOpenNewBooking}
          className="btn-gold"
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <PlusCircle size={16} />
          <span>New Reservation</span>
        </button>

        {/* Notification Bell */}
        <button style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#94A3B8',
          position: 'relative'
        }}>
          <Bell size={17} />
          <span style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '7px',
            height: '7px',
            background: '#F43F5E',
            borderRadius: '50%'
          }}></span>
        </button>
      </div>
    </header>
  );
};
