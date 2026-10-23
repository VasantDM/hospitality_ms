import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ onOpenNewBooking, occupancyRate = 40.0, setActiveTab }) => {
  const { currentUser } = useAuth();
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header style={{
      height: '74px',
      background: '#EDF6F9',
      borderBottom: '1px solid #E2EFF3',
      padding: '0 30px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 30
    }}>
      {/* Search Input Pill - Matching Screenshot */}
      <div style={{ position: 'relative', width: '380px' }}>
        <Search size={16} color="#64748B" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
        <input 
          type="text" 
          placeholder="Search room #, guest name, booking code..." 
          style={{
            width: '100%',
            height: '42px',
            background: '#FFFFFF',
            border: '1px solid #E2EFF3',
            borderRadius: '999px',
            padding: '0 16px 0 44px',
            fontSize: '0.86rem',
            color: '#0F172A',
            outline: 'none',
            boxShadow: '0 2px 8px rgba(8, 145, 178, 0.04)'
          }}
        />
      </div>

      {/* Right Controls - Action Chips, Clock, New Reservation Button & Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Check Availability Chip */}
        <button 
          onClick={() => setActiveTab && setActiveTab('rooms')}
          className="action-chip"
        >
          <CalendarCheck size={15} color="#0891B2" />
          <span>Check Availability</span>
        </button>

        {/* Digital Clock Chip */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          background: '#E2F4F7',
          padding: '6px 14px',
          borderRadius: '999px',
          fontSize: '0.82rem',
          fontWeight: '700',
          color: '#0E7490',
          border: '1px solid rgba(8, 145, 178, 0.15)'
        }}>
          <Clock size={14} color="#0891B2" />
          <span>{time || '05:54:00 PM'}</span>
        </div>

        {/* New Reservation Solid Teal Button */}
        <button 
          onClick={onOpenNewBooking}
          className="btn-teal"
          style={{ height: '40px', padding: '0 20px', gap: '6px' }}
        >
          <Plus size={16} />
          <span>New Reservation</span>
        </button>

        {/* Notification Bell */}
        <button style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: '#FFFFFF',
          border: '1px solid #E2EFF3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative'
        }}>
          <Bell size={17} color="#0891B2" />
          <span style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: '#22D3EE',
            boxShadow: '0 0 6px #22D3EE'
          }} />
        </button>

        {/* User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '6px' }}>
          <img 
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" 
            alt="Profile"
            style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #0891B2' }}
          />
          <div style={{ lineHeight: '1.2' }}>
            <div style={{ fontSize: '0.86rem', fontWeight: '700', color: '#0F172A' }}>
              {currentUser?.name || 'Alexander Wright'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '500' }}>
              {currentUser?.role || 'General Manager'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
