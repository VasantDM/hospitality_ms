import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Mail, Phone, Bed, CreditCard, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { roomsAPI, reservationsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

export const NewBookingModal = ({ isOpen, onClose, onSuccess, initialRoomId = null }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      loadAvailableRooms();
      if (initialRoomId) setSelectedRoomId(initialRoomId);
      setError(null);
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
          vip_status: 'Standard'
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
      toast.success(`Booking ${res.data.booking_code} created! Master folio opened.`);
      onSuccess && onSuccess(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create reservation.');
      toast.error('Booking creation failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="white-card" style={{ width: '100%', maxWidth: '580px', padding: '30px', maxHeight: '90vh', overflowY: 'auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <span className="badge-teal" style={{ marginBottom: '6px', display: 'inline-block' }}>
              Front Desk Allocation
            </span>
            <h3 style={{ margin: 0, fontSize: '1.35rem', color: '#0F172A', fontWeight: '800' }}>
              Create New Guest Reservation
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#EF4444', padding: '10px 14px', borderRadius: '10px', fontSize: '0.84rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* Guest Identity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', color: '#0F172A', marginBottom: '6px', fontWeight: '700' }}>First Name *</label>
              <input 
                type="text" 
                required 
                className="input-clean"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', color: '#0F172A', marginBottom: '6px', fontWeight: '700' }}>Last Name *</label>
              <input 
                type="text" 
                required 
                className="input-clean"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', color: '#0F172A', marginBottom: '6px', fontWeight: '700' }}>Email Address *</label>
              <input 
                type="email" 
                required 
                className="input-clean"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', color: '#0F172A', marginBottom: '6px', fontWeight: '700' }}>Phone Number</label>
              <input 
                type="tel" 
                className="input-clean"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Stay & Room Details */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.76rem', color: '#0F172A', marginBottom: '6px', fontWeight: '700' }}>Select Available Room *</label>
            <select 
              className="input-clean"
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              required
            >
              {rooms.map(r => (
                <option key={r.id} value={r.id}>
                  Room {r.room_number} — {r.category?.name} (₹{r.category?.base_price}/night) • {r.zone}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', color: '#0F172A', marginBottom: '6px', fontWeight: '700' }}>Check-In Date *</label>
              <input 
                type="date" 
                required 
                className="input-clean"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', color: '#0F172A', marginBottom: '6px', fontWeight: '700' }}>Check-Out Date *</label>
              <input 
                type="date" 
                required 
                className="input-clean"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', color: '#0F172A', marginBottom: '6px', fontWeight: '700' }}>Adults</label>
              <input 
                type="number" 
                min="1" 
                max="8" 
                className="input-clean" 
                value={adults} 
                onChange={(e) => setAdults(e.target.value)} 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', color: '#0F172A', marginBottom: '6px', fontWeight: '700' }}>Children</label>
              <input 
                type="number" 
                min="0" 
                max="6" 
                className="input-clean" 
                value={childrenCount} 
                onChange={(e) => setChildrenCount(e.target.value)} 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', color: '#0F172A', marginBottom: '6px', fontWeight: '700' }}>Channel</label>
              <select className="input-clean" value={source} onChange={(e) => setSource(e.target.value)}>
                <option value="walk_in">Walk-in Desk</option>
                <option value="direct_web">Direct Website</option>
                <option value="phone">Phone Concierge</option>
                <option value="ota_booking">OTA Booking.com</option>
              </select>
            </div>
          </div>

          {/* Pricing Summary Card */}
          <div style={{
            background: '#F8FDFF',
            border: '1px solid #E2EFF3',
            borderRadius: '12px',
            padding: '14px 18px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#64748B', marginBottom: '4px' }}>
              <span>{nights} Night(s) × ₹{ratePerNight}</span>
              <span style={{ color: '#0F172A', fontWeight: '600' }}>₹{roomTotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#64748B', marginBottom: '8px' }}>
              <span>Resort Occupancy Tax & Service (12%)</span>
              <span style={{ color: '#0F172A', fontWeight: '600' }}>₹{tax.toFixed(2)}</span>
            </div>
            <div style={{ borderTop: '1px solid #E2EFF3', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#0891B2', fontWeight: '800' }}>Estimated Total:</span>
              <span style={{ color: '#0891B2', fontSize: '1.25rem', fontWeight: '800' }}>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-teal">
              {loading ? 'Creating...' : 'Confirm & Open Master Folio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
