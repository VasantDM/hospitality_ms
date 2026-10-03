import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Search, 
  LogIn, 
  LogOut, 
  Receipt, 
  User, 
  Mail, 
  Phone, 
  Clock, 
  CheckCircle, 
  Filter,
  Sparkles
} from 'lucide-react';
import { reservationsAPI } from '../services/api';

export const Bookings = ({ onOpenNewBooking, setActiveTab, setSelectedFolioId }) => {
  const [reservations, setReservations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const res = await reservationsAPI.getReservations();
      setReservations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (resId) => {
    try {
      setActionLoadingId(resId);
      await reservationsAPI.checkIn(resId);
      await loadReservations();
    } catch (err) {
      alert(err.response?.data?.detail || 'Check-in failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCheckOut = async (resId) => {
    if (!window.confirm('Confirm checkout for this guest? Room will be flagged dirty for housekeeping.')) return;
    try {
      setActionLoadingId(resId);
      await reservationsAPI.checkOut(resId);
      await loadReservations();
    } catch (err) {
      alert(err.response?.data?.detail || 'Checkout failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filtered = reservations.filter(r => {
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    const search = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      r.booking_code.toLowerCase().includes(search) ||
      r.guest?.first_name.toLowerCase().includes(search) ||
      r.guest?.last_name.toLowerCase().includes(search) ||
      r.guest?.email.toLowerCase().includes(search);
    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ padding: '28px' }}>
      {/* Title & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Guest Reservations & Front Desk</h2>
          <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: '4px 0 0' }}>Manage guest check-ins, bookings, stay durations, and folios</p>
        </div>
        <button onClick={onOpenNewBooking} className="btn-gold">
          New Reservation
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        {/* Status Filter Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['All', 'confirmed', 'checked_in', 'checked_out'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={statusFilter === st ? 'btn-gold' : 'btn-ghost'}
              style={{ padding: '6px 14px', fontSize: '0.8rem', textTransform: 'capitalize' }}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search by code, guest name..."
            className="input-dark"
            style={{ paddingLeft: '36px', height: '36px', fontSize: '0.85rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94A3B8', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '14px 20px' }}>Booking Code</th>
              <th style={{ padding: '14px 20px' }}>Guest Details</th>
              <th style={{ padding: '14px 20px' }}>Allocated Room(s)</th>
              <th style={{ padding: '14px 20px' }}>Check-In / Out</th>
              <th style={{ padding: '14px 20px' }}>Status</th>
              <th style={{ padding: '14px 20px' }}>Folio Est.</th>
              <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((res) => {
              const isLoading = actionLoadingId === res.id;
              const isCheckedIn = res.status === 'checked_in';
              const isConfirmed = res.status === 'confirmed';

              return (
                <tr key={res.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ fontWeight: '700', color: '#D4AF37', letterSpacing: '0.04em' }}>
                      {res.booking_code}
                    </span>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
                      via {res.source.replace('_', ' ')}
                    </div>
                  </td>

                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: '600', color: '#F8FAFC' }}>
                      {res.guest?.first_name} {res.guest?.last_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                      {res.guest?.email} • {res.guest?.phone || 'No phone'}
                    </div>
                    {res.guest?.vip_status !== 'Standard' && (
                      <span className="badge badge-gold" style={{ marginTop: '4px', fontSize: '0.65rem' }}>
                        {res.guest?.vip_status}
                      </span>
                    )}
                  </td>

                  <td style={{ padding: '16px 20px' }}>
                    {res.reservation_rooms?.map((rr) => (
                      <div key={rr.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: '700', color: '#38BDF8' }}>#{rr.room?.room_number}</span>
                        <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>({rr.room?.category?.name})</span>
                      </div>
                    ))}
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                      {res.adults} Adults, {res.children} Children
                    </div>
                  </td>

                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontSize: '0.82rem', color: '#CBD5E1' }}>
                      {res.check_in_date}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      to {res.check_out_date}
                    </div>
                  </td>

                  <td style={{ padding: '16px 20px' }}>
                    <span className={`badge badge-${res.status === 'checked_in' ? 'occupied' : res.status === 'confirmed' ? 'available' : 'dirty'}`}>
                      {res.status.replace('_', ' ')}
                    </span>
                  </td>

                  <td style={{ padding: '16px 20px', fontWeight: '600', color: '#F8FAFC' }}>
                    ${res.total_estimated?.toFixed(2)}
                  </td>

                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {isConfirmed && (
                        <button 
                          onClick={() => handleCheckIn(res.id)}
                          disabled={isLoading}
                          className="btn-gold"
                          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                        >
                          <LogIn size={13} />
                          <span>Check In</span>
                        </button>
                      )}

                      {isCheckedIn && (
                        <button 
                          onClick={() => handleCheckOut(res.id)}
                          disabled={isLoading}
                          className="btn-danger"
                          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                        >
                          <LogOut size={13} />
                          <span>Check Out</span>
                        </button>
                      )}

                      <button 
                        onClick={() => {
                          if (setSelectedFolioId) setSelectedFolioId(res.id);
                          setActiveTab('billing');
                        }}
                        className="btn-ghost"
                        style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                        title="View Guest Folio & Invoices"
                      >
                        <Receipt size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
