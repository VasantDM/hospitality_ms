import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  CreditCard, 
  Plus, 
  Printer, 
  CheckCircle, 
  DollarSign, 
  Calendar, 
  User, 
  ShieldCheck,
  FileText
} from 'lucide-react';
import { foliosAPI, reservationsAPI } from '../services/api';

export const BillingFolio = ({ selectedFolioId = null }) => {
  const [reservations, setReservations] = useState([]);
  const [selectedResId, setSelectedResId] = useState(selectedFolioId || '');
  const [currentFolio, setCurrentFolio] = useState(null);
  const [loading, setLoading] = useState(false);

  // Add Charge modal
  const [showAddCharge, setShowAddCharge] = useState(false);
  const [chargeDesc, setChargeDesc] = useState('');
  const [chargeCategory, setChargeCategory] = useState('spa');
  const [chargeAmount, setChargeAmount] = useState('');

  // Process Payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('credit_card');
  const [payTxnRef, setPayTxnRef] = useState('');

  useEffect(() => {
    loadReservations();
  }, []);

  useEffect(() => {
    if (selectedResId) {
      loadFolio(selectedResId);
    }
  }, [selectedResId]);

  const loadReservations = async () => {
    try {
      const res = await reservationsAPI.getReservations();
      setReservations(res.data);
      if (!selectedResId && res.data.length > 0) {
        setSelectedResId(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadFolio = async (resId) => {
    try {
      setLoading(true);
      const res = await foliosAPI.getFolioByReservation(resId);
      setCurrentFolio(res.data);
      setPayAmount(res.data.balance_due > 0 ? res.data.balance_due.toString() : '0');
    } catch (err) {
      console.error(err);
      setCurrentFolio(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCharge = async (e) => {
    e.preventDefault();
    if (!currentFolio) return;
    try {
      await foliosAPI.addCharge(currentFolio.id, {
        description: chargeDesc,
        category: chargeCategory,
        amount: parseFloat(chargeAmount),
        quantity: 1
      });
      setShowAddCharge(false);
      setChargeDesc('');
      setChargeAmount('');
      loadFolio(selectedResId);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to post charge');
    }
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!currentFolio) return;
    try {
      await foliosAPI.addPayment(currentFolio.id, {
        amount: parseFloat(payAmount),
        payment_method: payMethod,
        transaction_ref: payTxnRef || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        notes: 'Settlement at front desk'
      });
      setShowPaymentModal(false);
      loadFolio(selectedResId);
    } catch (err) {
      alert(err.response?.data?.detail || 'Payment failed');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const activeRes = reservations.find(r => r.id === parseInt(selectedResId));

  return (
    <div style={{ padding: '28px' }}>
      {/* Top Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Master Folio & Invoicing</h2>
          <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: '4px 0 0' }}>Central guest financial ledger, room/restaurant itemization, and tax invoice</p>
        </div>

        {/* Reservation Selector */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select 
            className="input-dark"
            style={{ width: '280px', height: '38px', fontSize: '0.85rem' }}
            value={selectedResId}
            onChange={(e) => setSelectedResId(e.target.value)}
          >
            {reservations.map(r => (
              <option key={r.id} value={r.id}>
                {r.booking_code} — {r.guest?.first_name} {r.guest?.last_name} ({r.status})
              </option>
            ))}
          </select>

          <button onClick={handlePrint} className="btn-ghost" title="Print Tax Invoice">
            <Printer size={16} />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      {currentFolio && activeRes ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
          {/* Left: Folio Itemized Statement */}
          <div className="glass-card" style={{ padding: '26px' }}>
            {/* Invoice Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '20px', marginBottom: '20px' }}>
              <div>
                <span className="gold-gradient-text" style={{ fontSize: '1.3rem', fontWeight: '800' }}>
                  GRAND VISTA RESORT & SPA
                </span>
                <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: '4px 0 0' }}>
                  100 Ocean Crest Blvd, Paradise Coast • GSTIN: 29AAAAA0000A1Z5
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#F8FAFC' }}>
                  FOLIO #{currentFolio.id}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#D4AF37', fontWeight: '600' }}>
                  Booking: {activeRes.booking_code}
                </div>
                <span className={`badge badge-${currentFolio.status === 'settled' ? 'available' : 'dirty'}`} style={{ marginTop: '4px' }}>
                  {currentFolio.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Guest Summary Banner */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '14px 18px',
              marginBottom: '20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '14px',
              fontSize: '0.82rem'
            }}>
              <div>
                <span style={{ color: '#64748B', display: 'block' }}>Guest Name:</span>
                <strong style={{ color: '#F8FAFC' }}>{activeRes.guest?.first_name} {activeRes.guest?.last_name}</strong>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block' }}>Stay Period:</span>
                <strong style={{ color: '#F8FAFC' }}>{activeRes.check_in_date} to {activeRes.check_out_date}</strong>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block' }}>ID / Passport:</span>
                <strong style={{ color: '#F8FAFC' }}>{activeRes.guest?.id_proof_number || 'US98320491'}</strong>
              </div>
            </div>

            {/* Charges Table */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0, color: '#F8FAFC' }}>
                Itemized Debits & Charges
              </h4>
              <button onClick={() => setShowAddCharge(true)} className="btn-ghost" style={{ fontSize: '0.78rem', padding: '5px 10px' }}>
                <Plus size={14} /> Add Incidentals
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem', marginBottom: '24px' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.04)', color: '#94A3B8', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <th style={{ padding: '10px 14px' }}>Description</th>
                  <th style={{ padding: '10px 14px' }}>Category</th>
                  <th style={{ padding: '10px 14px' }}>Qty</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {currentFolio.items?.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '12px 14px', color: '#F8FAFC', fontWeight: '500' }}>{item.description}</td>
                    <td style={{ padding: '12px 14px', color: '#94A3B8', textTransform: 'capitalize' }}>{item.category.replace('_', ' ')}</td>
                    <td style={{ padding: '12px 14px', color: '#94A3B8' }}>{item.quantity}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '600', color: '#D4AF37' }}>${item.total_amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Payments Record Table */}
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: '0 0 12px 0', color: '#F8FAFC' }}>
              Recorded Credits & Payments
            </h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.04)', color: '#94A3B8', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <th style={{ padding: '10px 14px' }}>Method</th>
                  <th style={{ padding: '10px 14px' }}>Reference #</th>
                  <th style={{ padding: '10px 14px' }}>Notes</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Amount Paid</th>
                </tr>
              </thead>
              <tbody>
                {currentFolio.payments?.map(pay => (
                  <tr key={pay.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '10px 14px', color: '#34D399', fontWeight: '600', textTransform: 'capitalize' }}>
                      ✓ {pay.payment_method.replace('_', ' ')}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#94A3B8' }}>{pay.transaction_ref || 'N/A'}</td>
                    <td style={{ padding: '10px 14px', color: '#64748B' }}>{pay.notes || '-'}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '600', color: '#34D399' }}>${pay.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right: Folio Balance & Settlement Card */}
          <div className="glass-card" style={{ padding: '24px', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '18px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
              Folio Settlement Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#94A3B8' }}>
                <span>Gross Charges:</span>
                <span style={{ color: '#F8FAFC', fontWeight: '600' }}>${currentFolio.total_charges.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#94A3B8' }}>
                <span>Total Payments:</span>
                <span style={{ color: '#34D399', fontWeight: '600' }}>-${currentFolio.total_payments.toFixed(2)}</span>
              </div>
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1rem', fontWeight: '700', color: '#F8FAFC' }}>Balance Due:</span>
                <span style={{ fontSize: '1.4rem', fontWeight: '800', color: currentFolio.balance_due > 0 ? '#FB7185' : '#34D399' }}>
                  ${currentFolio.balance_due.toFixed(2)}
                </span>
              </div>
            </div>

            {currentFolio.balance_due > 0 ? (
              <button 
                onClick={() => setShowPaymentModal(true)} 
                className="btn-gold" 
                style={{ width: '100%', padding: '12px' }}
              >
                <CreditCard size={16} />
                <span>Process Settlement Payment</span>
              </button>
            ) : (
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center',
                color: '#34D399',
                fontSize: '0.88rem',
                fontWeight: '600'
              }}>
                ✓ Folio Fully Settled & Balanced
              </div>
            )}
          </div>
        </div>
      ) : (
        <p style={{ color: '#94A3B8' }}>Select a reservation above to load its guest folio.</p>
      )}

      {/* Add Incidental Charge Modal */}
      {showAddCharge && (
        <div className="modal-overlay" onClick={() => setShowAddCharge(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }} className="gold-gradient-text">Post Incidental Charge</h3>
            </div>
            <form onSubmit={handleAddCharge} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '6px' }}>Charge Description *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Aromatherapy Spa Session (60m)" 
                  className="input-dark"
                  value={chargeDesc}
                  onChange={(e) => setChargeDesc(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '6px' }}>Category</label>
                  <select className="input-dark" value={chargeCategory} onChange={(e) => setChargeCategory(e.target.value)}>
                    <option value="spa">Spa & Wellness</option>
                    <option value="laundry">Laundry</option>
                    <option value="bar">Bar & Minibar</option>
                    <option value="activities">Resort Activities</option>
                    <option value="transport">Airport Transfer</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '6px' }}>Amount ($) *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    required 
                    placeholder="75.00" 
                    className="input-dark"
                    value={chargeAmount}
                    onChange={(e) => setChargeAmount(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowAddCharge(false)} className="btn-ghost">Cancel</button>
                <button type="submit" className="btn-gold">Post to Folio</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Process Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }} className="gold-gradient-text">Receive Folio Payment</h3>
            </div>
            <form onSubmit={handleProcessPayment} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '6px' }}>Amount to Collect ($) *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  required 
                  className="input-dark"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '6px' }}>Payment Method</label>
                <select className="input-dark" value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                  <option value="credit_card">Credit / Debit Card (Stripe Terminal)</option>
                  <option value="cash">Cash Counter</option>
                  <option value="upi">UPI / Instant QR</option>
                  <option value="bank_transfer">Corporate Bank Transfer</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '6px' }}>Card / Bank Reference</label>
                <input 
                  type="text" 
                  placeholder="e.g. AUTH-VISA-88219" 
                  className="input-dark"
                  value={payTxnRef}
                  onChange={(e) => setPayTxnRef(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowPaymentModal(false)} className="btn-ghost">Cancel</button>
                <button type="submit" className="btn-emerald">Confirm & Print Receipt</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
