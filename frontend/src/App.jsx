import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { NewBookingModal } from './components/NewBookingModal';
import { Dashboard } from './pages/Dashboard';
import { FrontDesk } from './pages/FrontDesk';
import { RoomsInventory } from './pages/RoomsInventory';
import { Bookings } from './pages/Bookings';
import { RestaurantPOS } from './pages/RestaurantPOS';
import { Housekeeping } from './pages/Housekeeping';
import { BillingFolio } from './pages/BillingFolio';
import { GuestPortal } from './pages/GuestPortal';
import { analyticsAPI } from './services/api';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [initialBookingRoomId, setInitialBookingRoomId] = useState(null);
  const [selectedFolioId, setSelectedFolioId] = useState(null);
  const [occupancyRate, setOccupancyRate] = useState(78.5);

  useEffect(() => {
    loadOccupancy();
  }, [activeTab]);

  const loadOccupancy = async () => {
    try {
      const res = await analyticsAPI.getKPIs();
      if (res.data?.occupancy_rate) {
        setOccupancyRate(res.data.occupancy_rate);
      }
    } catch (e) {}
  };

  const handleOpenNewBookingWithRoom = (roomId) => {
    setInitialBookingRoomId(roomId);
    setIsBookingModalOpen(true);
  };

  const handleBookingSuccess = () => {
    loadOccupancy();
    setActiveTab('reservations');
  };

  // If in Guest Portal mode, render clean full-width guest view with a back to PMS switch
  if (activeTab === 'guest_portal') {
    return (
      <div>
        {/* Floating Switcher to Return to PMS */}
        <div style={{
          position: 'fixed',
          top: '16px',
          right: '20px',
          zIndex: 100,
          background: 'rgba(11, 15, 25, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          borderRadius: '999px',
          padding: '6px 16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.6)'
        }}>
          <button 
            onClick={() => setActiveTab('dashboard')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#D4AF37',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>← Back to Staff PMS</span>
          </button>
        </div>
        <GuestPortal onBookingSuccess={handleBookingSuccess} />
      </div>
    );
  }

  return (
    <div className="layout-grid">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar 
          onOpenNewBooking={() => { setInitialBookingRoomId(null); setIsBookingModalOpen(true); }}
          occupancyRate={occupancyRate}
        />

        <main style={{ flex: 1 }}>
          {activeTab === 'dashboard' && (
            <Dashboard 
              setActiveTab={setActiveTab} 
              onOpenNewBooking={() => { setInitialBookingRoomId(null); setIsBookingModalOpen(true); }}
            />
          )}

          {activeTab === 'frontdesk' && (
            <FrontDesk 
              onOpenNewBookingWithRoom={handleOpenNewBookingWithRoom}
              setActiveTab={setActiveTab}
              setSelectedFolioId={setSelectedFolioId}
            />
          )}

          {activeTab === 'rooms' && (
            <RoomsInventory />
          )}

          {activeTab === 'reservations' && (
            <Bookings 
              onOpenNewBooking={() => { setInitialBookingRoomId(null); setIsBookingModalOpen(true); }}
              setActiveTab={setActiveTab}
              setSelectedFolioId={setSelectedFolioId}
            />
          )}

          {activeTab === 'pos' && (
            <RestaurantPOS setActiveTab={setActiveTab} />
          )}

          {activeTab === 'housekeeping' && (
            <Housekeeping />
          )}

          {activeTab === 'billing' && (
            <BillingFolio selectedFolioId={selectedFolioId} />
          )}
        </main>
      </div>

      {/* Global Booking Modal */}
      <NewBookingModal
        isOpen={isBookingModalOpen}
        initialRoomId={initialBookingRoomId}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
