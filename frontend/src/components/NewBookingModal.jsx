import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Mail, Phone, Bed, CreditCard, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { roomsAPI, reservationsAPI } from '../services/api';

export const NewBookingModal = ({ isOpen, onClose, onSuccess, initialRoomId = null }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form State
  const [selectedRoomId, setSelectedRoomId] = useState(initialRoomId || '');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Default check-out 2 days ahead
  const defaultCheckOut = new Date();
  defaultCheckOut.setDate(defaultCheckOut.getDate() + 2);
  const [checkOutDate, setCheckOutDate] = useState(defaultCheckOut.toISOString().split('T')[0]);
  
  const [adults, setAdults] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [source, setSource] = useState('walk_in');
  const [specialRequests, setSpecialRequests] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadAvailableRooms();
      if (initialRoomId) setSelectedRoomId(initialRoomId);
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, initialRoomId]);

  const loadAvailableRooms = async () => {
    try {
      const res = await roomsAPI.getRooms({ status: 'available' });
      setRooms(res.data);
      if (!selectedRoomId && res.data.length > 0) {
        setSelectedRoomId(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectedRoom = rooms.find(r => r.id === parseInt(selectedRoomId));
  
  // Calculate estimated total
  const nights = Math.max(1, Math.round((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)));
  const ratePerNight = selectedRoom?.category?.base_price || 200;
  const roomTotal = ratePerNight * nights;
  const tax = Math.round(roomTotal * 0.12 * 100) / 100;
  const grandTotal = roomTotal + tax;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRoomId) {
      setError('Please select a room.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const payload = {
        guest: {
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: phone,
          vip_status: 'Standard',
        },
        room_ids: [parseInt(selectedRoomId)],
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        adults: parseInt(adults),
        children: parseInt(childrenCount),
        source: source,
        special_requests: specialRequests
      };

      const res = await reservationsAPI.createReservation(payload);
      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess(res.data);
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create reservation. Room might be unavailable.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={20} color="#D4AF37" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0 }} className="gold-gradient-text">
              Create New Reservation & Walk-In
            </h3>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#FB7185',
              fontSize: '0.88rem',
              marginBottom: '16px'
            }}>
              <AlertCircle size={17} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#34D399',
              fontSize: '0.88rem',
              marginBottom: '16px'
            }}>
              <CheckCircle2 size={17} />
              <span>Reservation confirmed and Folio created successfully!</span>
            </div>
          )}

          {/* Guest Information Section */}
          <h4 style={{ fontSize: '0.85rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
            Guest Information
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '6px' }}>First Name *</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. James" 
                className="input-dark"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '6px' }}>Last Name *</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Harrison" 
                className="input-dark"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '6px' }}>Email Address *</label>
              <input 
                type="email" 
                required 
                placeholder="guest@example.com" 
                className="input-dark"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '6px' }}>Phone Number</label>
              <input 
                type="tel" 
                placeholder="+1 (555) 000-0000" 
                className="input-dark"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Stay & Room Details */}
          <h4 style={{ fontSize: '0.85rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
            Stay & Room Allocation
          </h4>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '6px' }}>Select Available Room *</label>
            <select 
              className="input-dark"
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              required
            >
              {rooms.map(r => (
                <option key={r.id} value={r.id}>
                  Room {r.room_number} — {r.category?.name} (${r.category?.base_price}/night) • {r.zone}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '6px' }}>Check-In Date *</label>
              <input 
                type="date" 
                required 
                className="input-dark"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '6px' }}>Check-Out Date *</label>
              <input 
                type="date" 
                required 
                className="input-dark"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '6px' }}>Adults</label>
              <input 
                type="number" 
                min="1" 
                max="8" 
                className="input-dark" 
                value={adults} 
                onChange={(e) => setAdults(e.target.value)} 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '6px' }}>Children</label>
              <input 
                type="number" 
                min="0" 
                max="6" 
                className="input-dark" 
                value={childrenCount} 
                onChange={(e) => setChildrenCount(e.target.value)} 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '6px' }}>Booking Channel</label>
              <select className="input-dark" value={source} onChange={(e) => setSource(e.target.value)}>
                <option value="walk_in">Walk-in Desk</option>
                <option value="direct_web">Direct Website</option>
                <option value="phone">Phone / Concierge</option>
                <option value="ota_booking">OTA Booking.com</option>
              </select>
            </div>
          </div>

          {/* Pricing Summary Card */}
          <div style={{
            background: 'rgba(212, 175, 55, 0.06)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            borderRadius: '10px',
            padding: '14px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94A3B8', marginBottom: '4px' }}>
              <span>{nights} Night(s) × ${ratePerNight}</span>
              <span style={{ color: '#F8FAFC' }}>${roomTotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94A3B8', marginBottom: '8px' }}>
              <span>Resort Tax & Service Fee (12%)</span>
              <span style={{ color: '#F8FAFC' }}>${tax.toFixed(2)}</span>
            </div>
            <div style={{ borderTop: '1px solid rgba(212, 175, 55, 0.2)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
              <span style={{ color: '#D4AF37' }}>Estimated Total:</span>
              <span style={{ color: '#D4AF37', fontSize: '1.1rem' }}>${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-gold">
              {loading ? 'Creating...' : 'Confirm & Generate Folio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
