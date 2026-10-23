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
  FileText,
  QrCode,
  X
} from 'lucide-react';
import { foliosAPI, reservationsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

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
  const [payMethod, setPayMethod] = useState('upi'); // 'upi' | 'credit_card' | 'cash'
  const [payTxnRef, setPayTxnRef] = useState('');

  const toast = useToast();

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
      toast.success('Incidental charge posted to Folio');
      loadFolio(selectedResId);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to post charge');
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
      toast.success(`Payment of $${payAmount} recorded successfully!`);
      loadFolio(selectedResId);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Payment failed');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const activeRes = reservations.find(r => r.id === parseInt(selectedResId));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* Top Controls Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0, color: '#0F172A' }}>
            Master Folio & Invoicing
          </h2>
          <p style={{ fontSize: '0.86rem', color: '#64748B', margin: '4px 0 0' }}>
            Central guest financial ledger, room/restaurant itemization, and tax invoice
          </p>
        </div>

        {/* Reservation Selector */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select 
            className="input-clean"
            style={{ width: '310px', height: '42px', fontSize: '0.85rem' }}
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px' }}>
          
          {/* Left: Folio Itemized Statement */}
          <div className="white-card" style={{ padding: '28px' }}>
            
            {/* Invoice Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2EFF3', paddingBottom: '22px', marginBottom: '22px' }}>
              <div>
                <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0891B2' }}>
                  GRAND VISTA RESORT & SPA
                </span>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0' }}>
                  100 Ocean Crest Blvd, Paradise Coast • Tax ID / GSTIN: 29AAAAA0000A1Z5
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>
                  FOLIO #{currentFolio.id}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#0891B2', fontWeight: '700' }}>
                  Booking: {activeRes.booking_code}
                </div>
                <span className={currentFolio.status === 'settled' ? "badge-teal" : "badge-amber"} style={{ marginTop: '6px', display: 'inline-block' }}>
                  {currentFolio.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Guest Summary Banner */}
            <div style={{
              background: '#F8FDFF',
              border: '1px solid #E2EFF3',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '22px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '14px',
              fontSize: '0.84rem'
            }}>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: '700' }}>Guest Name:</span>
                <strong style={{ color: '#0F172A' }}>{activeRes.guest?.first_name} {activeRes.guest?.last_name}</strong>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: '700' }}>Stay Period:</span>
                <strong style={{ color: '#0F172A' }}>{activeRes.check_in_date} to {activeRes.check_out_date}</strong>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: '700' }}>ID / Passport:</span>
                <strong style={{ color: '#0F172A' }}>{activeRes.guest?.id_proof_number || 'US98320491'}</strong>
              </div>
            </div>

            {/* Charges Table */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: 0, color: '#0F172A' }}>
                Itemized Debits & Charges
              </h4>
              <button onClick={() => setShowAddCharge(true)} className="btn-ghost" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
                <Plus size={14} color="#0891B2" /> <span>Add Incidentals</span>
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem', marginBottom: '28px' }}>
              <thead>
                <tr style={{ background: '#F8FDFF', color: '#475569', borderBottom: '1px solid #E2EFF3', fontSize: '0.76rem', textTransform: 'uppercase', fontWeight: '700' }}>
                  <th style={{ padding: '12px 16px' }}>Description</th>
                  <th style={{ padding: '12px 16px' }}>Category</th>
                  <th style={{ padding: '12px 16px' }}>Qty</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {currentFolio.items?.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #F1F8FA' }}>
                    <td style={{ padding: '14px 16px', color: '#0F172A', fontWeight: '600' }}>{item.description}</td>
                    <td style={{ padding: '14px 16px', color: '#64748B', textTransform: 'capitalize' }}>{item.category.replace('_', ' ')}</td>
                    <td style={{ padding: '14px 16px', color: '#64748B' }}>{item.quantity}</td>
                    <td style={{ padding: '14px 16px', color: '#0F172A', fontWeight: '700', textAlign: 'right' }}>
                      ${item.total_amount?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Payments Table */}
            <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: '0 0 14px 0', color: '#0F172A' }}>
              Recorded Credits & Payments
            </h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#F8FDFF', color: '#475569', borderBottom: '1px solid #E2EFF3', fontSize: '0.76rem', textTransform: 'uppercase', fontWeight: '700' }}>
                  <th style={{ padding: '12px 16px' }}>Date</th>
                  <th style={{ padding: '12px 16px' }}>Method</th>
                  <th style={{ padding: '12px 16px' }}>Transaction Ref</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Amount Paid</th>
                </tr>
              </thead>
              <tbody>
                {currentFolio.payments?.length > 0 ? (
                  currentFolio.payments.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #F1F8FA' }}>
                      <td style={{ padding: '12px 16px', color: '#64748B' }}>{new Date(p.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 16px', color: '#0F172A', fontWeight: '600', textTransform: 'capitalize' }}>
                        {p.payment_method?.replace('_', ' ')}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748B' }}>{p.transaction_ref}</td>
                      <td style={{ padding: '12px 16px', color: '#10B981', fontWeight: '700', textAlign: 'right' }}>
                        -${p.amount?.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ padding: '16px', textAlign: 'center', color: '#94A3B8' }}>
                      No payments recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

          </div>

          {/* Right: Balance Due & Settlement Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="white-card" style={{ padding: '26px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: '0 0 18px 0', color: '#0F172A' }}>
                Folio Settlement Summary
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Total Debits (Gross):</span>
                  <strong style={{ color: '#0F172A' }}>${currentFolio.total_charges?.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Total Credits Paid:</span>
                  <strong style={{ color: '#10B981' }}>-${currentFolio.total_payments?.toFixed(2)}</strong>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '14px',
                  borderTop: '1px solid #E2EFF3',
                  fontSize: '1.25rem',
                  fontWeight: '800'
                }}>
                  <span style={{ color: '#0F172A' }}>Balance Due:</span>
                  <span style={{ color: currentFolio.balance_due > 0 ? '#F97316' : '#10B981' }}>
                    ${currentFolio.balance_due?.toFixed(2)}
                  </span>
                </div>
              </div>

              {currentFolio.balance_due > 0 ? (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="btn-teal"
                  style={{ width: '100%', padding: '12px', fontSize: '0.92rem' }}
                >
                  <DollarSign size={16} /> <span>Settle Balance (${currentFolio.balance_due.toFixed(2)})</span>
                </button>
              ) : (
                <div style={{
                  padding: '12px',
                  background: '#ECFDF5',
                  color: '#059669',
                  borderRadius: '10px',
                  textAlign: 'center',
                  fontSize: '0.86rem',
                  fontWeight: '700'
                }}>
                  ✓ Folio Fully Settled & Balanced
                </div>
              )}
            </div>

            {/* Quick UPI QR Card */}
            {currentFolio.balance_due > 0 && (
              <div className="white-card" style={{ padding: '20px', textAlign: 'center' }}>
                <span className="badge-teal" style={{ marginBottom: '8px', display: 'inline-block' }}>
                  Instant Guest Desk Payment
                </span>
                <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0 0 12px 0' }}>
                  Scan dynamic UPI QR Code to settle folio balance
                </p>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=upi://pay?pa=grandvista@upi%26am=${currentFolio.balance_due.toFixed(2)}%26cu=USD`}
                  alt="UPI QR Code" 
                  style={{ width: '130px', height: '130px', margin: '0 auto 8px', borderRadius: '8px', border: '1px solid #E2EFF3' }}
                />
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0891B2' }}>
                  ${currentFolio.balance_due.toFixed(2)} USD
                </div>
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="white-card" style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>
          Select a guest reservation above to inspect their Master Folio.
        </div>
      )}

      {/* Add Charge Modal */}
      {showAddCharge && (
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
          <div className="white-card" style={{ width: '420px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: '0 0 16px 0', color: '#0F172A' }}>
              Add Incidental Charge
            </h3>
            <form onSubmit={handleAddCharge} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  Charge Description *
                </label>
                <input 
                  type="text" 
                  required
                  className="input-clean"
                  placeholder="e.g. Deep Tissue Couple Spa Massage"
                  value={chargeDesc}
                  onChange={(e) => setChargeDesc(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  Category *
                </label>
                <select 
                  className="input-clean"
                  value={chargeCategory}
                  onChange={(e) => setChargeCategory(e.target.value)}
                >
                  <option value="spa">Spa & Wellness</option>
                  <option value="restaurant">Dining & Room Service</option>
                  <option value="activities">Resort Activities / Excursions</option>
                  <option value="laundry">Dry Cleaning & Laundry</option>
                  <option value="minibar">In-Suite Mini Bar</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  Amount ($) *
                </label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  className="input-clean"
                  placeholder="e.g. 150.00"
                  value={chargeAmount}
                  onChange={(e) => setChargeAmount(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddCharge(false)} className="btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn-teal">
                  Post Charge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Process Payment Modal */}
      {showPaymentModal && (
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
          <div className="white-card" style={{ width: '420px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: '0 0 16px 0', color: '#0F172A' }}>
              Record Folio Settlement
            </h3>
            <form onSubmit={handleProcessPayment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  Settlement Amount ($) *
                </label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  className="input-clean"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  Payment Method *
                </label>
                <select 
                  className="input-clean"
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                >
                  <option value="upi">UPI / Instant QR</option>
                  <option value="credit_card">Credit / Debit Card</option>
                  <option value="cash">Cash at Desk</option>
                  <option value="bank_transfer">Corporate Wire Transfer</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  Reference Number (Optional)
                </label>
                <input 
                  type="text" 
                  className="input-clean"
                  placeholder="e.g. CARD-AUTH-83921"
                  value={payTxnRef}
                  onChange={(e) => setPayTxnRef(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowPaymentModal(false)} className="btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn-teal">
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
