import React, { useState, useEffect } from 'react';
import { 
  Grid3X3, 
  Filter, 
  CheckCircle2, 
  LogOut, 
  LogIn, 
  Sparkles, 
  AlertTriangle, 
  Key, 
  Receipt,
  User,
  Calendar,
  Layers,
  CalendarCheck
} from 'lucide-react';
import { roomsAPI, reservationsAPI, foliosAPI } from '../services/api';

export const FrontDesk = ({ onOpenNewBookingWithRoom, setActiveTab, setSelectedFolioId }) => {
  const [rooms, setRooms] = useState([]);
  const [selectedZone, setSelectedZone] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const res = await roomsAPI.getRooms();
      setRooms(res.data);
    } catch (err) {
      console.error('Failed to load rooms', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (roomId, newCleanStatus) => {
    try {
      setActionLoading(true);
      await roomsAPI.updateRoom(roomId, { clean_status: newCleanStatus });
      await loadRooms();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const zones = ['All', 'Beachfront Wing', 'Hilltop Villas', 'Main Resort Wing', 'Skyline Tower'];

  const filteredRooms = rooms.filter(room => {
    const matchesZone = selectedZone === 'All' || room.zone === selectedZone;
    const matchesStatus = statusFilter === 'All' || room.status === statusFilter;
    return matchesZone && matchesStatus;
  });

  return (
    <div style={{ padding: '28px' }}>
      {/* Title & Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0, color: '#1F2937' }}>Front Office Room Matrix</h2>
          <p style={{ fontSize: '0.86rem', color: '#6B7280', margin: '4px 0 0' }}>Real-time inventory grid and express check-in / check-out dispatch</p>
        </div>

        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {['All', 'available', 'occupied', 'dirty', 'out_of_order'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={statusFilter === st ? 'btn-amber' : 'btn-ghost'}
              style={{ padding: '7px 14px', fontSize: '0.8rem', textTransform: 'capitalize' }}
            >
              {st === 'dirty' ? 'Pending Clean' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Zone Selector Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #E5E9F2', paddingBottom: '14px', marginBottom: '24px', overflowX: 'auto' }}>
        {zones.map((zone) => (
          <button
            key={zone}
            onClick={() => setSelectedZone(zone)}
            style={{
              background: selectedZone === zone ? '#2D3A82' : '#FFFFFF',
              border: selectedZone === zone ? '1px solid #2D3A82' : '1px solid #E5E7EB',
              color: selectedZone === zone ? '#FFFFFF' : '#4B5563',
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: selectedZone === zone ? '0 4px 12px rgba(45, 58, 130, 0.25)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            {zone}
          </button>
        ))}
      </div>

      {/* Interactive Room Grid - Pure Warm White Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {filteredRooms.map((room) => {
          const isOccupied = room.status === 'occupied';
          const isAvailable = room.status === 'available';
          const isDirty = room.clean_status === 'dirty' || room.clean_status === 'in_progress';
          const isOOO = room.status === 'out_of_order';

          return (
            <div 
              key={room.id}
              className="glass-card glass-card-interactive"
              style={{
                padding: '22px',
                borderTop: isOccupied 
                  ? '4px solid #2D3A82' 
                  : isAvailable && !isDirty 
                    ? '4px solid #10B981' 
                    : isDirty 
                      ? '4px solid #F59E0B' 
                      : '4px solid #EF4444',
                position: 'relative'
              }}
            >
              {/* Header: Room Number & Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    fontSize: '1.3rem',
                    fontWeight: '800',
                    color: '#1F2937'
                  }}>
                    #{room.room_number}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: '500' }}>Floor {room.floor}</span>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <span className={`badge badge-${room.status}`}>
                    {room.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Room Category & Features */}
              <div style={{ marginBottom: '14px' }}>
                <h4 style={{ fontSize: '0.98rem', fontWeight: '700', color: '#1F2937', margin: 0 }}>
                  {room.category?.name}
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: '4px 0 0' }}>
                  {room.zone} • {room.category?.bed_type}
                </p>
              </div>

              {/* Cleanliness Status Indicator */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                background: '#F8FAFD',
                border: '1px solid #E5E9F2',
                padding: '8px 12px',
                borderRadius: '8px',
                marginBottom: '18px',
                fontSize: '0.82rem'
              }}>
                <span style={{ color: '#4B5563', fontWeight: '500' }}>Housekeeping:</span>
                <span style={{
                  fontWeight: '700',
                  color: room.clean_status === 'clean' || room.clean_status === 'inspected' ? '#059669' : '#D97706',
                  textTransform: 'capitalize'
                }}>
                  {room.clean_status}
                </span>
              </div>

              {/* Bottom Actions */}
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                {isAvailable && (
                  <button 
                    onClick={() => onOpenNewBookingWithRoom(room.id)}
                    className="btn-amber" 
                    style={{ flex: 1, padding: '8px 12px', fontSize: '0.82rem' }}
                  >
                    <LogIn size={15} />
                    <span>Assign / Check-In</span>
                  </button>
                )}

                {isOccupied && (
                  <button 
                    onClick={() => {
                      setActiveTab('reservations');
                    }}
                    className="btn-ghost" 
                    style={{ flex: 1, padding: '8px 12px', fontSize: '0.82rem', color: '#2D3A82', borderColor: '#2D3A82' }}
                  >
                    <Receipt size={15} />
                    <span>View Folio / Checkout</span>
                  </button>
                )}

                {isDirty && (
                  <button 
                    onClick={() => handleStatusChange(room.id, 'clean')}
                    className="btn-emerald"
                    style={{ flex: 1, padding: '8px 12px', fontSize: '0.82rem' }}
                  >
                    <CheckCircle2 size={15} />
                    <span>Mark Clean</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
