import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  BedDouble, 
  UtensilsCrossed, 
  Sparkles, 
  Receipt, 
  Globe, 
  Compass,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { currentUser, switchDemoRole } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Executive Overview', icon: LayoutDashboard, badge: 'Live' },
    { id: 'frontdesk', label: 'Front Desk Matrix', icon: CalendarDays, badge: 'Core' },
    { id: 'rooms', label: 'Rooms & Villas', icon: BedDouble },
    { id: 'reservations', label: 'Guest Bookings', icon: Compass },
    { id: 'pos', label: 'Restaurant & POS', icon: UtensilsCrossed, badge: 'F&B' },
    { id: 'housekeeping', label: 'Housekeeping & Maint.', icon: Sparkles },
    { id: 'billing', label: 'Folios & Invoicing', icon: Receipt },
    { id: 'guest_portal', label: 'Public Guest Portal', icon: Globe, highlight: true },
  ];

  return (
    <aside style={{
      background: '#FFFFFF',
      borderRight: '1px solid #E2EFF3',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      boxShadow: '2px 0 16px rgba(8, 145, 178, 0.04)'
    }}>
      {/* Brand Logo - Matching Screenshot */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', paddingLeft: '8px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #0891B2 0%, #0E7490 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(8, 145, 178, 0.35)',
          color: '#FFFFFF',
          fontWeight: '800',
          fontSize: '1.15rem',
          letterSpacing: '0.04em'
        }}>
          GV
        </div>
        <div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: '800', letterSpacing: '0.02em', margin: 0, color: '#0F172A' }}>
            GRAND VISTA
          </h1>
          <p style={{ fontSize: '0.7rem', color: '#0891B2', margin: 0, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: '700' }}>
            RESORT & HOTEL PMS
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 16px',
                borderRadius: '999px',
                border: 'none',
                background: isActive
                  ? '#E2F4F7'
                  : item.highlight 
                    ? '#F0F9FF' 
                    : 'transparent',
                color: isActive 
                  ? '#0891B2' 
                  : item.highlight 
                    ? '#0284C7' 
                    : '#475569',
                fontWeight: isActive ? '700' : '600',
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                width: '100%',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = '#F1F8FA';
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = item.highlight ? '#F0F9FF' : 'transparent';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={18} color={isActive ? '#0891B2' : item.highlight ? '#0284C7' : '#64748B'} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontWeight: '700',
                  background: isActive ? '#0891B2' : '#E2F4F7',
                  color: isActive ? '#FFFFFF' : '#0E7490',
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Role Switcher Pill - Matching Screenshot Demo Controls */}
      <div style={{
        marginTop: 'auto',
        padding: '14px',
        borderRadius: '16px',
        background: '#F8FDFF',
        border: '1px solid #E2EFF3'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" 
            alt="User"
            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.84rem', fontWeight: '700', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentUser?.name || 'Alexander Wright'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#0891B2', fontWeight: '600' }}>
              {currentUser?.role || 'General Manager'}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          {Object.entries(DEMO_USERS).slice(0, 4).map(([roleKey, u]) => (
            <button
              key={roleKey}
              onClick={() => switchDemoRole(roleKey)}
              style={{
                fontSize: '0.68rem',
                padding: '5px 8px',
                borderRadius: '6px',
                border: currentUser?.id === roleKey ? '1px solid #0891B2' : '1px solid #E2EFF3',
                background: currentUser?.id === roleKey ? '#E2F4F7' : '#FFFFFF',
                color: currentUser?.id === roleKey ? '#0891B2' : '#64748B',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {roleKey.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};
