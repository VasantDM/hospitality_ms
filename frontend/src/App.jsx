import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
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
import { ArrowLeft } from 'lucide-react';

function AppContent() {
  const getInitialTab = () => {
    const hash = window.location.hash.replace('#', '').trim();
    if (hash === 'portal' || hash === 'book' || hash === 'guest_portal') return 'guest_portal';
    if (['dashboard', 'frontdesk', 'rooms', 'reservations', 'pos', 'housekeeping', 'billing'].includes(hash)) {
      return hash;
    }
    return 'dashboard';
  };

  const [activeTab, setActiveTabState] = useState(getInitialTab);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [initialBookingRoomId, setInitialBookingRoomId] = useState(null);
  const [selectedFolioId, setSelectedFolioId] = useState(null);
  const [occupancyRate, setOccupancyRate] = useState(40.0);

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    window.location.hash = tab;
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash === 'portal' || hash === 'book') {
        setActiveTabState('guest_portal');
      } else if (hash && hash !== activeTab) {
        setActiveTabState(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeTab]);

  useEffect(() => {
    loadOccupancy();
  }, [activeTab]);

  const loadOccupancy = async () => {
    try {
      const res = await analyticsAPI.getKPIs();
      if (res.data?.occupancy_rate !== undefined) {
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
          top: '18px',
          right: '24px',
          zIndex: 100,
          background: '#FFFFFF',
          border: '1.5px solid #0891B2',
          borderRadius: '999px',
          padding: '8px 22px',
          boxShadow: '0 8px 30px rgba(8, 145, 178, 0.25)'
        }}>
          <button 
            onClick={() => setActiveTab('dashboard')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#0891B2',
              fontWeight: '700',
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Staff PMS</span>
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
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#EDF6F9' }}>
        <Navbar 
          onOpenNewBooking={() => { setInitialBookingRoomId(null); setIsBookingModalOpen(true); }}
          occupancyRate={occupancyRate}
          setActiveTab={setActiveTab}
        />

        <main style={{ flex: 1, padding: '24px 30px' }}>
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
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
