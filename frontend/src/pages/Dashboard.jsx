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
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#6B7280' }}>
        <Sparkles size={36} color="#2D3A82" className="animate-spin" style={{ margin: '0 auto 16px' }} />
        <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1F2937' }}>Loading Grand Vista Resort Intelligence...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '28px' }}>
      {/* Welcome Banner - Primary Card (Rich Indigo) */}
      <div className="primary-card" style={{
        padding: '28px 32px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: '#E29578', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '800' }}>
            Executive Hospitality Dashboard
          </span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '6px', marginBottom: '8px', color: '#FFFFFF' }}>
            Welcome to Grand Vista Resort & Villas
          </h2>
          <p style={{ color: '#E2E8F0', fontSize: '0.92rem', margin: 0 }}>
            Property Status: <strong style={{ color: '#FFFFFF' }}>{kpis?.occupied_rooms} Occupied</strong> • <strong style={{ color: '#FFFFFF' }}>{kpis?.available_rooms} Available</strong> • <strong style={{ color: '#FFFFFF' }}>{kpis?.dirty_rooms} Pending Cleaning</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setActiveTab('frontdesk')} className="btn-ghost-dark">
            View Room Matrix
          </button>
          <button onClick={onOpenNewBooking} className="btn-amber">
            <CalendarCheck size={16} />
            <span>Express Check-In</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid - Main Dashboard Cards (Pure Warm White) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '28px' }}>
        {/* Occupancy Rate */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', color: '#6B7280', fontWeight: '600' }}>Occupancy Rate</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} color="#10B981" />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: '800', color: '#1F2937' }}>
            {kpis?.occupancy_rate}%
          </div>
          <div style={{ fontSize: '0.78rem', color: '#059669', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
            <ArrowUpRight size={14} />
            <span>+4.2% vs last week</span>
          </div>
        </div>

        {/* ADR (Average Daily Rate) */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', color: '#6B7280', fontWeight: '600' }}>ADR (Avg Daily Rate)</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(45, 58, 130, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} color="#2D3A82" />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: '800', color: '#2D3A82' }}>
            ${kpis?.adr}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '6px' }}>
            Monthly Target: $190.00
          </div>
        </div>

        {/* RevPAR */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', color: '#6B7280', fontWeight: '600' }}>RevPAR</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(226, 149, 120, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BedDouble size={18} color="#E29578" />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: '800', color: '#E29578' }}>
            ${kpis?.revpar}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '6px' }}>
            Revenue / Avail. Room
          </div>
        </div>

        {/* F&B Restaurant Sales */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', color: '#6B7280', fontWeight: '600' }}>Dining & POS Today</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Utensils size={18} color="#F59E0B" />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: '800', color: '#1F2937' }}>
            ${kpis?.restaurant_sales_today}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '6px' }}>
            Master Folio Direct Route
          </div>
        </div>
      </div>

      {/* Middle Section: 7-Day Revenue Trend & Room Distribution (Pure Warm White cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '24px', marginBottom: '28px' }}>
        {/* Revenue Breakdown */}
        <div className="glass-card" style={{ padding: '26px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: '#1F2937' }}>7-Day Revenue Flow</h3>
              <p style={{ fontSize: '0.82rem', color: '#6B7280', margin: '3px 0 0' }}>Combined Room Tariffs & F&B POS Inflow</p>
            </div>
            <div style={{ display: 'flex', gap: '14px', fontSize: '0.82rem', fontWeight: '600' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2D3A82' }}>
                <span style={{ width: '12px', height: '12px', background: '#2D3A82', borderRadius: '3px' }}></span>
                Rooms
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#E29578' }}>
                <span style={{ width: '12px', height: '12px', background: '#E29578', borderRadius: '3px' }}></span>
                Dining / Bar
              </span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '190px', paddingTop: '20px', borderBottom: '1px solid #E5E9F2' }}>
            {trends.map((t, idx) => {
              const maxVal = 2500;
              const roomH = Math.min(100, (t.room_revenue / maxVal) * 100);
              const fnbH = Math.min(100, (t.fnb_revenue / maxVal) * 100);

              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '5px', height: '140px', width: '38px', justifyContent: 'center' }}>
                    {/* Room Revenue Bar - Rich Indigo */}
                    <div 
                      title={`Room Rev: $${t.room_revenue}`}
                      style={{ 
                        width: '14px', 
                        height: `${Math.max(12, roomH)}%`, 
                        background: 'linear-gradient(180deg, #37469B 0%, #2D3A82 100%)', 
                        borderRadius: '4px 4px 0 0',
                        boxShadow: '0 2px 8px rgba(45, 58, 130, 0.2)'
                      }}
                    ></div>
                    {/* F&B Revenue Bar - Muted Amber */}
                    <div 
                      title={`F&B Rev: $${t.fnb_revenue}`}
                      style={{ 
                        width: '14px', 
                        height: `${Math.max(8, fnbH)}%`, 
                        background: 'linear-gradient(180deg, #E8A186 0%, #E29578 100%)', 
                        borderRadius: '4px 4px 0 0',
                        boxShadow: '0 2px 8px rgba(226, 149, 120, 0.25)'
                      }}
                    ></div>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: '#6B7280', fontWeight: '500' }}>{t.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Inventory Status (Pure Warm White card) */}
        <div className="glass-card" style={{ padding: '26px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '6px', color: '#1F2937' }}>Room State Breakdown</h3>
          <p style={{ fontSize: '0.82rem', color: '#6B7280', marginBottom: '20px' }}>Total Capacity: {kpis?.total_rooms} Luxury Units</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></span>
                  Available Ready
                </span>
                <span style={{ fontWeight: '700', color: '#1F2937' }}>{kpis?.available_rooms} Units</span>
              </div>
              <div style={{ height: '8px', background: '#F3F4F6', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${(kpis?.available_rooms / (kpis?.total_rooms || 1)) * 100}%`, height: '100%', background: '#10B981' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ color: '#2D3A82', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2D3A82' }}></span>
                  Occupied Guests
                </span>
                <span style={{ fontWeight: '700', color: '#1F2937' }}>{kpis?.occupied_rooms} Units</span>
              </div>
              <div style={{ height: '8px', background: '#F3F4F6', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${(kpis?.occupied_rooms / (kpis?.total_rooms || 1)) * 100}%`, height: '100%', background: '#2D3A82' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ color: '#D97706', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }}></span>
                  Pending Housekeeping
                </span>
                <span style={{ fontWeight: '700', color: '#1F2937' }}>{kpis?.dirty_rooms} Units</span>
              </div>
              <div style={{ height: '8px', background: '#F3F4F6', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${(kpis?.dirty_rooms / (kpis?.total_rooms || 1)) * 100}%`, height: '100%', background: '#F59E0B' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ color: '#DC2626', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }}></span>
                  Maintenance / OOO
                </span>
                <span style={{ fontWeight: '700', color: '#1F2937' }}>{kpis?.maintenance_rooms} Units</span>
              </div>
              <div style={{ height: '8px', background: '#F3F4F6', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${(kpis?.maintenance_rooms / (kpis?.total_rooms || 1)) * 100}%`, height: '100%', background: '#EF4444' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Front Desk Highlights (Pure Warm White card) */}
      <div className="glass-card" style={{ padding: '26px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: '#1F2937' }}>Front Office Quick Monitor</h3>
            <p style={{ fontSize: '0.82rem', color: '#6B7280', margin: '3px 0 0' }}>Instant overview of prime resort units</p>
          </div>
          <button onClick={() => setActiveTab('frontdesk')} className="btn-ghost" style={{ fontSize: '0.82rem', padding: '6px 14px' }}>
            Open Full Grid
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px' }}>
          {rooms.slice(0, 8).map((room) => (
            <div 
              key={room.id}
              className="glass-card glass-card-interactive"
              style={{
                padding: '16px',
                borderLeft: room.status === 'occupied' 
                  ? '4px solid #2D3A82' 
                  : room.status === 'available' 
                    ? '4px solid #10B981' 
                    : '4px solid #EF4444'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: '800', fontSize: '1.1rem', color: '#1F2937' }}>#{room.room_number}</span>
                <span className={`badge badge-${room.status}`}>
                  {room.status}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#4B5563', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '500' }}>
                {room.category?.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#E29578', marginTop: '8px', fontWeight: '700' }}>
                ${room.category?.base_price} / night
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
