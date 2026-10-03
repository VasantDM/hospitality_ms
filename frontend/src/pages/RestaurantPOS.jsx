import React, { useState, useEffect } from 'react';
import { 
  UtensilsCrossed, 
  Layers, 
  Clock, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle, 
  Sparkles, 
  Send, 
  Receipt,
  BedDouble,
  Coffee
} from 'lucide-react';
import { restaurantAPI, roomsAPI } from '../services/api';

export const RestaurantPOS = ({ setActiveTab }) => {
  const [tables, setTables] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [occupiedRooms, setOccupiedRooms] = useState([]);

  // POS State
  const [activeView, setActiveView] = useState('pos'); // pos or kitchen
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('dine_in'); // dine_in, room_service
  const [chargeToRoom, setChargeToRoom] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [loading, setLoading] = useState(true);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tRes, cRes, mRes, oRes, rRes] = await Promise.all([
        restaurantAPI.getTables(),
        restaurantAPI.getCategories(),
        restaurantAPI.getMenu(),
        restaurantAPI.getOrders(),
        roomsAPI.getRooms({ status: 'occupied' })
      ]);
      setTables(tRes.data);
      setCategories(cRes.data);
      setMenuItems(mRes.data);
      setOrders(oRes.data);
      setOccupiedRooms(rRes.data);

      if (tRes.data.length > 0 && !selectedTableId) {
        setSelectedTableId(tRes.data[0].id);
      }
      if (rRes.data.length > 0) {
        setSelectedRoomId(rRes.data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1, notes: '' }];
    });
  };

  const updateCartQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = subtotal + tax;

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setOrderSubmitting(true);
    setSuccessMessage(null);

    try {
      const payload = {
        order_type: orderType,
        table_id: orderType === 'dine_in' ? parseInt(selectedTableId) : null,
        room_id: chargeToRoom || orderType === 'room_service' ? parseInt(selectedRoomId) : null,
        waiter_name: 'Marco Rossi',
        items: cart.map(i => ({
          menu_item_id: i.id,
          quantity: i.quantity,
          notes: i.notes || null
        })),
        charge_to_room: chargeToRoom || orderType === 'room_service'
      };

      const res = await restaurantAPI.createOrder(payload);
      setCart([]);
      setSuccessMessage(
        chargeToRoom 
          ? `Order #${res.data.order_number} sent to Kitchen & $${total.toFixed(2)} charged to Room Folio!`
          : `Order #${res.data.order_number} sent to Kitchen & KOT generated!`
      );
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to place order');
    } finally {
      setOrderSubmitting(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await restaurantAPI.updateOrderStatus(orderId, status);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMenuItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(m => m.category_id === parseInt(selectedCategory));

  return (
    <div style={{ padding: '28px' }}>
      {/* Top Header & Mode Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Restaurant & Dining POS</h2>
          <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: '4px 0 0' }}>Table management, Kitchen Order Tickets (KOT), and room-folio billing</p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setActiveView('pos')} 
            className={activeView === 'pos' ? 'btn-gold' : 'btn-ghost'}
          >
            <UtensilsCrossed size={16} />
            <span>POS Register</span>
          </button>
          <button 
            onClick={() => setActiveView('kitchen')} 
            className={activeView === 'kitchen' ? 'btn-gold' : 'btn-ghost'}
          >
            <Layers size={16} />
            <span>Kitchen Display (KOT)</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '10px',
          padding: '12px 18px',
          color: '#34D399',
          marginBottom: '20px'
        }}>
          <CheckCircle size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {activeView === 'pos' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
          {/* Left: Table selector + Menu grid */}
          <div>
            {/* Table Selection Strip */}
            <div className="glass-card" style={{ padding: '16px', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.8rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700', display: 'block', marginBottom: '10px' }}>
                Select Table / Dining Zone
              </span>
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
                {tables.map(tbl => (
                  <button
                    key={tbl.id}
                    onClick={() => setSelectedTableId(tbl.id)}
                    style={{
                      background: selectedTableId === tbl.id ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      border: selectedTableId === tbl.id ? '1px solid #D4AF37' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '10px',
                      padding: '10px 16px',
                      minWidth: '100px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ fontWeight: '700', color: selectedTableId === tbl.id ? '#D4AF37' : '#F8FAFC' }}>
                      {tbl.table_number}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{tbl.zone.split(' ')[0]}</div>
                    <div style={{ fontSize: '0.68rem', color: tbl.status === 'occupied' ? '#38BDF8' : '#34D399', marginTop: '4px' }}>
                      ● {tbl.status}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Categories Filter */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto' }}>
              <button
                onClick={() => setSelectedCategory('All')}
                className={selectedCategory === 'All' ? 'btn-gold' : 'btn-ghost'}
                style={{ padding: '6px 14px', fontSize: '0.82rem' }}
              >
                All Items
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id.toString())}
                  className={selectedCategory === c.id.toString() ? 'btn-gold' : 'btn-ghost'}
                  style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Menu Items Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {filteredMenuItems.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="glass-card glass-card-interactive"
                  style={{ padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#F8FAFC', margin: 0 }}>
                        {item.name}
                      </h4>
                      {item.is_vegetarian && (
                        <span style={{ fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 5px', borderRadius: '4px' }}>
                          VEG
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#94A3B8', lineHeight: '1.3', marginBottom: '12px' }}>
                      {item.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '10px' }}>
                    <span style={{ fontWeight: '700', color: '#D4AF37', fontSize: '1.05rem' }}>
                      ${item.price.toFixed(2)}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {item.prep_time_minutes}m
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Cart & Order Summary */}
          <div className="glass-card" style={{ padding: '22px', height: 'fit-content', position: 'sticky', top: '90px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>Current Order</h3>
              <span className="badge badge-gold">{cart.reduce((a, b) => a + b.quantity, 0)} Items</span>
            </div>

            {/* Order Type Toggle */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
              <button 
                onClick={() => { setOrderType('dine_in'); setChargeToRoom(false); }}
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  border: orderType === 'dine_in' ? '1px solid #D4AF37' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: orderType === 'dine_in' ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
                  color: orderType === 'dine_in' ? '#D4AF37' : '#94A3B8',
                  cursor: 'pointer'
                }}
              >
                Table Dine-In
              </button>
              <button 
                onClick={() => { setOrderType('room_service'); setChargeToRoom(true); }}
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  border: orderType === 'room_service' ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: orderType === 'room_service' ? 'rgba(14, 165, 233, 0.2)' : 'transparent',
                  color: orderType === 'room_service' ? '#38BDF8' : '#94A3B8',
                  cursor: 'pointer'
                }}
              >
                Room Service
              </button>
            </div>

            {/* Room Folio Charge Option */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem', color: '#F8FAFC', marginBottom: chargeToRoom ? '10px' : '0' }}>
                <input 
                  type="checkbox" 
                  checked={chargeToRoom} 
                  onChange={(e) => setChargeToRoom(e.target.checked)} 
                />
                <span style={{ fontWeight: '600' }}>Charge to Master Room Folio</span>
              </label>

              {chargeToRoom && (
                <select 
                  className="input-dark" 
                  style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                >
                  {occupiedRooms.map(r => (
                    <option key={r.id} value={r.id}>
                      Room #{r.room_number} ({r.category?.name})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Cart Items List */}
            <div style={{ maxHeight: '240px', overflowY: 'auto', marginBottom: '16px' }}>
              {cart.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: '#64748B', textAlign: 'center', padding: '20px 0' }}>
                  No items added yet. Click menu cards to add.
                </p>
              ) : (
                cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#F8FAFC' }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#D4AF37' }}>${item.price.toFixed(2)} each</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button onClick={() => updateCartQty(item.id, -1)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#fff', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer' }}>-</button>
                      <span style={{ fontSize: '0.85rem', fontWeight: '700', minWidth: '18px', textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => updateCartQty(item.id, 1)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#fff', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer' }}>+</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculations */}
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#94A3B8', marginBottom: '4px' }}>
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#94A3B8', marginBottom: '8px' }}>
                <span>F&B Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '800', color: '#D4AF37' }}>
                <span>Total Due</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button 
              disabled={cart.length === 0 || orderSubmitting}
              onClick={handlePlaceOrder}
              className="btn-gold" 
              style={{ width: '100%', padding: '12px' }}
            >
              <Send size={16} />
              <span>{orderSubmitting ? 'Sending...' : 'Send Order to Kitchen'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Kitchen Order Ticket (KOT) Live View */
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px' }}>Live Kitchen Order Tickets (KOT)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {orders.map(ord => (
              <div key={ord.id} className="glass-card" style={{ padding: '20px', borderLeft: ord.status === 'in_kitchen' ? '4px solid #F59E0B' : ord.status === 'served' ? '4px solid #10B981' : '4px solid #38BDF8' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontWeight: '800', color: '#D4AF37' }}>{ord.order_number}</span>
                  <span className={`badge badge-${ord.status === 'in_kitchen' ? 'dirty' : ord.status === 'served' ? 'available' : 'occupied'}`}>
                    {ord.status.replace('_', ' ')}
                  </span>
                </div>

                <div style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: '14px' }}>
                  {ord.order_type.replace('_', ' ').toUpperCase()} • Waiter: {ord.waiter_name}
                  {ord.is_charged_to_room && <div style={{ color: '#38BDF8', fontWeight: '600' }}>✓ Charged to Room Folio</div>}
                </div>

                {/* Items */}
                <div style={{ marginBottom: '16px' }}>
                  {ord.items?.map(it => (
                    <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '4px 0', borderBottom: '1px dashed rgba(255,255,255,0.06)' }}>
                      <span>{it.quantity}x {it.menu_item?.name}</span>
                      <span style={{ color: '#D4AF37' }}>${(it.unit_price * it.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Status Switcher Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  {ord.status === 'in_kitchen' && (
                    <button onClick={() => handleUpdateOrderStatus(ord.id, 'preparing')} className="btn-ghost" style={{ flex: 1, fontSize: '0.78rem' }}>
                      Mark Preparing
                    </button>
                  )}
                  {ord.status === 'preparing' && (
                    <button onClick={() => handleUpdateOrderStatus(ord.id, 'served')} className="btn-emerald" style={{ flex: 1, fontSize: '0.78rem' }}>
                      Mark Served
                    </button>
                  )}
                  {ord.status === 'served' && (
                    <button onClick={() => handleUpdateOrderStatus(ord.id, 'paid')} className="btn-gold" style={{ flex: 1, fontSize: '0.78rem' }}>
                      Settle / Close
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
