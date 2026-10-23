import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  PlusCircle, 
  CalendarCheck, 
  Clock, 
  Sparkles
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
      background: 'linear-gradient(90deg, #2D3A82 0%, #222C66 100%)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '14px 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 30,
      boxShadow: '0 4px 16px rgba(45, 58, 130, 0.15)'
    }}>
      {/* Search and Resort Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        <div style={{
          position: 'relative',
          width: '320px'
        }}>
          <Search size={17} color="#6B7280" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search room #, guest name, booking code..."
            style={{
              width: '100%',
              paddingLeft: '40px',
              paddingRight: '14px',
              height: '38px',
              fontSize: '0.85rem',
              borderRadius: '999px',
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              color: '#1F2937',
              outline: 'none',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
            }}
          />
        </div>

        {/* Check Availability CTA Chip (Muted Amber) */}
        <button
          onClick={onOpenNewBooking}
          className="cta-chip-solid"
          title="Instantly check live room matrix and open allocations"
        >
          <CalendarCheck size={14} />
          <span>Check Availability</span>
        </button>

        {/* Live Occupancy Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.12)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '6px 14px',
          borderRadius: '999px',
          fontSize: '0.8rem',
          color: '#FFFFFF',
          fontWeight: '600'
        }}>
          <span className="pulse-dot dot-emerald"></span>
          <span>Occupancy: {occupancyRate}%</span>
        </div>
      </div>

      {/* Right Controls: Clock, Actions, User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Live Clock */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          color: '#E2E8F0',
          fontSize: '0.82rem',
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '6px 14px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          fontWeight: '500'
        }}>
          <Clock size={15} color="#E29578" />
          <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>

        {/* New Reservation Button (Muted Amber) */}
        <button 
          onClick={onOpenNewBooking}
          className="btn-amber"
          style={{ padding: '8px 18px', fontSize: '0.85rem' }}
        >
          <PlusCircle size={16} />
          <span>New Reservation</span>
        </button>

        {/* Notification Bell */}
        <button style={{
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#FFFFFF',
          position: 'relative'
        }}>
          <Bell size={17} />
          <span style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '7px',
            height: '7px',
            background: '#E29578',
            borderRadius: '50%',
            boxShadow: '0 0 6px #E29578'
          }}></span>
        </button>
      </div>
    </header>
  );
};
