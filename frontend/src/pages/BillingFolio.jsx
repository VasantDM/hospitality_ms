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
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0, color: '#1F2937' }}>Master Folio & Invoicing</h2>
          <p style={{ fontSize: '0.86rem', color: '#6B7280', margin: '4px 0 0' }}>Central guest financial ledger, room/restaurant itemization, and tax invoice</p>
        </div>

        {/* Reservation Selector */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select 
            className="input-dark"
            style={{ width: '300px', height: '40px', fontSize: '0.85rem' }}
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
          {/* Left: Folio Itemized Statement - Pure Warm White Card */}
          <div className="glass-card" style={{ padding: '28px' }}>
            {/* Invoice Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E5E9F2', paddingBottom: '22px', marginBottom: '22px' }}>
              <div>
                <span style={{ fontSize: '1.35rem', fontWeight: '800', color: '#2D3A82' }}>
                  GRAND VISTA RESORT & SPA
                </span>
                <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: '4px 0 0' }}>
                  100 Ocean Crest Blvd, Paradise Coast • Tax ID / GSTIN: 29AAAAA0000A1Z5
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1F2937' }}>
                  FOLIO #{currentFolio.id}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#E29578', fontWeight: '700' }}>
                  Booking: {activeRes.booking_code}
                </div>
                <span className={`badge badge-${currentFolio.status === 'settled' ? 'available' : 'dirty'}`} style={{ marginTop: '6px' }}>
                  {currentFolio.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Guest Summary Banner */}
            <div style={{
              background: '#F8FAFD',
              border: '1px solid #E5E9F2',
              borderRadius: '10px',
              padding: '16px 20px',
              marginBottom: '22px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '14px',
              fontSize: '0.84rem'
            }}>
              <div>
                <span style={{ color: '#6B7280', display: 'block', fontSize: '0.76rem', textTransform: 'uppercase', fontWeight: '600' }}>Guest Name:</span>
                <strong style={{ color: '#1F2937' }}>{activeRes.guest?.first_name} {activeRes.guest?.last_name}</strong>
              </div>
              <div>
                <span style={{ color: '#6B7280', display: 'block', fontSize: '0.76rem', textTransform: 'uppercase', fontWeight: '600' }}>Stay Period:</span>
                <strong style={{ color: '#1F2937' }}>{activeRes.check_in_date} to {activeRes.check_out_date}</strong>
              </div>
              <div>
                <span style={{ color: '#6B7280', display: 'block', fontSize: '0.76rem', textTransform: 'uppercase', fontWeight: '600' }}>ID / Passport:</span>
                <strong style={{ color: '#1F2937' }}>{activeRes.guest?.id_proof_number || 'US98320491'}</strong>
              </div>
            </div>

            {/* Charges Table */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: 0, color: '#1F2937' }}>
                Itemized Debits & Charges
              </h4>
              <button onClick={() => setShowAddCharge(true)} className="btn-ghost" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                <Plus size={14} color="#2D3A82" /> <span>Add Incidentals</span>
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem', marginBottom: '28px' }}>
              <thead>
                <tr style={{ background: '#F8FAFD', color: '#4B5563', borderBottom: '1px solid #E5E9F2', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: '700' }}>
                  <th style={{ padding: '12px 16px' }}>Description</th>
                  <th style={{ padding: '12px 16px' }}>Category</th>
                  <th style={{ padding: '12px 16px' }}>Qty</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {currentFolio.items?.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 16px', color: '#1F2937', fontWeight: '600' }}>{item.description}</td>
                    <td style={{ padding: '14px 16px', color: '#6B7280', textTransform: 'capitalize' }}>{item.category.replace('_', ' ')}</td>
                    <td style={{ padding: '14px 16px', color: '#6B7280' }}>{item.quantity}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '700', color: '#2D3A82' }}>${item.total_amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Payments Record Table */}
            <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: '0 0 14px 0', color: '#1F2937' }}>
              Recorded Credits & Payments
            </h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFD', color: '#4B5563', borderBottom: '1px solid #E5E9F2', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: '700' }}>
                  <th style={{ padding: '12px 16px' }}>Method</th>
                  <th style={{ padding: '12px 16px' }}>Reference #</th>
                  <th style={{ padding: '12px 16px' }}>Notes</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Amount Paid</th>
                </tr>
              </thead>
              <tbody>
                {currentFolio.payments?.map(pay => (
                  <tr key={pay.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px', color: '#059669', fontWeight: '700', textTransform: 'capitalize' }}>
                      ✓ {pay.payment_method.replace('_', ' ')}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#6B7280' }}>{pay.transaction_ref || 'N/A'}</td>
                    <td style={{ padding: '12px 16px', color: '#6B7280' }}>{pay.notes || '-'}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '700', color: '#059669' }}>${pay.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right: Folio Balance & Settlement Card - Pure Warm White Container */}
          <div className="glass-card" style={{ padding: '26px', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '20px', borderBottom: '1px solid #E5E9F2', paddingBottom: '12px', color: '#1F2937' }}>
              Folio Settlement Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#4B5563' }}>
                <span>Gross Debits:</span>
                <span style={{ color: '#1F2937', fontWeight: '700' }}>${currentFolio.total_charges.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#4B5563' }}>
                <span>Total Credits:</span>
                <span style={{ color: '#059669', fontWeight: '700' }}>-${currentFolio.total_payments.toFixed(2)}</span>
              </div>
              <div style={{ borderTop: '1px solid #E5E9F2', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1F2937' }}>Balance Due:</span>
                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: currentFolio.balance_due > 0 ? '#DC2626' : '#059669' }}>
                  ${currentFolio.balance_due.toFixed(2)}
                </span>
              </div>
            </div>

            {currentFolio.balance_due > 0 ? (
              <button 
                onClick={() => setShowPaymentModal(true)} 
                className="btn-amber" 
                style={{ width: '100%', padding: '12px' }}
              >
                <CreditCard size={16} />
                <span>Process Settlement Payment</span>
              </button>
            ) : (
              <div style={{
                background: '#ECFDF5',
                border: '1px solid #6EE7B7',
                borderRadius: '8px',
                padding: '14px',
                textAlign: 'center',
                color: '#047857',
                fontSize: '0.9rem',
                fontWeight: '700'
              }}>
                ✓ Folio Fully Settled & Balanced
              </div>
            )}
          </div>
        </div>
      ) : (
        <p style={{ color: '#6B7280' }}>Select a reservation above to load its guest folio.</p>
      )}

      {/* Add Incidental Charge Modal */}
      {showAddCharge && (
        <div className="modal-overlay" onClick={() => setShowAddCharge(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div style={{ 
              padding: '20px 24px', 
              background: 'linear-gradient(90deg, #2D3A82 0%, #1E275E 100%)',
              color: '#FFFFFF',
              borderTopLeftRadius: '18px',
              borderTopRightRadius: '18px'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#FFFFFF', fontWeight: '800' }}>Post Incidental Charge</h3>
            </div>
            <form onSubmit={handleAddCharge} style={{ padding: '24px', background: '#FFFFFF' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#4B5563', marginBottom: '6px', fontWeight: '600' }}>Charge Description *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Aromatherapy Spa Session (60m)" 
                  className="input-dark"
                  value={chargeDesc}
                  onChange={(e) => setChargeDesc(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '22px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#4B5563', marginBottom: '6px', fontWeight: '600' }}>Category</label>
                  <select className="input-dark" value={chargeCategory} onChange={(e) => setChargeCategory(e.target.value)}>
                    <option value="spa">Spa & Wellness</option>
                    <option value="laundry">Laundry</option>
                    <option value="bar">Bar & Minibar</option>
                    <option value="activities">Resort Activities</option>
                    <option value="transport">Airport Transfer</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#4B5563', marginBottom: '6px', fontWeight: '600' }}>Amount ($) *</label>
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowAddCharge(false)} className="btn-ghost">Cancel</button>
                <button type="submit" className="btn-amber">Post to Folio</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Process Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div style={{ 
              padding: '20px 24px', 
              background: 'linear-gradient(90deg, #2D3A82 0%, #1E275E 100%)',
              color: '#FFFFFF',
              borderTopLeftRadius: '18px',
              borderTopRightRadius: '18px'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#FFFFFF', fontWeight: '800' }}>Receive Folio Payment</h3>
            </div>
            <form onSubmit={handleProcessPayment} style={{ padding: '24px', background: '#FFFFFF' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#4B5563', marginBottom: '6px', fontWeight: '600' }}>Amount to Collect ($) *</label>
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
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#4B5563', marginBottom: '6px', fontWeight: '600' }}>Payment Method</label>
                <select className="input-dark" value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                  <option value="credit_card">Credit / Debit Card (Stripe Terminal)</option>
                  <option value="cash">Cash Counter</option>
                  <option value="upi">UPI / Instant QR</option>
                  <option value="bank_transfer">Corporate Bank Transfer</option>
                </select>
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#4B5563', marginBottom: '6px', fontWeight: '600' }}>Card / Bank Reference</label>
                <input 
                  type="text" 
                  placeholder="e.g. AUTH-VISA-88219" 
                  className="input-dark"
                  value={payTxnRef}
                  onChange={(e) => setPayTxnRef(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowPaymentModal(false)} className="btn-ghost">Cancel</button>
                <button type="submit" className="btn-amber">Confirm & Settle</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
