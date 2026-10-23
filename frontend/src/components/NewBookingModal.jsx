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
      setError('Please select an available room.');
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
        {/* Header - Rich Indigo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          background: 'linear-gradient(90deg, #2D3A82 0%, #1E275E 100%)',
          color: '#FFFFFF',
          borderTopLeftRadius: '18px',
          borderTopRightRadius: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={20} color="#E29578" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, color: '#FFFFFF' }}>
              Create New Reservation & Walk-In
            </h3>
          </div>
          <button 
            onClick={onClose}
            style={{ 
              background: 'rgba(255, 255, 255, 0.12)', 
              border: 'none', 
              color: '#FFFFFF', 
              cursor: 'pointer',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body - Pure Warm White */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', background: '#FFFFFF' }}>
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#B91C1C',
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
              background: '#ECFDF5',
              border: '1px solid #6EE7B7',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#047857',
              fontSize: '0.88rem',
              marginBottom: '16px'
            }}>
              <CheckCircle2 size={17} />
              <span>Reservation confirmed and Master Folio created successfully!</span>
            </div>
          )}

          {/* Guest Information Section */}
          <h4 style={{ fontSize: '0.85rem', color: '#2D3A82', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px', fontWeight: '800' }}>
            Guest Information
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#4B5563', marginBottom: '6px', fontWeight: '600' }}>First Name *</label>
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
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#4B5563', marginBottom: '6px', fontWeight: '600' }}>Last Name *</label>
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
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#4B5563', marginBottom: '6px', fontWeight: '600' }}>Email Address *</label>
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
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#4B5563', marginBottom: '6px', fontWeight: '600' }}>Phone Number</label>
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
          <h4 style={{ fontSize: '0.85rem', color: '#2D3A82', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px', fontWeight: '800' }}>
            Stay & Room Allocation
          </h4>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#4B5563', marginBottom: '6px', fontWeight: '600' }}>Select Available Room *</label>
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
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#4B5563', marginBottom: '6px', fontWeight: '600' }}>Check-In Date *</label>
              <input 
                type="date" 
                required 
                className="input-dark"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#4B5563', marginBottom: '6px', fontWeight: '600' }}>Check-Out Date *</label>
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
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#4B5563', marginBottom: '6px', fontWeight: '600' }}>Adults</label>
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
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#4B5563', marginBottom: '6px', fontWeight: '600' }}>Children</label>
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
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#4B5563', marginBottom: '6px', fontWeight: '600' }}>Channel</label>
              <select className="input-dark" value={source} onChange={(e) => setSource(e.target.value)}>
                <option value="walk_in">Walk-in Desk</option>
                <option value="direct_web">Direct Website</option>
                <option value="phone">Phone / Concierge</option>
                <option value="ota_booking">OTA Booking.com</option>
              </select>
            </div>
          </div>

          {/* Pricing Summary Card - Pure Warm White with Muted Amber border */}
          <div style={{
            background: '#FDF3EE',
            border: '1px solid rgba(226, 149, 120, 0.4)',
            borderRadius: '10px',
            padding: '14px 18px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#4B5563', marginBottom: '4px' }}>
              <span>{nights} Night(s) × ${ratePerNight}</span>
              <span style={{ color: '#1F2937', fontWeight: '600' }}>${roomTotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#4B5563', marginBottom: '8px' }}>
              <span>Resort Tax & Service Fee (12%)</span>
              <span style={{ color: '#1F2937', fontWeight: '600' }}>${tax.toFixed(2)}</span>
            </div>
            <div style={{ borderTop: '1px solid rgba(226, 149, 120, 0.3)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#2D3A82', fontWeight: '700' }}>Estimated Total:</span>
              <span style={{ color: '#E29578', fontSize: '1.25rem', fontWeight: '800' }}>${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-amber">
              {loading ? 'Creating...' : 'Confirm Reservation & Open Folio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
