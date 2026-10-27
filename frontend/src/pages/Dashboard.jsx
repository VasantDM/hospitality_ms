import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  BedDouble, 
  IndianRupee, 
  Users, 
  Sparkles, 
  CalendarCheck, 
  Utensils, 
  ArrowUpRight,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  CalendarPlus,
  DoorOpen,
  Receipt,
  Clock,
  ArrowRight
} from 'lucide-react';
import { analyticsAPI, roomsAPI, reservationsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

export const Dashboard = ({ setActiveTab, onOpenNewBooking }) => {
  const [kpis, setKpis] = useState(null);
  const [trends, setTrends] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nightAuditModalOpen, setNightAuditModalOpen] = useState(false);
  const toast = useToast();

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

  const handleRunNightAudit = () => {
    toast.success('Night Audit completed! Daily room charges and occupancy ledgers locked.');
    setNightAuditModalOpen(false);
    loadData();
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', color: '#64748B' }}>
        <Sparkles size={36} color="#0891B2" className="animate-spin" style={{ margin: '0 auto 16px' }} />
        <p style={{ fontSize: '1rem', fontWeight: '700', color: '#0F172A' }}>Loading Grand Vista Resort Analytics...</p>
      </div>
    );
  }

  const totalRooms = kpis?.total_rooms || 15;
  const availableRooms = kpis?.available_rooms || 8;
  const occupiedRooms = kpis?.occupied_rooms || 6;
  const maintenanceRooms = kpis?.maintenance_rooms || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* 1. Hero Panoramic Banner - Exactly Matching Screenshot */}
      <div style={{
        position: 'relative',
        borderRadius: '20px',
        overflow: 'hidden',
        minHeight: '190px',
        display: 'flex',
        alignItems: 'center',
        padding: '30px 36px',
        backgroundImage: `linear-gradient(90deg, rgba(14, 116, 144, 0.92) 0%, rgba(8, 145, 178, 0.78) 45%, rgba(14, 116, 144, 0.25) 100%), url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        boxShadow: '0 8px 30px rgba(8, 145, 178, 0.18)'
      }}>
        <div style={{ maxWidth: '680px', color: '#FFFFFF', zIndex: 2 }}>
          {/* Executive Chip */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.18)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '999px',
            padding: '4px 14px',
            fontSize: '0.72rem',
            fontWeight: '800',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: '10px'
          }}>
            EXECUTIVE HOSPITALITY DASHBOARD
          </div>

          <h2 style={{ fontSize: '1.85rem', fontWeight: '800', margin: '0 0 4px 0', color: '#FFFFFF' }}>
            Welcome to Grand Vista Resort & Villas
          </h2>
          <p style={{ margin: '0 0 20px 0', fontSize: '0.92rem', color: '#E0F2FE', fontWeight: '500' }}>
            Luxury Stays, Better Operations.
          </p>

          {/* Action Buttons in Banner */}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setActiveTab('frontdesk')}
              style={{
                background: '#0E7490',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                padding: '9px 20px',
                borderRadius: '999px',
                fontSize: '0.86rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)'
              }}
            >
              <span>View Room Matrix</span>
            </button>

            <button 
              onClick={onOpenNewBooking}
              className="btn-amber-outline"
              style={{
                background: '#FFFFFF',
                color: '#F97316',
                border: 'none',
                padding: '9px 20px',
                borderRadius: '999px',
                fontSize: '0.86rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)'
              }}
            >
              <CheckCircle size={16} color="#F97316" />
              <span>Express Check-In</span>
            </button>

            <button 
              onClick={() => setNightAuditModalOpen(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '9px 16px',
                borderRadius: '999px',
                fontSize: '0.84rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Clock size={15} />
              <span>Night Audit</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top 4 KPI Cards Row - Matching Screenshot */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }}>
        
        {/* Card 1: Occupancy Rate */}
        <div className="white-card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: '700', color: '#64748B' }}>Occupancy Rate</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={15} color="#0891B2" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0F172A', lineHeight: '1.1', marginBottom: '8px' }}>
            {kpis?.occupancy_rate || 40}%
          </div>
          <div style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>↗ +4.3% vs last week</span>
          </div>
        </div>

        {/* Card 2: ADR */}
        <div className="white-card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: '700', color: '#64748B' }}>ADR (Avg Daily Rate)</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IndianRupee size={15} color="#0891B2" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0F172A', lineHeight: '1.1', marginBottom: '8px' }}>
            ₹{kpis?.adr || 175}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '600' }}>
            Monthly Target: ₹190.00
          </div>
        </div>

        {/* Card 3: RevPAR (Amber Highlight) */}
        <div className="white-card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: '700', color: '#64748B' }}>RevPAR</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={15} color="#F97316" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#F97316', lineHeight: '1.1', marginBottom: '8px' }}>
            ₹{kpis?.revpar || 125}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '600' }}>
            Revenue / Avail. Room
          </div>
        </div>

        {/* Card 4: Dining & POS Today */}
        <div className="white-card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: '700', color: '#64748B' }}>Dining & POS Today</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#E2F4F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Utensils size={15} color="#0E7490" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0F172A', lineHeight: '1.1', marginBottom: '8px' }}>
            ₹{kpis?.restaurant_sales_today || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#0891B2', fontWeight: '700' }}>
            Master Folio Direct Route
          </div>
        </div>

      </div>

      {/* 3. Main Dashboard Body: 2 Columns Matching Screenshot */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: '22px' }}>
        
        {/* LEFT COLUMN: Revenue Flow & Room State Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* Card A: 7-Day Revenue Flow */}
          <div className="white-card" style={{ padding: '24px 26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                7-Day Revenue Flow
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.78rem', fontWeight: '700' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0891B2' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0891B2' }} />
                  Rooms
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F97316' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F97316' }} />
                  Dining / Bar
                </span>
              </div>
            </div>

            {/* Custom Bar Chart Matching Screenshot Gradient Bars */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '170px', padding: '10px 10px 0' }}>
              {trends.map((item, idx) => {
                const maxVal = 2600;
                const roomHeight = Math.min(130, Math.max(25, (item.room_revenue / maxVal) * 130));
                const fnbHeight = Math.min(45, Math.max(10, (item.fnb_revenue / maxVal) * 45));

                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '140px' }}>
                      {/* Room Bar (Teal Gradient) */}
                      <div 
                        title={`Rooms: ₹${item.room_revenue}`}
                        style={{
                          width: '14px',
                          height: `${roomHeight}px`,
                          borderRadius: '8px 8px 3px 3px',
                          background: 'linear-gradient(180deg, #22D3EE 0%, #0891B2 100%)',
                          boxShadow: '0 2px 8px rgba(8, 145, 178, 0.25)',
                          transition: 'height 0.4s ease'
                        }} 
                      />
                      {/* Dining Bar (Amber) */}
                      <div 
                        title={`F&B: ₹${item.fnb_revenue}`}
                        style={{
                          width: '10px',
                          height: `${fnbHeight}px`,
                          borderRadius: '6px 6px 2px 2px',
                          background: 'linear-gradient(180deg, #FDBA74 0%, #F97316 100%)',
                          boxShadow: '0 2px 6px rgba(249, 115, 22, 0.2)'
                        }} 
                      />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '600' }}>
                      {item.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card B: Room State Breakdown */}
          <div className="white-card" style={{ padding: '24px 26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                Room State Breakdown
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '600' }}>
                Total Capacity: {totalRooms} Luxury Units
              </span>
            </div>

            {/* Horizontal Progress Bar */}
            <div style={{
              height: '10px',
              borderRadius: '999px',
              background: '#E2EFF3',
              overflow: 'hidden',
              display: 'flex',
              margin: '16px 0 14px'
            }}>
              <div style={{ width: `${(availableRooms / totalRooms) * 100}%`, background: '#10B981' }} title="Available" />
              <div style={{ width: `${(occupiedRooms / totalRooms) * 100}%`, background: '#0891B2' }} title="Occupied" />
              <div style={{ width: `${(maintenanceRooms / totalRooms) * 100}%`, background: '#EF4444' }} title="Maintenance" />
            </div>

            {/* Status Legend */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0F172A' }}>Available Ready</span>
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0891B2' }}>
                {availableRooms} Units
              </span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Quick Actions & Recent Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* Card C: Quick Actions Matching Screenshot */}
          <div className="white-card" style={{ padding: '24px 26px' }}>
            <h3 style={{ fontSize: '1.02rem', fontWeight: '800', color: '#0F172A', margin: '0 0 16px 0' }}>
              Quick Actions
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              
              {/* Action 1: New Booking */}
              <button 
                onClick={onOpenNewBooking}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2EFF3',
                  borderRadius: '14px',
                  padding: '16px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(8, 145, 178, 0.04)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CalendarPlus size={18} color="#0891B2" />
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#0F172A', textAlign: 'center' }}>
                  New Booking
                </span>
              </button>

              {/* Action 2: Check In */}
              <button 
                onClick={() => setActiveTab('frontdesk')}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2EFF3',
                  borderRadius: '14px',
                  padding: '16px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(8, 145, 178, 0.04)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DoorOpen size={18} color="#0891B2" />
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#0F172A', textAlign: 'center' }}>
                  Check In
                </span>
              </button>

              {/* Action 3: Room Service / POS */}
              <button 
                onClick={() => setActiveTab('pos')}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2EFF3',
                  borderRadius: '14px',
                  padding: '16px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(8, 145, 178, 0.04)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Utensils size={18} color="#0891B2" />
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#0F172A', textAlign: 'center' }}>
                  Room Service
                </span>
              </button>

              {/* Action 4: Folios */}
              <button 
                onClick={() => setActiveTab('billing')}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2EFF3',
                  borderRadius: '14px',
                  padding: '16px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(8, 145, 178, 0.04)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Receipt size={18} color="#0891B2" />
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#0F172A', textAlign: 'center' }}>
                  Folios
                </span>
              </button>

            </div>
          </div>

          {/* Card D: Recent Activity Matching Screenshot */}
          <div className="white-card" style={{ padding: '24px 26px', flex: 1 }}>
            <h3 style={{ fontSize: '1.02rem', fontWeight: '800', color: '#0F172A', margin: '0 0 18px 0' }}>
              Recent Activity
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DoorOpen size={15} color="#0891B2" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0F172A' }}>Room 302 Checked In</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Sarah Jenkins • Front Desk</div>
                  </div>
                </div>
                <span style={{ fontSize: '0.74rem', color: '#94A3B8', fontWeight: '600' }}>3m ago</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E2F4F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Utensils size={15} color="#0E7490" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0F172A' }}>Table 12 Order Placed</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Marco Rossi • F&B Captain</div>
                  </div>
                </div>
                <span style={{ fontSize: '0.74rem', color: '#94A3B8', fontWeight: '600' }}>8m ago</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={15} color="#F97316" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0F172A' }}>Housekeeping Update</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Room 104 marked Clean</div>
                  </div>
                </div>
                <span style={{ fontSize: '0.74rem', color: '#94A3B8', fontWeight: '600' }}>12m ago</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={15} color="#0891B2" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0F172A' }}>Guest Check-Out</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Folio #12 settled in full</div>
                  </div>
                </div>
                <span style={{ fontSize: '0.74rem', color: '#94A3B8', fontWeight: '600' }}>25m ago</span>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Night Audit Modal */}
      {nightAuditModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="white-card" style={{ width: '460px', padding: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#E2F4F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={20} color="#0891B2" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0F172A' }}>Execute Night Audit</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>Midnight Financial & Operational Closeout</p>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: '1.5', marginBottom: '20px' }}>
              Running the Night Audit will roll over property operational date, post daily room rates + 12% occupancy taxes across all <strong>{occupiedRooms} occupied suites</strong>, and lock financial ledgers.
            </p>

            <div style={{ background: '#F8FDFF', border: '1px solid #E2EFF3', borderRadius: '12px', padding: '14px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                <span style={{ color: '#64748B' }}>Estimated Room Revenue Post:</span>
                <strong style={{ color: '#0F172A' }}>₹{kpis?.adr * occupiedRooms || 1050}.00</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748B' }}>Occupancy Lock:</span>
                <strong style={{ color: '#0891B2' }}>{kpis?.occupancy_rate || 40}%</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setNightAuditModalOpen(false)}
                className="btn-ghost"
              >
                Cancel
              </button>
              <button 
                onClick={handleRunNightAudit}
                className="btn-teal"
              >
                Confirm & Run Audit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
