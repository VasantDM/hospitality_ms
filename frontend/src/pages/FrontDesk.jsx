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
import { useToast } from '../context/ToastContext';

export const FrontDesk = ({ onOpenNewBookingWithRoom, setActiveTab, setSelectedFolioId }) => {
  const [rooms, setRooms] = useState([]);
  const [selectedZone, setSelectedZone] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const toast = useToast();

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
      toast.success(`Room marked ${newCleanStatus}!`);
      await loadRooms();
    } catch (err) {
      toast.error('Failed to update room cleanliness');
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* Title & Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0, color: '#0F172A' }}>
            Front Office Room Matrix
          </h2>
          <p style={{ fontSize: '0.86rem', color: '#64748B', margin: '4px 0 0' }}>
            Real-time inventory grid, room cleanliness states, and express check-in / check-out
          </p>
        </div>

        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {['All', 'available', 'occupied', 'dirty', 'out_of_order'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={statusFilter === st ? 'btn-teal' : 'btn-ghost'}
              style={{ padding: '7px 16px', fontSize: '0.8rem', textTransform: 'capitalize' }}
            >
              {st === 'dirty' ? 'Pending Clean' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Zone Selector Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #E2EFF3', paddingBottom: '14px', overflowX: 'auto' }}>
        {zones.map((zone) => (
          <button
            key={zone}
            onClick={() => setSelectedZone(zone)}
            style={{
              background: selectedZone === zone ? '#0891B2' : '#FFFFFF',
              border: selectedZone === zone ? '1px solid #0891B2' : '1px solid #E2EFF3',
              color: selectedZone === zone ? '#FFFFFF' : '#475569',
              padding: '8px 18px',
              borderRadius: '999px',
              fontSize: '0.86rem',
              fontWeight: '700',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: selectedZone === zone ? '0 4px 12px rgba(8, 145, 178, 0.25)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            {zone}
          </button>
        ))}
      </div>

      {/* Interactive Room Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {filteredRooms.map((room) => {
          const isOccupied = room.status === 'occupied';
          const isAvailable = room.status === 'available';
          const isDirty = room.clean_status === 'dirty' || room.clean_status === 'in_progress';
          const isOOO = room.status === 'out_of_order';

          return (
            <div 
              key={room.id}
              className="white-card"
              style={{
                padding: '22px',
                borderTop: isOccupied 
                  ? '4px solid #0891B2' 
                  : isAvailable && !isDirty 
                    ? '4px solid #10B981' 
                    : isDirty 
                      ? '4px solid #F97316' 
                      : '4px solid #EF4444',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Header: Room Number & Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0F172A' }}>
                    #{room.room_number}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '600' }}>Floor {room.floor}</span>
                </div>

                <span style={{
                  padding: '3px 10px',
                  borderRadius: '999px',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  background: isOccupied ? '#E0F2FE' : isAvailable ? '#ECFDF5' : '#FFF7ED',
                  color: isOccupied ? '#0369A1' : isAvailable ? '#059669' : '#C2410C',
                  border: '1px solid currentColor'
                }}>
                  {room.status.replace('_', ' ')}
                </span>
              </div>

              {/* Room Category & Features */}
              <div style={{ marginBottom: '14px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                  {room.category?.name}
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0' }}>
                  {room.zone} • {room.category?.bed_type}
                </p>
              </div>

              {/* Cleanliness Status Indicator */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                background: '#F8FDFF',
                border: '1px solid #E2EFF3',
                padding: '8px 12px',
                borderRadius: '8px',
                marginBottom: '18px',
                fontSize: '0.82rem'
              }}>
                <span style={{ color: '#475569', fontWeight: '600' }}>Housekeeping:</span>
                <span style={{
                  fontWeight: '700',
                  color: room.clean_status === 'clean' || room.clean_status === 'inspected' ? '#059669' : '#EA580C',
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
                    className="btn-teal" 
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
                    style={{ flex: 1, padding: '8px 12px', fontSize: '0.82rem', color: '#0891B2', borderColor: '#0891B2' }}
                  >
                    <Receipt size={15} />
                    <span>View Folio</span>
                  </button>
                )}

                {isDirty && (
                  <button 
                    onClick={() => handleStatusChange(room.id, 'clean')}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      fontSize: '0.82rem',
                      background: '#10B981',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '999px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontWeight: '700'
                    }}
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
