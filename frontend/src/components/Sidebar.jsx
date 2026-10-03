import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  BedDouble, 
  UtensilsCrossed, 
  Sparkles, 
  Receipt, 
  BarChart3, 
  Globe, 
  ShieldCheck, 
  ChevronRight,
  Compass
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
      background: 'linear-gradient(180deg, #0d1322 0%, #080c14 100%)',
      borderRight: '1px solid rgba(255, 255, 255, 0.07)',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 18px',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', paddingLeft: '8px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #D4AF37 0%, #996515 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(212, 175, 55, 0.35)',
          color: '#0B0F19',
          fontWeight: '800',
          fontSize: '1.2rem'
        }}>
          GV
        </div>
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: '700', letterSpacing: '0.02em', margin: 0 }} className="gold-gradient-text">
            GRAND VISTA
          </h1>
          <p style={{ fontSize: '0.72rem', color: '#94A3B8', margin: 0, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Resort & Hotel PMS
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
                padding: '11px 14px',
                borderRadius: '10px',
                border: isActive 
                  ? '1px solid rgba(212, 175, 55, 0.35)' 
                  : item.highlight 
                    ? '1px solid rgba(14, 165, 233, 0.25)' 
                    : '1px solid transparent',
                background: isActive
                  ? 'linear-gradient(90deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.03) 100%)'
                  : item.highlight 
                    ? 'rgba(14, 165, 233, 0.06)' 
                    : 'transparent',
                color: isActive 
                  ? '#D4AF37' 
                  : item.highlight 
                    ? '#38BDF8' 
                    : '#94A3B8',
                fontWeight: isActive ? '600' : '500',
                fontSize: '0.9rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={19} color={isActive ? '#D4AF37' : item.highlight ? '#38BDF8' : '#94A3B8'} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span style={{
                  fontSize: '0.68rem',
                  padding: '2px 7px',
                  borderRadius: '999px',
                  background: isActive ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.07)',
                  color: isActive ? '#F3E5AB' : '#94A3B8',
                  fontWeight: '600'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Role Switcher Widget */}
      <div style={{
        marginTop: 'auto',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        borderRadius: '12px',
        padding: '14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <img 
            src={currentUser.avatar} 
            alt={currentUser.name} 
            style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #D4AF37' }}
          />
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '0.86rem', fontWeight: '600', color: '#F8FAFC', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {currentUser.name}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#D4AF37', textTransform: 'capitalize' }}>
              {currentUser.title}
            </div>
          </div>
        </div>

        {/* Quick Role Toggle Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
          {DEMO_USERS.map((user) => (
            <button
              key={user.role}
              title={`Switch role to ${user.title}`}
              onClick={() => switchDemoRole(user)}
              style={{
                fontSize: '0.65rem',
                padding: '4px 0',
                textAlign: 'center',
                borderRadius: '6px',
                border: currentUser.role === user.role ? '1px solid #D4AF37' : '1px solid rgba(255, 255, 255, 0.06)',
                background: currentUser.role === user.role ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.02)',
                color: currentUser.role === user.role ? '#D4AF37' : '#64748B',
                cursor: 'pointer',
                fontWeight: '600',
                textTransform: 'uppercase'
              }}
            >
              {user.role === 'front_desk' ? 'Desk' : user.role === 'housekeeping' ? 'Clean' : user.role}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};
