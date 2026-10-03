import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  Sparkles, 
  BedDouble, 
  Check, 
  CreditCard, 
  MapPin, 
  Award, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle2,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { roomsAPI, reservationsAPI } from '../services/api';

export const GuestPortal = ({ onBookingSuccess }) => {
  const [categories, setCategories] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [checkIn, setCheckIn] = useState(new Date().toISOString().split('T')[0]);
  
  const dOut = new Date();
  dOut.setDate(dOut.getDate() + 3);
  const [checkOut, setCheckOut] = useState(dOut.toISOString().split('T')[0]);
  
  const [adults, setAdults] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);

  // Booking Modal
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cRes, rRes] = await Promise.all([
        roomsAPI.getCategories(),
        roomsAPI.getRooms({ status: 'available' })
      ]);
      setCategories(cRes.data);
      setAvailableRooms(rRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const nights = Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)));

  const handleOpenBooking = (cat) => {
    setSelectedCategory(cat);
    setConfirmedBooking(null);
  };

  const handleConfirmGuestBooking = async (e) => {
    e.preventDefault();
    if (!selectedCategory) return;
    setSubmitting(true);

    try {
      // Find an available room for this category
      const targetRoom = availableRooms.find(r => r.category_id === selectedCategory.id);
      if (!targetRoom) {
        alert('Sorry, all units in this category are fully booked for the selected dates.');
        setSubmitting(false);
        return;
      }

      const names = guestName.trim().split(' ');
      const fName = names[0] || 'Guest';
      const lName = names.slice(1).join(' ') || 'Customer';

      const payload = {
        guest: {
          first_name: fName,
          last_name: lName,
          email: guestEmail,
          phone: guestPhone,
          vip_status: 'Standard'
        },
        room_ids: [targetRoom.id],
        check_in_date: checkIn,
        check_out_date: checkOut,
        adults: parseInt(adults),
        children: parseInt(childrenCount),
        source: 'direct_web',
        special_requests: 'Booked via Grand Vista Luxury Web Portal'
      };

      const res = await reservationsAPI.createReservation(payload);
      setConfirmedBooking(res.data);
      
      // Fire celebration confetti!
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#070A12' }}>
      {/* Hero Banner */}
      <div style={{
        position: 'relative',
        padding: '70px 40px 60px',
        textAlign: 'center',
        backgroundImage: 'linear-gradient(180deg, rgba(7, 10, 18, 0.4) 0%, #070A12 100%), url("https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(212, 175, 55, 0.15)',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          padding: '6px 16px',
          borderRadius: '999px',
          color: '#F3E5AB',
          fontSize: '0.85rem',
          fontWeight: '600',
          marginBottom: '16px'
        }}>
          <Sparkles size={16} color="#D4AF37" />
          <span>Awarded World Luxury Hotel & Resort 2026</span>
        </div>

        <h1 style={{ fontSize: '2.8rem', fontWeight: '800', margin: '0 0 12px 0', letterSpacing: '-0.02em' }}>
          Experience Serenity at <span className="gold-gradient-text">Grand Vista Resort</span>
        </h1>
        <p style={{ color: '#CBD5E1', fontSize: '1.1rem', maxWidth: '680px', margin: '0 auto 32px', lineHeight: '1.5' }}>
          Unwind in private oceanfront pool villas, award-winning culinary dining, and bespoke wellness sanctuaries.
        </p>

        {/* Floating Reservation Search Bar */}
        <div className="glass-card" style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: '20px 28px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          alignItems: 'center',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#D4AF37', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>
              Check-In
            </label>
            <input 
              type="date" 
              className="input-dark"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#D4AF37', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>
              Check-Out
            </label>
            <input 
              type="date" 
              className="input-dark"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#D4AF37', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>
              Guests
            </label>
            <select 
              className="input-dark"
              value={adults}
              onChange={(e) => setAdults(e.target.value)}
            >
              <option value="1">1 Adult</option>
              <option value="2">2 Adults</option>
              <option value="3">3 Adults</option>
              <option value="4">4 Adults</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#D4AF37', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>
              Duration
            </label>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#F8FAFC', padding: '9px 0' }}>
              {nights} Night(s) Stay
            </div>
          </div>
        </div>
      </div>

      {/* Luxury Room Showcase */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '50px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', margin: '0 0 8px 0' }}>
            Featured Suites & Private Villas
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.95rem' }}>
            Includes complimentary champagne on arrival, high-speed fiber WiFi, and 24/7 in-room dining
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '30px' }}>
          {categories.map((cat) => {
            const catRooms = availableRooms.filter(r => r.category_id === cat.id);
            const isAvailable = catRooms.length > 0;
            const totalEstimated = cat.base_price * nights;

            return (
              <div key={cat.id} className="glass-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '220px', position: 'relative' }}>
                  <img 
                    src={cat.image_url} 
                    alt={cat.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '14px',
                    left: '14px',
                    background: 'rgba(11, 15, 25, 0.85)',
                    backdropFilter: 'blur(8px)',
                    padding: '5px 12px',
                    borderRadius: '999px',
                    color: isAvailable ? '#34D399' : '#FB7185',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    border: `1px solid ${isAvailable ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`
                  }}>
                    {isAvailable ? `● ${catRooms.length} Villas Available` : 'Sold Out for Dates'}
                  </div>
                </div>

                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#F8FAFC', margin: 0 }}>
                        {cat.name}
                      </h3>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: '1.5', marginBottom: '16px' }}>
                      {cat.description}
                    </p>

                    {/* Bed and capacity */}
                    <div style={{ display: 'flex', gap: '14px', fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '16px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Users size={14} color="#D4AF37" /> Max {cat.capacity_adults} Guests
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <BedDouble size={14} color="#D4AF37" /> {cat.bed_type}
                      </span>
                    </div>

                    {/* Amenities */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                      {cat.amenities?.split(',').slice(0, 4).map((am, i) => (
                        <span key={i} style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', color: '#94A3B8' }}>
                          ✓ {am.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pricing and Book Button */}
                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#D4AF37' }}>
                        ${cat.base_price} <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>/ night</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                        ${totalEstimated} total for {nights} nights
                      </div>
                    </div>

                    <button 
                      onClick={() => handleOpenBooking(cat)}
                      disabled={!isAvailable}
                      className="btn-gold" 
                      style={{ padding: '10px 18px' }}
                    >
                      <span>Reserve Now</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Online Guest Booking Modal */}
      {selectedCategory && (
        <div className="modal-overlay" onClick={() => setSelectedCategory(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#D4AF37', textTransform: 'uppercase', fontWeight: '700' }}>Direct Guest Reservation</span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '1.25rem' }} className="gold-gradient-text">{selectedCategory.name}</h3>
              </div>
              <button onClick={() => setSelectedCategory(null)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {confirmedBooking ? (
              <div style={{ padding: '30px 24px', textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <CheckCircle2 size={32} color="#34D399" />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#F8FAFC', marginBottom: '8px' }}>
                  Reservation Confirmed!
                </h3>
                <p style={{ color: '#94A3B8', fontSize: '0.88rem', marginBottom: '20px' }}>
                  Your reservation code is <strong style={{ color: '#D4AF37' }}>{confirmedBooking.booking_code}</strong>. A confirmation voucher has been generated.
                </p>

                <div className="glass-card" style={{ padding: '16px', textAlign: 'left', marginBottom: '24px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#94A3B8' }}>Stay Dates:</span>
                    <strong>{checkIn} to {checkOut} ({nights} nights)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#94A3B8' }}>Room Allocated:</span>
                    <strong style={{ color: '#38BDF8' }}>#{confirmedBooking.reservation_rooms?.[0]?.room?.room_number || 'Confirmed'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '8px' }}>
                    <span style={{ color: '#D4AF37', fontWeight: '700' }}>Total Tariff Charged:</span>
                    <strong style={{ color: '#D4AF37', fontSize: '1.05rem' }}>${confirmedBooking.total_estimated?.toFixed(2)}</strong>
                  </div>
                </div>

                <button onClick={() => setSelectedCategory(null)} className="btn-gold" style={{ width: '100%', padding: '12px' }}>
                  Done / Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmGuestBooking} style={{ padding: '24px' }}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '6px' }}>Full Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Lady Genevieve Moore" 
                    className="input-dark"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '6px' }}>Email Address *</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="genevieve@voyage.com" 
                      className="input-dark"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '6px' }}>Phone Number *</label>
                    <input 
                      type="tel" 
                      required 
                      placeholder="+1 (555) 234-5678" 
                      className="input-dark"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                    />
                  </div>
                </div>

                {/* Pricing Breakdown */}
                <div style={{
                  background: 'rgba(212, 175, 55, 0.06)',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  borderRadius: '10px',
                  padding: '14px',
                  marginBottom: '20px',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#94A3B8' }}>
                    <span>{nights} Nights × ${selectedCategory.base_price}</span>
                    <span style={{ color: '#F8FAFC' }}>${(selectedCategory.base_price * nights).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#94A3B8' }}>
                    <span>Resort Occupancy Tax & Service (12%)</span>
                    <span style={{ color: '#F8FAFC' }}>${(selectedCategory.base_price * nights * 0.12).toFixed(2)}</span>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(212, 175, 55, 0.2)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: '800' }}>
                    <span style={{ color: '#D4AF37' }}>Total Estimated:</span>
                    <span style={{ color: '#D4AF37', fontSize: '1.15rem' }}>${(selectedCategory.base_price * nights * 1.12).toFixed(2)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" onClick={() => setSelectedCategory(null)} className="btn-ghost">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-gold">
                    {submitting ? 'Confirming...' : 'Instant Confirmation'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
