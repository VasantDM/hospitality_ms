import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  BedDouble, 
  DollarSign, 
  Users, 
  Sparkles, 
  CalendarCheck, 
  Utensils, 
  ArrowUpRight,
  ShieldCheck,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { analyticsAPI, roomsAPI, reservationsAPI } from '../services/api';

export const Dashboard = ({ setActiveTab, onOpenNewBooking }) => {
  const [kpis, setKpis] = useState(null);
  const [trends, setTrends] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [kpiRes, trendRes, roomRes] = await Promise.all([
        analyticsAPI.getKPIs(),
        analyticsAPI.getRevenueTrends(),
        roomsAPI.getRooms()
      ]);
      setKpis(kpiRes.data);
      setTrends(trendRes.data);
      setRooms(roomRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
        <Sparkles size={32} color="#D4AF37" className="animate-spin" style={{ margin: '0 auto 16px' }} />
        <p>Loading Grand Vista Resort Intelligence...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '28px' }}>
      {/* Welcome Banner */}
      <div className="glass-card" style={{
        padding: '24px 30px',
        marginBottom: '28px',
        background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(19, 27, 46, 0.8) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '1px solid rgba(212, 175, 55, 0.3)'
      }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700' }}>
            Executive Hospitality Dashboard
          </span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '700', marginTop: '4px', marginBottom: '6px' }}>
            Welcome to <span className="gold-gradient-text">Grand Vista Resort & Villas</span>
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', margin: 0 }}>
            Property Status: <strong>{kpis?.occupied_rooms} Occupied</strong> • <strong>{kpis?.available_rooms} Available</strong> • <strong>{kpis?.dirty_rooms} Pending Cleaning</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setActiveTab('frontdesk')} className="btn-ghost">
            View Room Matrix
          </button>
          <button onClick={onOpenNewBooking} className="btn-gold">
            Express Check-In
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '28px' }}>
        {/* Occupancy Rate */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', color: '#94A3B8', fontWeight: '500' }}>Occupancy Rate</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} color="#10B981" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#F8FAFC' }}>
            {kpis?.occupancy_rate}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#34D399', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpRight size={14} />
            <span>+4.2% vs last week</span>
          </div>
        </div>

        {/* ADR (Average Daily Rate) */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', color: '#94A3B8', fontWeight: '500' }}>ADR (Avg Daily Rate)</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(212, 175, 55, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} color="#D4AF37" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#D4AF37' }}>
            ${kpis?.adr}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px' }}>
            Target: $190.00
          </div>
        </div>

        {/* RevPAR */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', color: '#94A3B8', fontWeight: '500' }}>RevPAR</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(14, 165, 233, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BedDouble size={18} color="#38BDF8" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#38BDF8' }}>
            ${kpis?.revpar}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#38BDF8', marginTop: '4px' }}>
            Revenue / Avail. Room
          </div>
        </div>

        {/* F&B Restaurant Sales */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', color: '#94A3B8', fontWeight: '500' }}>Dining & POS Today</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Utensils size={18} color="#F59E0B" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#FBBF24' }}>
            ${kpis?.restaurant_sales_today}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px' }}>
            F&B Master Folio Chargeable
          </div>
        </div>
      </div>

      {/* Middle Section: 7-Day Revenue Trend & Room Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '24px', marginBottom: '28px' }}>
        {/* Revenue Breakdown */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>7-Day Revenue Flow</h3>
              <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '2px 0 0' }}>Combined Room Tariffs & F&B POS Inflow</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#D4AF37' }}>
                <span style={{ width: '10px', height: '10px', background: '#D4AF37', borderRadius: '2px' }}></span>
                Rooms
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#38BDF8' }}>
                <span style={{ width: '10px', height: '10px', background: '#38BDF8', borderRadius: '2px' }}></span>
                Dining / Bar
              </span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '190px', paddingTop: '20px' }}>
            {trends.map((t, idx) => {
              const maxVal = 2500;
              const roomH = Math.min(100, (t.room_revenue / maxVal) * 100);
              const fnbH = Math.min(100, (t.fnb_revenue / maxVal) * 100);

              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '140px', width: '36px', justifyContent: 'center' }}>
                    {/* Room Revenue Bar */}
                    <div 
                      title={`Room Rev: $${t.room_revenue}`}
                      style={{ 
                        width: '14px', 
                        height: `${Math.max(12, roomH)}%`, 
                        background: 'linear-gradient(180deg, #D4AF37 0%, #8B6914 100%)', 
                        borderRadius: '4px 4px 0 0',
                        boxShadow: '0 0 10px rgba(212, 175, 55, 0.2)'
                      }}
                    ></div>
                    {/* F&B Revenue Bar */}
                    <div 
                      title={`F&B Rev: $${t.fnb_revenue}`}
                      style={{ 
                        width: '14px', 
                        height: `${Math.max(8, fnbH)}%`, 
                        background: 'linear-gradient(180deg, #38BDF8 0%, #0369A1 100%)', 
                        borderRadius: '4px 4px 0 0',
                        boxShadow: '0 0 10px rgba(14, 165, 233, 0.2)'
                      }}
                    ></div>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{t.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Inventory Status */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '6px' }}>Room State Breakdown</h3>
          <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '20px' }}>Total Capacity: {kpis?.total_rooms} Luxury Units</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ color: '#34D399', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></span>
                  Available Ready
                </span>
                <span style={{ fontWeight: '600' }}>{kpis?.available_rooms} Units</span>
              </div>
              <div style={{ height: '7px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${(kpis?.available_rooms / (kpis?.total_rooms || 1)) * 100}%`, height: '100%', background: '#10B981' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0EA5E9' }}></span>
                  Occupied Guests
                </span>
                <span style={{ fontWeight: '600' }}>{kpis?.occupied_rooms} Units</span>
              </div>
              <div style={{ height: '7px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${(kpis?.occupied_rooms / (kpis?.total_rooms || 1)) * 100}%`, height: '100%', background: '#0EA5E9' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ color: '#FBBF24', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }}></span>
                  Pending Housekeeping
                </span>
                <span style={{ fontWeight: '600' }}>{kpis?.dirty_rooms} Units</span>
              </div>
              <div style={{ height: '7px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${(kpis?.dirty_rooms / (kpis?.total_rooms || 1)) * 100}%`, height: '100%', background: '#F59E0B' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ color: '#FB7185', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F43F5E' }}></span>
                  Maintenance / OOO
                </span>
                <span style={{ fontWeight: '600' }}>{kpis?.maintenance_rooms} Units</span>
              </div>
              <div style={{ height: '7px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${(kpis?.maintenance_rooms / (kpis?.total_rooms || 1)) * 100}%`, height: '100%', background: '#F43F5E' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Front Desk Highlights */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>Front Office Quick Monitor</h3>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '2px 0 0' }}>Instant overview of prime resort units</p>
          </div>
          <button onClick={() => setActiveTab('frontdesk')} className="btn-ghost" style={{ fontSize: '0.82rem', padding: '6px 12px' }}>
            Open Full Grid
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '14px' }}>
          {rooms.slice(0, 8).map((room) => (
            <div 
              key={room.id}
              className="glass-card glass-card-interactive"
              style={{
                padding: '14px',
                borderLeft: room.status === 'occupied' 
                  ? '3px solid #38BDF8' 
                  : room.status === 'available' 
                    ? '3px solid #34D399' 
                    : '3px solid #FB7185'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: '700', fontSize: '1.05rem', color: '#F8FAFC' }}>#{room.room_number}</span>
                <span className={`badge badge-${room.status}`}>
                  {room.status}
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {room.category?.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#D4AF37', marginTop: '6px' }}>
                ${room.category?.base_price} / night
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
