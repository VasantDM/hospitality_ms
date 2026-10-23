import React, { useState, useEffect, useRef } from 'react';
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
  X, 
  Search, 
  QrCode, 
  FileText, 
  DollarSign,
  Star,
  Compass,
  Utensils,
  Wine,
  Waves,
  Ship,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  Heart,
  Coffee,
  Wifi,
  Tv,
  Eye,
  SlidersHorizontal,
  ArrowUpRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { roomsAPI, reservationsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

export const GuestPortal = ({ onBookingSuccess }) => {
  const [categories, setCategories] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  
  // Date and guest selector
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
  const [specialConcierge, setSpecialConcierge] = useState('Honeymoon setup, airport champagne pick-up');
  const [paymentOption, setPaymentOption] = useState('upi'); // 'upi' | 'card' | 'at_desk'
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Quick Detail Preview Modal
  const [previewCategory, setPreviewCategory] = useState(null);

  // Lookup state
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);

  // Newsletter Email
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const suitesRef = useRef(null);
  const experiencesRef = useRef(null);
  const lookupRef = useRef(null);
  const toast = useToast();

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
      console.error('Failed to load guest portal data', err);
    }
  };

  const nights = Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)));

  const scrollToSection = (ref) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
        toast.error('Sorry, all units in this category are fully booked for the selected dates.');
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
        special_requests: `Special Requests: ${specialConcierge} • Guaranteed via ${paymentOption.toUpperCase()}`
      };

      const res = await reservationsAPI.createReservation(payload);
      setConfirmedBooking(res.data);
      toast.success(`Booking Confirmed! Reference: ${res.data.booking_code}`);
      
      try {
        confetti({
          particleCount: 140,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Booking failed. Please try different dates.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLookupBooking = async (e) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;
    setLookupLoading(true);
    try {
      const res = await reservationsAPI.getReservations({ search: lookupQuery.trim() });
      if (res.data && res.data.length > 0) {
        setLookupResult(res.data[0]);
        toast.success(`Found reservation for ${res.data[0].guest?.first_name} ${res.data[0].guest?.last_name}`);
      } else {
        setLookupResult(null);
        toast.error('No reservation found matching this booking code or email.');
      }
    } catch (err) {
      toast.error('Failed to lookup reservation.');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    toast.success('Thank you! You are now subscribed to Grand Vista Private Offers.');
    setNewsletterEmail('');
  };

  const filteredCategories = categories.filter(cat => {
    if (activeCategoryFilter === 'all') return true;
    if (activeCategoryFilter === 'villas') return cat.name.toLowerCase().includes('villa');
    if (activeCategoryFilter === 'suites') return cat.name.toLowerCase().includes('suite');
    if (activeCategoryFilter === 'penthouse') return cat.name.toLowerCase().includes('penthouse');
    return true;
  });

  const faqs = [
    {
      q: 'What time is Check-In and Check-Out?',
      a: 'Standard Check-In begins at 3:00 PM and Check-Out is at 12:00 PM (Noon). Complimentary early check-in or late checkout is subject to availability upon request.'
    },
    {
      q: 'Are private airport transfers included?',
      a: 'Guests residing in our Luxury Private Pool Villas and Presidential Penthouse receive complimentary private limousine or catamaran airport transfers.'
    },
    {
      q: 'What is the deposit and cancellation policy?',
      a: 'Reservations can be canceled free of charge up to 72 hours prior to arrival. A 20% advance guarantee secures your suite.'
    },
    {
      q: 'Can dining bills and spa treatments be charged to my suite?',
      a: 'Yes, seamlessly. All dining in our restaurants, sunset bars, and wellness spa sessions can be routed directly to your Master Room Folio.'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#EDF6F9', color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      
      {/* 1. LUXURY WEBSITE HEADER & NAVBAR */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #E2EFF3',
        padding: '0 40px',
        height: '76px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 20px rgba(8, 145, 178, 0.05)'
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0891B2 0%, #0E7490 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: '800',
            fontSize: '1.2rem',
            boxShadow: '0 4px 14px rgba(8, 145, 178, 0.35)'
          }}>
            GV
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', letterSpacing: '0.04em', color: '#0F172A', lineHeight: 1 }}>
              GRAND VISTA
            </div>
            <div style={{ fontSize: '0.7rem', color: '#0891B2', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '3px' }}>
              RESORT & WELLNESS SANCTUARY
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <button 
            onClick={() => scrollToSection(suitesRef)}
            style={{ background: 'none', border: 'none', color: '#475569', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.target.style.color = '#0891B2'}
            onMouseLeave={(e) => e.target.style.color = '#475569'}
          >
            Suites & Villas
          </button>
          <button 
            onClick={() => scrollToSection(experiencesRef)}
            style={{ background: 'none', border: 'none', color: '#475569', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.target.style.color = '#0891B2'}
            onMouseLeave={(e) => e.target.style.color = '#475569'}
          >
            Experiences & Dining
          </button>
          <button 
            onClick={() => scrollToSection(lookupRef)}
            style={{ background: 'none', border: 'none', color: '#475569', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.target.style.color = '#0891B2'}
            onMouseLeave={(e) => e.target.style.color = '#475569'}
          >
            Find My Reservation
          </button>
        </nav>

        {/* Right CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <a 
            href="tel:+18005559821" 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0891B2', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '700' }}
          >
            <Phone size={15} />
            <span>+1 (800) 555-VISTA</span>
          </a>
          <button 
            onClick={() => scrollToSection(suitesRef)}
            className="btn-teal"
            style={{ padding: '10px 22px', fontSize: '0.88rem' }}
          >
            <CalendarCheck size={16} />
            <span>Book Your Stay</span>
          </button>
        </div>
      </header>

      {/* 2. HERO SECTION WITH CINEMATIC BACKDROP */}
      <section style={{
        position: 'relative',
        minHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '80px 24px 140px',
        backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.45) 0%, rgba(14, 116, 144, 0.85) 100%), url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=2000&q=85')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        boxShadow: 'inset 0 -10px 30px rgba(0,0,0,0.1)'
      }}>
        {/* Accolade Chip */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          borderRadius: '999px',
          padding: '6px 20px',
          color: '#FFFFFF',
          fontSize: '0.84rem',
          fontWeight: '700',
          marginBottom: '20px'
        }}>
          <Sparkles size={16} color="#FDE047" />
          <span>Voted World's #1 Coastal Luxury Resort 2026</span>
        </div>

        <h1 style={{
          fontSize: '3.6rem',
          fontWeight: '800',
          color: '#FFFFFF',
          maxWidth: '900px',
          margin: '0 0 16px',
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          textShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}>
          Where Azure Horizons Meet Bespoke Luxury
        </h1>

        <p style={{
          fontSize: '1.2rem',
          color: '#E0F2FE',
          maxWidth: '680px',
          margin: '0 auto 40px',
          lineHeight: 1.6,
          fontWeight: '400',
          textShadow: '0 2px 10px rgba(0,0,0,0.3)'
        }}>
          Immerse yourself in private infinity pool villas, Michelin-inspired oceanfront dining, and personalized concierge wellness.
        </p>

        {/* Quick Highlights Bar */}
        <div style={{ display: 'flex', gap: '28px', color: '#FFFFFF', fontSize: '0.9rem', fontWeight: '600', marginBottom: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} color="#22D3EE" /> Private Lagoon Beach
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} color="#22D3EE" /> 24/7 Dedicated Butler Service
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} color="#22D3EE" /> Zero Cancellation Fees (72h)
          </span>
        </div>

        {/* FLOATING BOOKING ENGINE BAR */}
        <div className="white-card" style={{
          width: '100%',
          maxWidth: '1080px',
          padding: '22px 28px',
          display: 'grid',
          gridTemplateColumns: '1.2fr 1.2fr 1.1fr 1fr 1.2fr',
          gap: '16px',
          alignItems: 'center',
          boxShadow: '0 24px 50px -12px rgba(8, 145, 178, 0.35)',
          borderRadius: '24px',
          position: 'absolute',
          bottom: '-50px',
          zIndex: 20
        }}>
          {/* Check-In */}
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#0891B2', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px' }}>
              <Calendar size={13} /> Check-In Date
            </label>
            <input 
              type="date" 
              className="input-clean"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              style={{ fontWeight: '600' }}
            />
          </div>

          {/* Check-Out */}
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#0891B2', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px' }}>
              <Calendar size={13} /> Check-Out Date
            </label>
            <input 
              type="date" 
              className="input-clean"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              style={{ fontWeight: '600' }}
            />
          </div>

          {/* Guests */}
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#0891B2', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px' }}>
              <Users size={13} /> Guests & Suites
            </label>
            <select 
              className="input-clean"
              value={adults}
              onChange={(e) => setAdults(e.target.value)}
              style={{ fontWeight: '600' }}
            >
              <option value="1">1 Adult (Solo Retreat)</option>
              <option value="2">2 Adults (Couples)</option>
              <option value="3">3 Adults (Family)</option>
              <option value="4">4 Adults (Villa Suite)</option>
            </select>
          </div>

          {/* Stay Calculation */}
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px' }}>
              Stay Duration
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A' }}>
              {nights} Night{nights > 1 ? 's' : ''}
            </div>
          </div>

          {/* Check Availability Button */}
          <div>
            <button 
              onClick={() => {
                loadData();
                scrollToSection(suitesRef);
              }}
              className="btn-teal"
              style={{ width: '100%', height: '44px', fontSize: '0.92rem', gap: '8px' }}
            >
              <Search size={16} />
              <span>Explore Rates</span>
            </button>
          </div>
        </div>
      </section>

      {/* SPACING UNDER HERO */}
      <div style={{ height: '70px' }} />

      {/* 3. TRUST & AMENITY METRICS BANNER */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 24px' }}>
        <div className="white-card" style={{
          padding: '24px 36px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '24px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#0891B2' }}>500+</div>
            <div style={{ fontSize: '0.84rem', color: '#64748B', fontWeight: '600' }}>Acres of Tropical Lagoon</div>
          </div>
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#0891B2' }}>100%</div>
            <div style={{ fontSize: '0.84rem', color: '#64748B', fontWeight: '600' }}>Oceanfront View Suites</div>
          </div>
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#0891B2' }}>4</div>
            <div style={{ fontSize: '0.84rem', color: '#64748B', fontWeight: '600' }}>Michelin-Inspired Chefs</div>
          </div>
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#0891B2' }}>4.98 ★</div>
            <div style={{ fontSize: '0.84rem', color: '#64748B', fontWeight: '600' }}>Verified Guest Rating</div>
          </div>
        </div>
      </section>

      {/* 4. SUITES & VILLAS SHOWCASE (MAIN BOOKING GRID) */}
      <section ref={suitesRef} style={{ maxWidth: '1240px', margin: '0 auto', padding: '60px 24px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span className="badge-teal" style={{ marginBottom: '10px', display: 'inline-block' }}>
            Accommodations Showcase
          </span>
          <h2 style={{ fontSize: '2.4rem', fontWeight: '800', margin: '0 0 10px', color: '#0F172A', letterSpacing: '-0.02em' }}>
            Choose Your Private Sanctuary
          </h2>
          <p style={{ color: '#64748B', fontSize: '1rem', maxWidth: '640px', margin: '0 auto 26px', lineHeight: 1.5 }}>
            Every suite includes private ocean balconies, 24-hour butler assistance, and custom spa toiletries.
          </p>

          {/* Filter Chips */}
          <div style={{ display: 'inline-flex', gap: '8px', background: '#FFFFFF', padding: '6px', borderRadius: '999px', border: '1px solid #E2EFF3', boxShadow: '0 2px 10px rgba(8,145,178,0.06)' }}>
            {[
              { id: 'all', label: 'All Accommodations' },
              { id: 'villas', label: 'Private Pool Villas' },
              { id: 'suites', label: 'Oceanfront Suites' },
              { id: 'penthouse', label: 'Presidential Penthouse' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setActiveCategoryFilter(f.id)}
                style={{
                  padding: '8px 20px',
                  borderRadius: '999px',
                  border: 'none',
                  background: activeCategoryFilter === f.id ? '#0891B2' : 'transparent',
                  color: activeCategoryFilter === f.id ? '#FFFFFF' : '#475569',
                  fontWeight: '700',
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* SUITES GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(370px, 1fr))', gap: '30px' }}>
          {filteredCategories.map((cat) => {
            const catRooms = availableRooms.filter(r => r.category_id === cat.id);
            const isAvailable = catRooms.length > 0;
            const totalEstimated = cat.base_price * nights;

            return (
              <div 
                key={cat.id} 
                className="white-card"
                style={{
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(8, 145, 178, 0.16)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 20px -2px rgba(8, 145, 178, 0.06)';
                }}
              >
                {/* Photo with Overlay Badge */}
                <div style={{ position: 'relative', height: '260px', overflow: 'hidden' }}>
                  <img 
                    src={cat.image_url || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'} 
                    alt={cat.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  />

                  {/* Availability Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: isAvailable ? '#10B981' : '#EF4444',
                    color: '#FFFFFF',
                    padding: '5px 14px',
                    borderRadius: '999px',
                    fontSize: '0.74rem',
                    fontWeight: '800',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
                  }}>
                    {isAvailable ? `● ${catRooms.length} Available` : 'Fully Booked'}
                  </div>

                  {/* Bed & Guest Pill */}
                  <div style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '16px',
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(10px)',
                    color: '#FFFFFF',
                    padding: '5px 14px',
                    borderRadius: '999px',
                    fontSize: '0.74rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <span>{cat.bed_type}</span>
                    <span>•</span>
                    <span>Max {cat.capacity_adults} Guests</span>
                  </div>
                </div>

                {/* Content Area */}
                <div style={{ padding: '26px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                      {cat.name}
                    </h3>
                  </div>

                  <p style={{ fontSize: '0.86rem', color: '#64748B', lineHeight: 1.5, margin: '0 0 18px', minHeight: '42px' }}>
                    {cat.description}
                  </p>

                  {/* Amenities Chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '22px' }}>
                    {cat.amenities?.split(',').slice(0, 4).map((amenity, i) => (
                      <span key={i} style={{
                        background: '#F8FDFF',
                        border: '1px solid #E2EFF3',
                        color: '#475569',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        fontWeight: '600'
                      }}>
                        ✓ {amenity.trim()}
                      </span>
                    ))}
                  </div>

                  {/* Price & Action Area */}
                  <div style={{ marginTop: 'auto', paddingTop: '18px', borderTop: '1px solid #E2EFF3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0891B2', lineHeight: 1.1 }}>
                        ${cat.base_price}
                        <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '500' }}> / night</span>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#94A3B8', marginTop: '3px' }}>
                        ${totalEstimated} total for {nights} night(s)
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setPreviewCategory(cat)}
                        className="btn-ghost"
                        style={{ padding: '8px 12px', fontSize: '0.82rem' }}
                        title="View Full Amenities"
                      >
                        <Eye size={15} />
                      </button>

                      <button
                        disabled={!isAvailable}
                        onClick={() => handleOpenBooking(cat)}
                        className={isAvailable ? "btn-teal" : "btn-ghost"}
                        style={{ padding: '9px 20px', fontSize: '0.86rem' }}
                      >
                        {isAvailable ? 'Reserve Suite' : 'Sold Out'}
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. RESORT EXPERIENCES & BENTO GRID */}
      <section ref={experiencesRef} style={{ background: '#FFFFFF', borderTop: '1px solid #E2EFF3', borderBottom: '1px solid #E2EFF3', padding: '80px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span className="badge-teal" style={{ marginBottom: '10px', display: 'inline-block' }}>
              World-Class Offerings
            </span>
            <h2 style={{ fontSize: '2.3rem', fontWeight: '800', margin: '0 0 10px', color: '#0F172A' }}>
              Curated Island Experiences
            </h2>
            <p style={{ color: '#64748B', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
              Every moment at Grand Vista is tailored to awaken your senses and elevate your stay.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '26px' }}>
            
            {/* Bento Card 1: Gourmet Dining */}
            <div className="white-card" style={{ padding: '30px', background: '#F8FDFF', position: 'relative', overflow: 'hidden' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#E2F4F7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Utensils size={22} color="#0891B2" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
                Michelin-Inspired Gastronomy
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.6, marginBottom: '18px' }}>
                Four bespoke dining concepts ranging from beachfront wood-fired seafood to omakase rooftop sushi paired with rare vintage wines.
              </p>
              <span style={{ fontSize: '0.82rem', color: '#0891B2', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Explore Menus <ArrowUpRight size={14} />
              </span>
            </div>

            {/* Bento Card 2: Thalasso Spa */}
            <div className="white-card" style={{ padding: '30px', background: '#F8FDFF', position: 'relative', overflow: 'hidden' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#E2F4F7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Sparkles size={22} color="#0891B2" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
                Overwater Thalasso Sanctuary
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.6, marginBottom: '18px' }}>
                Holistic marine therapies, custom Himalayan salt saunas, and open-air hydrotherapy plunge pools suspended over the reef.
              </p>
              <span style={{ fontSize: '0.82rem', color: '#0891B2', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Spa Brochure <ArrowUpRight size={14} />
              </span>
            </div>

            {/* Bento Card 3: Marine Yachting */}
            <div className="white-card" style={{ padding: '30px', background: '#F8FDFF', position: 'relative', overflow: 'hidden' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#E2F4F7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Ship size={22} color="#0891B2" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
                Private Catamaran Charters
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.6, marginBottom: '18px' }}>
                Guided scuba diving among untouched coral gardens, sunset dolphin excursions, and secluded sandbank picnics.
              </p>
              <span style={{ fontSize: '0.82rem', color: '#0891B2', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Charter Concierge <ArrowUpRight size={14} />
              </span>
            </div>

          </div>

        </div>
      </section>

      {/* 6. GUEST SOCIAL PROOF & REVIEWS */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '46px' }}>
          <span className="badge-teal" style={{ marginBottom: '10px', display: 'inline-block' }}>
            Verified Testimonials
          </span>
          <h2 style={{ fontSize: '2.3rem', fontWeight: '800', margin: '0 0 10px', color: '#0F172A' }}>
            Loved by Discerning Travelers
          </h2>
          <p style={{ color: '#64748B', fontSize: '1rem', margin: 0 }}>
            Read authentic reviews from guests who experienced Grand Vista luxury.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '26px' }}>
          
          <div className="white-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#F59E0B" color="#F59E0B" />)}
            </div>
            <p style={{ fontSize: '0.9rem', color: '#334155', fontStyle: 'italic', lineHeight: 1.6, marginBottom: '20px' }}>
              "The Luxury Private Pool Villa was absolute paradise. Waking up to private plunge pool swims and having our personal butler arrange champagne breakfasts was unforgettable."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" 
                alt="Guest" 
                style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#0F172A', display: 'block' }}>Eleanor Vance</strong>
                <span style={{ fontSize: '0.76rem', color: '#64748B' }}>London, UK • 7 Nights in Pool Villa</span>
              </div>
            </div>
          </div>

          <div className="white-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#F59E0B" color="#F59E0B" />)}
            </div>
            <p style={{ fontSize: '0.9rem', color: '#334155', fontStyle: 'italic', lineHeight: 1.6, marginBottom: '20px' }}>
              "The digital booking flow was seamless, and the check-in was instantaneous. Charging dining to our room folio made the entire vacation feel effortless."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" 
                alt="Guest" 
                style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#0F172A', display: 'block' }}>David & Claire Ross</strong>
                <span style={{ fontSize: '0.76rem', color: '#64748B' }}>Sydney, Australia • Couples Anniversary</span>
              </div>
            </div>
          </div>

          <div className="white-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#F59E0B" color="#F59E0B" />)}
            </div>
            <p style={{ fontSize: '0.9rem', color: '#334155', fontStyle: 'italic', lineHeight: 1.6, marginBottom: '20px' }}>
              "The Presidential Penthouse is truly in a league of its own. 360-degree views, dedicated private chef, and the utmost discretion. We will be back every season."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img 
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80" 
                alt="Guest" 
                style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#0F172A', display: 'block' }}>Marcus Sterling</strong>
                <span style={{ fontSize: '0.76rem', color: '#64748B' }}>New York, USA • Executive Family Stay</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 7. FIND MY RESERVATION SELF-SERVICE HUB */}
      <section ref={lookupRef} style={{ background: '#FFFFFF', borderTop: '1px solid #E2EFF3', padding: '80px 24px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span className="badge-teal" style={{ marginBottom: '10px', display: 'inline-block' }}>
              Self-Service Guest Portal
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: '800', margin: '0 0 10px', color: '#0F172A' }}>
              Already Have a Reservation?
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.95rem', margin: 0 }}>
              Look up your stay details, check-in countdown, and real-time hotel folio charges.
            </p>
          </div>

          <div className="white-card" style={{ padding: '34px' }}>
            <form onSubmit={handleLookupBooking} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <input 
                type="text" 
                className="input-clean"
                placeholder="Enter Booking Code (e.g. GV-XXXXXX) or Guest Email..."
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                style={{ flex: 1, height: '44px' }}
              />
              <button type="submit" className="btn-teal" disabled={lookupLoading} style={{ height: '44px', padding: '0 24px' }}>
                {lookupLoading ? 'Searching...' : 'Find Reservation'}
              </button>
            </form>

            {lookupResult && (
              <div style={{ background: '#F8FDFF', border: '1px solid #E2EFF3', borderRadius: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #E2EFF3', paddingBottom: '14px' }}>
                  <div>
                    <span className="badge-teal" style={{ marginBottom: '6px', display: 'inline-block' }}>
                      Reference: {lookupResult.booking_code}
                    </span>
                    <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#0F172A' }}>
                      {lookupResult.guest?.first_name} {lookupResult.guest?.last_name}
                    </h4>
                  </div>
                  <span style={{
                    background: lookupResult.status === 'checked_in' ? '#ECFDF5' : '#E0F2FE',
                    color: lookupResult.status === 'checked_in' ? '#059669' : '#0369A1',
                    padding: '5px 14px',
                    borderRadius: '999px',
                    fontSize: '0.78rem',
                    fontWeight: '800'
                  }}>
                    {lookupResult.status?.toUpperCase()}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.88rem', marginBottom: '16px' }}>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.74rem' }}>Stay Period:</span>
                    <strong>{lookupResult.check_in_date} to {lookupResult.check_out_date}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.74rem' }}>Party Size:</span>
                    <strong>{lookupResult.adults} Adults, {lookupResult.children} Children</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.74rem' }}>Estimated Total:</span>
                    <strong style={{ color: '#0891B2' }}>${lookupResult.total_estimated?.toFixed(2)} USD</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.74rem' }}>Source:</span>
                    <strong style={{ textTransform: 'capitalize' }}>{lookupResult.source?.replace('_', ' ')}</strong>
                  </div>
                </div>

                <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid #E2EFF3', fontSize: '0.82rem', color: '#475569' }}>
                  <strong>Concierge Instructions:</strong> {lookupResult.special_requests || 'Standard luxury turnover requested.'}
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 8. FREQUENTLY ASKED QUESTIONS ACCORDION */}
      <section style={{ maxWidth: '880px', margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="badge-teal" style={{ marginBottom: '10px', display: 'inline-block' }}>
            Guest Information
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', margin: '0 0 10px', color: '#0F172A' }}>
            Frequently Asked Questions
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx} 
                className="white-card" 
                style={{ overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => setOpenFaq(isOpen ? null : idx)}
              >
                <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                    {faq.q}
                  </h4>
                  {isOpen ? <ChevronUp size={18} color="#0891B2" /> : <ChevronDown size={18} color="#64748B" />}
                </div>
                {isOpen && (
                  <div style={{ padding: '0 24px 20px', color: '#64748B', fontSize: '0.9rem', lineHeight: 1.6, borderTop: '1px solid #F1F8FA', paddingTop: '14px' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. LUXURY FOOTER & NEWSLETTER */}
      <footer style={{ background: '#0F172A', color: '#FFFFFF', padding: '70px 40px 30px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1.3fr', gap: '40px', marginBottom: '50px' }}>
            
            {/* Column 1: Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#0891B2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                  GV
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '0.04em' }}>
                  GRAND VISTA
                </span>
              </div>
              <p style={{ color: '#94A3B8', fontSize: '0.86rem', lineHeight: 1.6, marginBottom: '16px' }}>
                A luxury hospitality sanctuary overlooking azure lagoons. Private villas, Michelin-curated gastronomy, and wellness retreats.
              </p>
              <div style={{ fontSize: '0.82rem', color: '#0891B2', fontWeight: '700' }}>
                Paradise Coast, Ocean Crest Blvd
              </div>
            </div>

            {/* Column 2: Navigation */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '16px' }}>Explore</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem', color: '#94A3B8' }}>
                <li style={{ cursor: 'pointer' }} onClick={() => scrollToSection(suitesRef)}>Private Pool Villas</li>
                <li style={{ cursor: 'pointer' }} onClick={() => scrollToSection(suitesRef)}>Ocean Suites</li>
                <li style={{ cursor: 'pointer' }} onClick={() => scrollToSection(experiencesRef)}>Beachfront Dining</li>
                <li style={{ cursor: 'pointer' }} onClick={() => scrollToSection(experiencesRef)}>Thalasso Spa</li>
                <li style={{ cursor: 'pointer' }} onClick={() => scrollToSection(lookupRef)}>Find My Booking</li>
              </ul>
            </div>

            {/* Column 3: Contact */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '16px' }}>Concierge</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem', color: '#94A3B8' }}>
                <li>Direct: +1 (800) 555-VISTA</li>
                <li>WhatsApp: +1 (555) 019-2834</li>
                <li>Email: concierge@grandvista.com</li>
                <li>Airport: Limousine & Yacht Desk</li>
              </ul>
            </div>

            {/* Column 4: Newsletter */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '16px' }}>Private Invitations</h4>
              <p style={{ color: '#94A3B8', fontSize: '0.84rem', lineHeight: 1.5, marginBottom: '14px' }}>
                Subscribe for private villa rates, seasonal wine pairing dinners, and members-only wellness retreats.
              </p>
              <form onSubmit={handleNewsletter} style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="email" 
                  required
                  placeholder="Enter email address..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  style={{
                    flex: 1,
                    height: '40px',
                    borderRadius: '999px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.08)',
                    color: '#FFFFFF',
                    padding: '0 16px',
                    fontSize: '0.82rem',
                    outline: 'none'
                  }}
                />
                <button type="submit" className="btn-teal" style={{ height: '40px', padding: '0 18px', fontSize: '0.82rem' }}>
                  Join
                </button>
              </form>
            </div>

          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#64748B' }}>
            <span>© 2026 Grand Vista Resort & Hotel PMS. All rights reserved.</span>
            <div style={{ display: 'flex', gap: '20px' }}>
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Hotel License #GV-2026-INT</span>
            </div>
          </div>

        </div>
      </footer>

      {/* MODAL 1: SUITE AMENITIES PREVIEW */}
      {previewCategory && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="white-card" style={{ width: '100%', maxWidth: '620px', padding: '30px', position: 'relative' }}>
            <button 
              onClick={() => setPreviewCategory(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
            >
              <X size={20} />
            </button>

            <img 
              src={previewCategory.image_url} 
              alt={previewCategory.name} 
              style={{ width: '100%', height: '240px', objectFit: 'cover', borderRadius: '14px', marginBottom: '20px' }}
            />

            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
              {previewCategory.name}
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5, marginBottom: '20px' }}>
              {previewCategory.description}
            </p>

            <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0891B2', marginBottom: '10px', textTransform: 'uppercase' }}>
              Suite Features & Included Privileges:
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
              {previewCategory.amenities?.split(',').map((am, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: '#334155' }}>
                  <CheckCircle2 size={16} color="#10B981" />
                  <span>{am.trim()}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2EFF3', paddingTop: '16px' }}>
              <div>
                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0891B2' }}>${previewCategory.base_price}</span>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}> / night</span>
              </div>
              <button 
                onClick={() => {
                  setPreviewCategory(null);
                  handleOpenBooking(previewCategory);
                }}
                className="btn-teal"
              >
                Proceed to Reserve Suite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: INTERACTIVE RESERVATION & DEPOSIT PAYMENT */}
      {selectedCategory && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="white-card" style={{ width: '100%', maxWidth: '600px', padding: '34px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button 
              onClick={() => { setSelectedCategory(null); setConfirmedBooking(null); }}
              style={{ position: 'absolute', top: '22px', right: '22px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
            >
              <X size={20} />
            </button>

            {!confirmedBooking ? (
              <form onSubmit={handleConfirmGuestBooking}>
                <span className="badge-teal" style={{ marginBottom: '8px', display: 'inline-block' }}>
                  Direct Guest Reservation
                </span>
                <h3 style={{ fontSize: '1.45rem', fontWeight: '800', margin: '0 0 4px', color: '#0F172A' }}>
                  Reserve {selectedCategory.name}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 22px' }}>
                  {nights} Night(s) Stay • Estimated Total: <strong style={{ color: '#0891B2' }}>${(selectedCategory.base_price * nights * 1.12).toFixed(2)}</strong> (incl. 12% Resort Tax)
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '22px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                      Primary Guest Full Name *
                    </label>
                    <input 
                      type="text" 
                      required
                      className="input-clean"
                      placeholder="e.g. Lord Alexander Wright"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                        Email Address *
                      </label>
                      <input 
                        type="email" 
                        required
                        className="input-clean"
                        placeholder="guest@luxury.com"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                        Phone Number *
                      </label>
                      <input 
                        type="tel" 
                        required
                        className="input-clean"
                        placeholder="+1 (555) 928-1920"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                      Concierge & Special Requests
                    </label>
                    <input 
                      type="text" 
                      className="input-clean"
                      value={specialConcierge}
                      onChange={(e) => setSpecialConcierge(e.target.value)}
                      placeholder="e.g. Honeymoon setup, dietary restrictions, airport limousine"
                    />
                  </div>

                  {/* Payment Guarantee Options */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
                      Deposit / Reservation Guarantee Method
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => setPaymentOption('upi')}
                        style={{
                          padding: '10px',
                          borderRadius: '12px',
                          border: paymentOption === 'upi' ? '2px solid #0891B2' : '1px solid #E2EFF3',
                          background: paymentOption === 'upi' ? '#E2F4F7' : '#FFFFFF',
                          color: paymentOption === 'upi' ? '#0891B2' : '#475569',
                          fontWeight: '700',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <QrCode size={15} />
                        Instant UPI QR
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentOption('card')}
                        style={{
                          padding: '10px',
                          borderRadius: '12px',
                          border: paymentOption === 'card' ? '2px solid #0891B2' : '1px solid #E2EFF3',
                          background: paymentOption === 'card' ? '#E2F4F7' : '#FFFFFF',
                          color: paymentOption === 'card' ? '#0891B2' : '#475569',
                          fontWeight: '700',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <CreditCard size={15} />
                        Credit Card
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentOption('at_desk')}
                        style={{
                          padding: '10px',
                          borderRadius: '12px',
                          border: paymentOption === 'at_desk' ? '2px solid #0891B2' : '1px solid #E2EFF3',
                          background: paymentOption === 'at_desk' ? '#E2F4F7' : '#FFFFFF',
                          color: paymentOption === 'at_desk' ? '#0891B2' : '#475569',
                          fontWeight: '700',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        Pay at Check-In
                      </button>
                    </div>
                  </div>

                  {paymentOption === 'upi' && (
                    <div style={{ textAlign: 'center', padding: '16px', background: '#F8FDFF', borderRadius: '14px', border: '1px solid #E2EFF3' }}>
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=upi://pay?pa=grandvista@upi%26am=${(selectedCategory.base_price * nights * 0.2).toFixed(2)}%26cu=USD`}
                        alt="UPI QR Code" 
                        style={{ width: '130px', height: '130px', margin: '0 auto 8px', borderRadius: '8px' }}
                      />
                      <p style={{ fontSize: '0.76rem', color: '#64748B', margin: 0 }}>
                        Scan to guarantee your reservation with a 20% advance deposit: <strong>${(selectedCategory.base_price * nights * 0.2).toFixed(2)}</strong>
                      </p>
                    </div>
                  )}

                  {paymentOption === 'card' && (
                    <div style={{ padding: '14px', background: '#F8FDFF', borderRadius: '12px', border: '1px solid #E2EFF3', fontSize: '0.8rem' }}>
                      <span style={{ color: '#64748B', display: 'block', marginBottom: '4px' }}>Simulated Stripe Test Mode:</span>
                      <code>Card: 4242 •••• •••• 4242 | Exp: 12/28 | CVC: 123</code>
                    </div>
                  )}

                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" onClick={() => setSelectedCategory(null)} className="btn-ghost">
                    Cancel
                  </button>
                  <button type="submit" className="btn-teal" disabled={submitting}>
                    {submitting ? 'Confirming Stay...' : 'Confirm & Reserve Suite'}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 10px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0F172A', margin: '0 0 6px 0' }}>
                  Congratulations! Your Stay is Confirmed
                </h3>
                <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0 0 24px 0' }}>
                  An official reservation and Master Folio have been created in the Grand Vista Hotel System.
                </p>

                <div style={{ background: '#F8FDFF', border: '1px solid #E2EFF3', borderRadius: '16px', padding: '20px', textAlign: 'left', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#64748B', fontSize: '0.84rem' }}>Booking Code:</span>
                    <strong style={{ color: '#0891B2', fontSize: '1.1rem' }}>{confirmedBooking.booking_code}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#64748B', fontSize: '0.84rem' }}>Reserved Suite:</span>
                    <strong style={{ color: '#0F172A' }}>{selectedCategory.name}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#64748B', fontSize: '0.84rem' }}>Stay Dates:</span>
                    <strong>{checkIn} to {checkOut} ({nights} nights)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #E2EFF3' }}>
                    <span style={{ color: '#64748B', fontSize: '0.84rem' }}>Total Folio Charges:</span>
                    <strong style={{ color: '#0891B2', fontSize: '1.05rem' }}>${confirmedBooking.total_estimated?.toFixed(2)} USD</strong>
                  </div>
                </div>

                <button 
                  onClick={() => { setSelectedCategory(null); setConfirmedBooking(null); onBookingSuccess && onBookingSuccess(); }}
                  className="btn-teal"
                  style={{ width: '100%', padding: '12px' }}
                >
                  Return to Resort Showcase
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
