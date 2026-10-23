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
        table_id: orderType === 'dine_in' ? selectedTableId : null,
        room_id: chargeToRoom && selectedRoomId ? parseInt(selectedRoomId) : null,
        order_type: orderType,
        is_charged_to_room: chargeToRoom,
        items: cart.map(i => ({
          menu_item_id: i.id,
          quantity: i.quantity,
          notes: i.notes || ''
        }))
      };

      await restaurantAPI.createOrder(payload);
      setSuccessMessage('Order sent directly to Kitchen and posted to Folio!');
      setCart([]);
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
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0, color: '#1F2937' }}>Restaurant & Dining POS</h2>
          <p style={{ fontSize: '0.86rem', color: '#6B7280', margin: '4px 0 0' }}>Table management, Kitchen Order Tickets (KOT), and room-folio billing</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setActiveView('pos')} 
            className={activeView === 'pos' ? 'btn-amber' : 'btn-ghost'}
          >
            <UtensilsCrossed size={16} />
            <span>POS Register</span>
          </button>
          <button 
            onClick={() => setActiveView('kitchen')} 
            className={activeView === 'kitchen' ? 'btn-amber' : 'btn-ghost'}
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
          background: '#ECFDF5',
          border: '1px solid #6EE7B7',
          borderRadius: '10px',
          padding: '14px 18px',
          color: '#047857',
          marginBottom: '20px',
          fontWeight: '600'
        }}>
          <CheckCircle size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {activeView === 'pos' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 390px', gap: '24px' }}>
          {/* Left: Table selector + Menu grid */}
          <div>
            {/* Table Selection Strip */}
            <div className="glass-card" style={{ padding: '18px', marginBottom: '22px' }}>
              <span style={{ fontSize: '0.8rem', color: '#2D3A82', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '800', display: 'block', marginBottom: '12px' }}>
                Select Table / Dining Zone
              </span>
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
                {tables.map(tbl => (
                  <button
                    key={tbl.id}
                    onClick={() => setSelectedTableId(tbl.id)}
                    style={{
                      background: selectedTableId === tbl.id ? '#2D3A82' : '#FFFFFF',
                      border: selectedTableId === tbl.id ? '1px solid #2D3A82' : '1px solid #E5E7EB',
                      borderRadius: '10px',
                      padding: '12px 18px',
                      minWidth: '105px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      boxShadow: selectedTableId === tbl.id ? '0 4px 12px rgba(45, 58, 130, 0.25)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontWeight: '800', fontSize: '1.05rem', color: selectedTableId === tbl.id ? '#FFFFFF' : '#1F2937' }}>
                      {tbl.table_number}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: selectedTableId === tbl.id ? '#CBD5E1' : '#6B7280' }}>{tbl.zone.split(' ')[0]}</div>
                    <div style={{ fontSize: '0.7rem', color: selectedTableId === tbl.id ? '#E29578' : tbl.status === 'occupied' ? '#2D3A82' : '#059669', marginTop: '4px', fontWeight: '700' }}>
                      ● {tbl.status}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Categories Filter */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '22px', overflowX: 'auto' }}>
              <button
                onClick={() => setSelectedCategory('All')}
                className={selectedCategory === 'All' ? 'btn-amber' : 'btn-ghost'}
                style={{ padding: '7px 16px', fontSize: '0.82rem' }}
              >
                All Items
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id.toString())}
                  className={selectedCategory === c.id.toString() ? 'btn-amber' : 'btn-ghost'}
                  style={{ padding: '7px 16px', fontSize: '0.82rem' }}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Menu Items Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '18px' }}>
              {filteredMenuItems.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="glass-card glass-card-interactive"
                  style={{ padding: '18px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h4 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#1F2937', margin: 0 }}>
                        {item.name}
                      </h4>
                      {item.is_vegetarian && (
                        <span style={{ fontSize: '0.65rem', background: '#ECFDF5', color: '#047857', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                          VEG
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#6B7280', lineHeight: '1.4', marginBottom: '14px' }}>
                      {item.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E5E9F2', paddingTop: '12px' }}>
                    <span style={{ fontWeight: '800', color: '#2D3A82', fontSize: '1.15rem' }}>
                      ${item.price.toFixed(2)}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} color="#E29578" /> {item.prep_time_minutes}m
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Cart & Order Summary - Pure Warm White Container */}
          <div className="glass-card" style={{ padding: '24px', height: 'fit-content', position: 'sticky', top: '90px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #E5E9F2', paddingBottom: '14px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: '#1F2937' }}>Current Order</h3>
              <span className="badge badge-amber">{cart.reduce((a, b) => a + b.quantity, 0)} Items</span>
            </div>

            {/* Order Type Toggle */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              <button 
                onClick={() => { setOrderType('dine_in'); setChargeToRoom(false); }}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  border: orderType === 'dine_in' ? '1px solid #2D3A82' : '1px solid #E5E7EB',
                  background: orderType === 'dine_in' ? '#2D3A82' : '#FFFFFF',
                  color: orderType === 'dine_in' ? '#FFFFFF' : '#4B5563',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Table Dine-In
              </button>
              <button 
                onClick={() => { setOrderType('room_service'); setChargeToRoom(true); }}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  border: orderType === 'room_service' ? '1px solid #E29578' : '1px solid #E5E7EB',
                  background: orderType === 'room_service' ? '#E29578' : '#FFFFFF',
                  color: orderType === 'room_service' ? '#FFFFFF' : '#4B5563',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Room Service
              </button>
            </div>

            {/* Room Folio Charge Option */}
            <div style={{
              background: '#F8FAFD',
              border: '1px solid #E5E9F2',
              borderRadius: '8px',
              padding: '14px',
              marginBottom: '18px'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.84rem', color: '#1F2937', marginBottom: chargeToRoom ? '10px' : '0' }}>
                <input 
                  type="checkbox" 
                  checked={chargeToRoom} 
                  onChange={(e) => setChargeToRoom(e.target.checked)} 
                />
                <span style={{ fontWeight: '700', color: '#2D3A82' }}>Charge to Master Room Folio</span>
              </label>

              {chargeToRoom && (
                <select 
                  className="input-dark" 
                  style={{ fontSize: '0.82rem', padding: '8px 12px' }}
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
            <div style={{ maxHeight: '240px', overflowY: 'auto', marginBottom: '18px' }}>
              {cart.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: '#6B7280', textAlign: 'center', padding: '24px 0' }}>
                  No items added yet. Click menu cards to add.
                </p>
              ) : (
                cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#1F2937' }}>{item.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#E29578', fontWeight: '600' }}>${item.price.toFixed(2)} each</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button onClick={() => updateCartQty(item.id, -1)} style={{ background: '#F3F4F6', border: '1px solid #D1D5DB', color: '#1F2937', width: '26px', height: '26px', borderRadius: '4px', cursor: 'pointer', fontWeight: '700' }}>-</button>
                      <span style={{ fontSize: '0.88rem', fontWeight: '800', minWidth: '20px', textAlign: 'center', color: '#1F2937' }}>{item.quantity}</span>
                      <button onClick={() => updateCartQty(item.id, 1)} style={{ background: '#F3F4F6', border: '1px solid #D1D5DB', color: '#1F2937', width: '26px', height: '26px', borderRadius: '4px', cursor: 'pointer', fontWeight: '700' }}>+</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculations */}
            <div style={{ borderTop: '1px solid #E5E9F2', paddingTop: '14px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#4B5563', marginBottom: '5px' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: '600', color: '#1F2937' }}>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#4B5563', marginBottom: '8px' }}>
                <span>F&B Tax (8%)</span>
                <span style={{ fontWeight: '600', color: '#1F2937' }}>${tax.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '800', color: '#2D3A82', borderTop: '1px solid #E5E9F2', paddingTop: '8px' }}>
                <span>Total Due</span>
                <span style={{ color: '#E29578' }}>${total.toFixed(2)}</span>
              </div>
            </div>

            <button 
              disabled={cart.length === 0 || orderSubmitting}
              onClick={handlePlaceOrder}
              className="btn-amber" 
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
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '18px', color: '#1F2937' }}>Live Kitchen Order Tickets (KOT)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '22px' }}>
            {orders.map(ord => (
              <div key={ord.id} className="glass-card" style={{ padding: '22px', borderLeft: ord.status === 'in_kitchen' ? '4px solid #F59E0B' : ord.status === 'served' ? '4px solid #10B981' : '4px solid #2D3A82' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontWeight: '800', color: '#2D3A82', fontSize: '1.1rem' }}>{ord.order_number}</span>
                  <span className={`badge badge-${ord.status === 'in_kitchen' ? 'dirty' : ord.status === 'served' ? 'available' : 'occupied'}`}>
                    {ord.status.replace('_', ' ')}
                  </span>
                </div>

                <div style={{ fontSize: '0.82rem', color: '#6B7280', marginBottom: '14px' }}>
                  {ord.order_type.replace('_', ' ').toUpperCase()} • Waiter: {ord.waiter_name}
                  {ord.is_charged_to_room && <div style={{ color: '#2D3A82', fontWeight: '700', marginTop: '2px' }}>✓ Charged to Room Folio</div>}
                </div>

                {/* Items */}
                <div style={{ marginBottom: '18px' }}>
                  {ord.items?.map(it => (
                    <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', padding: '6px 0', borderBottom: '1px dashed #E5E9F2' }}>
                      <span style={{ color: '#1F2937', fontWeight: '600' }}>{it.quantity}x {it.menu_item?.name}</span>
                      <span style={{ color: '#E29578', fontWeight: '700' }}>${(it.unit_price * it.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Status Switcher Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  {ord.status === 'in_kitchen' && (
                    <button onClick={() => handleUpdateOrderStatus(ord.id, 'preparing')} className="btn-ghost" style={{ flex: 1, fontSize: '0.8rem' }}>
                      Mark Preparing
                    </button>
                  )}
                  {ord.status === 'preparing' && (
                    <button onClick={() => handleUpdateOrderStatus(ord.id, 'served')} className="btn-emerald" style={{ flex: 1, fontSize: '0.8rem' }}>
                      Mark Served
                    </button>
                  )}
                  {ord.status === 'served' && (
                    <button onClick={() => handleUpdateOrderStatus(ord.id, 'paid')} className="btn-amber" style={{ flex: 1, fontSize: '0.8rem' }}>
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
