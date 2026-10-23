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
  CalendarCheck,
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
    <div style={{ minHeight: '100vh', background: '#F4F6FB' }}>
      {/* Hero Banner - Rich Indigo Overlay */}
      <div style={{
        position: 'relative',
        padding: '70px 40px 70px',
        textAlign: 'center',
        backgroundImage: 'linear-gradient(180deg, rgba(45, 58, 130, 0.88) 0%, rgba(30, 39, 94, 0.94) 100%), url("https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 30px rgba(45, 58, 130, 0.25)'
      }}>
        {/* Award Chip (Muted Amber) */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(226, 149, 120, 0.2)',
          border: '1px solid #E29578',
          padding: '6px 18px',
          borderRadius: '999px',
          color: '#FFFFFF',
          fontSize: '0.85rem',
          fontWeight: '700',
          marginBottom: '16px'
        }}>
          <Sparkles size={16} color="#E29578" />
          <span>Awarded World Luxury Resort & Spa 2026</span>
        </div>

        <h1 style={{ fontSize: '3rem', fontWeight: '800', margin: '0 0 14px 0', letterSpacing: '-0.02em', color: '#FFFFFF' }}>
          Experience Serenity at Grand Vista Resort
        </h1>
        <p style={{ color: '#E2E8F0', fontSize: '1.15rem', maxWidth: '680px', margin: '0 auto 36px', lineHeight: '1.6' }}>
          Private oceanfront villas, curated gourmet dining, and bespoke wellness sanctuaries designed for discerning travelers.
        </p>

        {/* Floating Reservation Search Bar - Pure Warm White Card */}
        <div className="glass-card" style={{
          maxWidth: '1020px',
          margin: '0 auto',
          padding: '22px 28px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '16px',
          alignItems: 'center',
          boxShadow: '0 20px 45px -10px rgba(45, 58, 130, 0.25)',
          background: '#FFFFFF',
          border: '1px solid #E5E9F2',
          borderRadius: '16px'
        }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#2D3A82', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.04em' }}>
              Check-In Date
            </label>
            <input 
              type="date" 
              className="input-dark"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#2D3A82', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.04em' }}>
              Check-Out Date
            </label>
            <input 
              type="date" 
              className="input-dark"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#2D3A82', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.04em' }}>
              Guests & Suites
            </label>
            <select 
              className="input-dark"
              value={adults}
              onChange={(e) => setAdults(e.target.value)}
            >
              <option value="1">1 Adult (Solo)</option>
              <option value="2">2 Adults (Couple)</option>
              <option value="3">3 Adults (Family)</option>
              <option value="4">4 Adults (Group)</option>
            </select>
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#2D3A82', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.04em' }}>
              Stay Duration
            </label>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1F2937', padding: '9px 0' }}>
              {nights} Night(s) Stay
            </div>
          </div>

          {/* Accent: Muted Amber "Check Availability" Action Button */}
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%' }}>
            <button 
              onClick={loadData}
              className="btn-amber"
              style={{ width: '100%', height: '42px', fontSize: '0.9rem', padding: '0 16px' }}
            >
              <CalendarCheck size={16} />
              <span>Check Availability</span>
            </button>
          </div>
        </div>
      </div>

      {/* Luxury Room Showcase - Content Containers (Pure Warm White) */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '50px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <span className="cta-chip" style={{ marginBottom: '12px' }}>
            Exclusive Accommodations
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', margin: '0 0 10px 0', color: '#1F2937' }}>
            Featured Suites & Private Villas
          </h2>
          <p style={{ color: '#4B5563', fontSize: '1rem', maxWidth: '640px', margin: '0 auto' }}>
            Complimentary vintage champagne on arrival, private plunge pools, and bespoke concierge hospitality.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '30px' }}>
          {categories.map((cat) => {
            const catRooms = availableRooms.filter(r => r.category_id === cat.id);
            const isAvailable = catRooms.length > 0;
            const totalEstimated = cat.base_price * nights;

            return (
              <div key={cat.id} className="glass-card glass-card-interactive" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
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
                    background: '#FFFFFF',
                    padding: '5px 12px',
                    borderRadius: '999px',
                    color: isAvailable ? '#059669' : '#DC2626',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                    border: `1px solid ${isAvailable ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                  }}>
                    {isAvailable ? `● ${catRooms.length} Villas Available` : 'Fully Booked for Dates'}
                  </div>

                  {/* Top-right Call-To-Action Chip (Muted Amber) */}
                  <div style={{ position: 'absolute', top: '14px', right: '14px' }}>
                    <span className="cta-chip" style={{ background: '#FFFFFF', borderColor: '#E29578', color: '#E29578', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                      Best Rate Guarantee
                    </span>
                  </div>
                </div>

                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#1F2937', marginBottom: '8px' }}>
                      {cat.name}
                    </h3>
                    <p style={{ fontSize: '0.86rem', color: '#4B5563', lineHeight: '1.5', marginBottom: '16px' }}>
                      {cat.description}
                    </p>

                    {/* Bed and capacity */}
                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.82rem', color: '#2D3A82', marginBottom: '16px', fontWeight: '600' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={15} color="#2D3A82" /> Max {cat.capacity_adults} Guests
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <BedDouble size={15} color="#2D3A82" /> {cat.bed_type}
                      </span>
                    </div>

                    {/* Amenities Chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '22px' }}>
                      {cat.amenities?.split(',').slice(0, 4).map((am, i) => (
                        <span key={i} style={{ background: '#F4F6FB', border: '1px solid #E5E9F2', padding: '4px 10px', borderRadius: '6px', fontSize: '0.74rem', color: '#4B5563', fontWeight: '500' }}>
                          ✓ {am.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pricing and Book Button */}
                  <div style={{ borderTop: '1px solid #E5E9F2', paddingTop: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#2D3A82' }}>
                        ${cat.base_price} <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: '500' }}>/ night</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                        ${totalEstimated} for {nights} nights
                      </div>
                    </div>

                    {/* CTA Button in Muted Amber */}
                    <button 
                      onClick={() => handleOpenBooking(cat)}
                      disabled={!isAvailable}
                      className="btn-amber" 
                      style={{ padding: '10px 18px', opacity: !isAvailable ? 0.5 : 1 }}
                    >
                      <span>Check Availability & Reserve</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Online Guest Booking Modal (Pure Warm White Card) */}
      {selectedCategory && (
        <div className="modal-overlay" onClick={() => setSelectedCategory(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '20px 24px', 
              background: 'linear-gradient(90deg, #2D3A82 0%, #1E275E 100%)',
              color: '#FFFFFF',
              borderTopLeftRadius: '18px',
              borderTopRightRadius: '18px'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#E29578', textTransform: 'uppercase', fontWeight: '800' }}>Direct Guest Reservation</span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '1.25rem', color: '#FFFFFF' }}>{selectedCategory.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedCategory(null)} 
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

            {confirmedBooking ? (
              <div style={{ padding: '32px 24px', textAlign: 'center', background: '#FFFFFF' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#ECFDF5', border: '2px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <CheckCircle2 size={32} color="#059669" />
                </div>
                <h3 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#1F2937', marginBottom: '8px' }}>
                  Reservation Confirmed!
                </h3>
                <p style={{ color: '#4B5563', fontSize: '0.9rem', marginBottom: '22px' }}>
                  Your confirmation reference code is <strong style={{ color: '#2D3A82' }}>{confirmedBooking.booking_code}</strong>.
                </p>

                <div className="glass-card" style={{ padding: '18px', textAlign: 'left', marginBottom: '24px', fontSize: '0.88rem', background: '#F8FAFD' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#6B7280' }}>Stay Dates:</span>
                    <strong style={{ color: '#1F2937' }}>{checkIn} to {checkOut} ({nights} nights)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#6B7280' }}>Room Allocated:</span>
                    <strong style={{ color: '#2D3A82' }}>#{confirmedBooking.reservation_rooms?.[0]?.room?.room_number || 'Confirmed'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E5E9F2', paddingTop: '10px' }}>
                    <span style={{ color: '#2D3A82', fontWeight: '700' }}>Total Tariff Charged:</span>
                    <strong style={{ color: '#E29578', fontSize: '1.15rem' }}>${confirmedBooking.total_estimated?.toFixed(2)}</strong>
                  </div>
                </div>

                <button onClick={() => setSelectedCategory(null)} className="btn-amber" style={{ width: '100%', padding: '12px' }}>
                  Done / Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmGuestBooking} style={{ padding: '24px', background: '#FFFFFF' }}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#4B5563', marginBottom: '6px', fontWeight: '600' }}>Full Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Lady Genevieve Moore" 
                    className="input-dark"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#4B5563', marginBottom: '6px', fontWeight: '600' }}>Email Address *</label>
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
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#4B5563', marginBottom: '6px', fontWeight: '600' }}>Phone Number *</label>
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
                  background: '#FDF3EE',
                  border: '1px solid rgba(226, 149, 120, 0.4)',
                  borderRadius: '10px',
                  padding: '16px',
                  marginBottom: '22px',
                  fontSize: '0.88rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', color: '#4B5563' }}>
                    <span>{nights} Nights × ${selectedCategory.base_price}</span>
                    <span style={{ color: '#1F2937', fontWeight: '600' }}>${(selectedCategory.base_price * nights).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#4B5563' }}>
                    <span>Resort Tax & Service Fee (12%)</span>
                    <span style={{ color: '#1F2937', fontWeight: '600' }}>${(selectedCategory.base_price * nights * 0.12).toFixed(2)}</span>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(226, 149, 120, 0.3)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#2D3A82', fontWeight: '700' }}>Total Estimated:</span>
                    <span style={{ color: '#E29578', fontSize: '1.25rem', fontWeight: '800' }}>${(selectedCategory.base_price * nights * 1.12).toFixed(2)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" onClick={() => setSelectedCategory(null)} className="btn-ghost">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-amber">
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
