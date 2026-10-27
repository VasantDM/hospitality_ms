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
  Sparkles,
  PlusCircle,
  Download
} from 'lucide-react';
import { reservationsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

export const Bookings = ({ onOpenNewBooking, setActiveTab, setSelectedFolioId }) => {
  const [reservations, setReservations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const toast = useToast();

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
      toast.success('Guest successfully checked in! Room set to Occupied.');
      await loadReservations();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Check-in failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCheckOut = async (resId) => {
    try {
      setActionLoadingId(resId);
      await reservationsAPI.checkOut(resId);
      toast.success('Guest checked out. Room flagged dirty & cleaning task dispatched.');
      await loadReservations();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Checkout failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  const exportCSV = () => {
    if (reservations.length === 0) return;
    const headers = ['Booking Code', 'Guest Name', 'Email', 'Check-In', 'Check-Out', 'Status', 'Total Estimated'];
    const rows = reservations.map(r => [
      r.booking_code,
      `"${r.guest?.first_name} ${r.guest?.last_name}"`,
      r.guest?.email,
      r.check_in_date,
      r.check_out_date,
      r.status,
      r.total_estimated
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Grand_Vista_Bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Bookings exported to CSV successfully!');
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* Title & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0, color: '#0F172A' }}>
            Guest Reservations & Ledger
          </h2>
          <p style={{ fontSize: '0.86rem', color: '#64748B', margin: '4px 0 0' }}>
            Manage guest check-ins, bookings, stay durations, and folios
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={exportCSV} className="btn-ghost" title="Export to CSV">
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <button onClick={onOpenNewBooking} className="btn-teal">
            <PlusCircle size={16} />
            <span>New Reservation</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="white-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        {/* Status Filter Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['All', 'confirmed', 'checked_in', 'checked_out'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={statusFilter === st ? 'btn-teal' : 'btn-ghost'}
              style={{ padding: '7px 16px', fontSize: '0.8rem', textTransform: 'capitalize' }}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} color="#64748B" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search by code, guest name..."
            className="input-clean"
            style={{ paddingLeft: '38px', height: '38px', fontSize: '0.85rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="white-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ background: '#F8FDFF', borderBottom: '1px solid #E2EFF3', color: '#475569', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700' }}>
              <th style={{ padding: '16px 20px' }}>Booking Code</th>
              <th style={{ padding: '16px 20px' }}>Guest Details</th>
              <th style={{ padding: '16px 20px' }}>Allocated Room(s)</th>
              <th style={{ padding: '16px 20px' }}>Check-In / Out</th>
              <th style={{ padding: '16px 20px' }}>Status</th>
              <th style={{ padding: '16px 20px' }}>Folio Est.</th>
              <th style={{ padding: '16px 20px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((res) => {
              const isLoading = actionLoadingId === res.id;
              const isCheckedIn = res.status === 'checked_in';
              const isConfirmed = res.status === 'confirmed';

              return (
                <tr key={res.id} style={{ borderBottom: '1px solid #F1F8FA' }}>
                  <td style={{ padding: '16px 20px', fontWeight: '800', color: '#0891B2' }}>
                    {res.booking_code}
                  </td>

                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: '700', color: '#0F172A' }}>
                      {res.guest?.first_name} {res.guest?.last_name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                      {res.guest?.email} • {res.guest?.phone}
                    </div>
                  </td>

                  <td style={{ padding: '16px 20px' }}>
                    {res.reservation_rooms?.map(rr => (
                      <div key={rr.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F8FDFF', border: '1px solid #E2EFF3', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600' }}>
                        Room #{rr.room?.room_number} ({rr.room?.category?.name})
                      </div>
                    ))}
                  </td>

                  <td style={{ padding: '16px 20px', fontSize: '0.82rem', color: '#475569' }}>
                    <div><strong>In:</strong> {res.check_in_date}</div>
                    <div><strong>Out:</strong> {res.check_out_date}</div>
                  </td>

                  <td style={{ padding: '16px 20px' }}>
                    <span className={isCheckedIn ? 'badge-teal' : isConfirmed ? 'badge-amber' : 'badge-teal'}>
                      {res.status.replace('_', ' ')}
                    </span>
                  </td>

                  <td style={{ padding: '16px 20px', fontWeight: '800', color: '#0F172A' }}>
                    ₹{res.total_estimated?.toFixed(2)}
                  </td>

                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {isConfirmed && (
                        <button
                          disabled={isLoading}
                          onClick={() => handleCheckIn(res.id)}
                          className="btn-teal"
                          style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                        >
                          <LogIn size={13} />
                          <span>Check In</span>
                        </button>
                      )}

                      {isCheckedIn && (
                        <button
                          disabled={isLoading}
                          onClick={() => handleCheckOut(res.id)}
                          className="btn-amber-outline"
                          style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                        >
                          <LogOut size={13} />
                          <span>Check Out</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSelectedFolioId(res.id);
                          setActiveTab('billing');
                        }}
                        className="btn-ghost"
                        style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                      >
                        <Receipt size={13} />
                        <span>Folio</span>
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
