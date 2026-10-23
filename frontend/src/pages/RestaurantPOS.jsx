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
import { useToast } from '../context/ToastContext';

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

  const toast = useToast();

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
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    toast.info(`Added ${item.name} to order`);
  };

  const updateCartQty = (id, delta) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = i.quantity + delta;
        return newQty > 0 ? { ...i, quantity: newQty } : null;
      }
      return i;
    }).filter(Boolean));
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setOrderSubmitting(true);

    try {
      const payload = {
        order_type: orderType,
        table_id: orderType === 'dine_in' ? selectedTableId : null,
        room_id: chargeToRoom ? selectedRoomId : null,
        charge_to_room: chargeToRoom,
        waiter_name: 'Marco Rossi',
        items: cart.map(i => ({
          menu_item_id: i.id,
          quantity: i.quantity,
          notes: ''
        }))
      };

      const res = await restaurantAPI.createOrder(payload);
      toast.success(`Order ${res.data.order_number} sent to Kitchen!`);
      setCart([]);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to place order');
    } finally {
      setOrderSubmitting(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await restaurantAPI.updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      loadData();
    } catch (err) {
      toast.error('Failed to update order status');
    }
  };

  const subtotal = cart.reduce((acc, it) => acc + (it.price * it.quantity), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const filteredMenuItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(m => m.category === parseInt(selectedCategory));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0, color: '#0F172A' }}>
            Restaurant & Lounge POS
          </h2>
          <p style={{ fontSize: '0.86rem', color: '#64748B', margin: '4px 0 0' }}>
            Table service, digital KOT tickets, and automatic Master Folio charge routing
          </p>
        </div>

        {/* View Switcher: POS vs KOT Kitchen Display */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setActiveView('pos')}
            className={activeView === 'pos' ? "btn-teal" : "btn-ghost"}
            style={{ padding: '8px 18px', fontSize: '0.86rem' }}
          >
            <UtensilsCrossed size={16} />
            <span>Dining Point of Sale</span>
          </button>
          <button 
            onClick={() => setActiveView('kitchen')}
            className={activeView === 'kitchen' ? "btn-teal" : "btn-ghost"}
            style={{ padding: '8px 18px', fontSize: '0.86rem' }}
          >
            <Clock size={16} />
            <span>KOT Kitchen Queue ({orders.filter(o => o.status === 'in_kitchen' || o.status === 'preparing').length})</span>
          </button>
        </div>
      </div>

      {activeView === 'pos' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px' }}>
          
          {/* Left: Table Map & Menu Browser */}
          <div>
            {/* Dining Table Strip */}
            <div className="white-card" style={{ padding: '18px 22px', marginBottom: '22px' }}>
              <span style={{ fontSize: '0.74rem', color: '#0891B2', fontWeight: '800', textTransform: 'uppercase', marginBottom: '10px', display: 'block' }}>
                Select Active Dining Table
              </span>
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
                {tables.map(tbl => (
                  <button
                    key={tbl.id}
                    onClick={() => setSelectedTableId(tbl.id)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: selectedTableId === tbl.id ? '2px solid #0891B2' : '1px solid #E2EFF3',
                      background: selectedTableId === tbl.id ? '#E2F4F7' : '#FFFFFF',
                      minWidth: '105px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      boxShadow: selectedTableId === tbl.id ? '0 4px 12px rgba(8, 145, 178, 0.2)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontWeight: '800', fontSize: '1.05rem', color: selectedTableId === tbl.id ? '#0891B2' : '#0F172A' }}>
                      {tbl.table_number}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748B' }}>{tbl.zone.split(' ')[0]}</div>
                    <div style={{ fontSize: '0.7rem', color: tbl.status === 'occupied' ? '#F97316' : '#10B981', marginTop: '4px', fontWeight: '700' }}>
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
                className={selectedCategory === 'All' ? 'btn-teal' : 'btn-ghost'}
                style={{ padding: '7px 16px', fontSize: '0.82rem' }}
              >
                All Items
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id.toString())}
                  className={selectedCategory === c.id.toString() ? 'btn-teal' : 'btn-ghost'}
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
                  className="white-card"
                  style={{ padding: '18px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h4 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                        {item.name}
                      </h4>
                      {item.is_vegetarian && (
                        <span style={{ fontSize: '0.65rem', background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                          VEG
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: '1.4', marginBottom: '14px' }}>
                      {item.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2EFF3', paddingTop: '12px' }}>
                    <span style={{ fontWeight: '800', color: '#0891B2', fontSize: '1.15rem' }}>
                      ${item.price.toFixed(2)}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} color="#F97316" /> {item.prep_time_minutes}m
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Cart & Order Summary */}
          <div className="white-card" style={{ padding: '24px', height: 'fit-content', position: 'sticky', top: '90px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #E2EFF3', paddingBottom: '14px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: '#0F172A' }}>Current Order</h3>
              <span className="badge-teal">{cart.reduce((a, b) => a + b.quantity, 0)} Items</span>
            </div>

            {/* Order Type Toggle */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              <button 
                onClick={() => { setOrderType('dine_in'); setChargeToRoom(false); }}
                style={{
                  padding: '10px',
                  borderRadius: '999px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  border: orderType === 'dine_in' ? '1px solid #0891B2' : '1px solid #E2EFF3',
                  background: orderType === 'dine_in' ? '#0891B2' : '#FFFFFF',
                  color: orderType === 'dine_in' ? '#FFFFFF' : '#475569',
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
                  borderRadius: '999px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  border: orderType === 'room_service' ? '1px solid #F97316' : '1px solid #E2EFF3',
                  background: orderType === 'room_service' ? '#F97316' : '#FFFFFF',
                  color: orderType === 'room_service' ? '#FFFFFF' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Room Service
              </button>
            </div>

            {/* Room Folio Charge Option */}
            <div style={{
              background: '#F8FDFF',
              border: '1px solid #E2EFF3',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '18px'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.84rem', color: '#0F172A', marginBottom: chargeToRoom ? '10px' : '0' }}>
                <input 
                  type="checkbox" 
                  checked={chargeToRoom} 
                  onChange={(e) => setChargeToRoom(e.target.checked)} 
                />
                <span style={{ fontWeight: '700', color: '#0891B2' }}>Charge to Master Room Folio</span>
              </label>

              {chargeToRoom && (
                <select 
                  className="input-clean" 
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
                <p style={{ fontSize: '0.85rem', color: '#64748B', textAlign: 'center', padding: '24px 0' }}>
                  No items added yet. Click menu cards to add.
                </p>
              ) : (
                cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F1F8FA' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0F172A' }}>{item.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#0891B2', fontWeight: '700' }}>${item.price.toFixed(2)} each</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button onClick={() => updateCartQty(item.id, -1)} style={{ background: '#F1F8FA', border: '1px solid #E2EFF3', color: '#0F172A', width: '26px', height: '26px', borderRadius: '4px', cursor: 'pointer', fontWeight: '700' }}>-</button>
                      <span style={{ fontSize: '0.88rem', fontWeight: '800', minWidth: '20px', textAlign: 'center', color: '#0F172A' }}>{item.quantity}</span>
                      <button onClick={() => updateCartQty(item.id, 1)} style={{ background: '#F1F8FA', border: '1px solid #E2EFF3', color: '#0F172A', width: '26px', height: '26px', borderRadius: '4px', cursor: 'pointer', fontWeight: '700' }}>+</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculations */}
            <div style={{ borderTop: '1px solid #E2EFF3', paddingTop: '14px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748B', marginBottom: '5px' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: '600', color: '#0F172A' }}>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748B', marginBottom: '8px' }}>
                <span>F&B Tax (8%)</span>
                <span style={{ fontWeight: '600', color: '#0F172A' }}>${tax.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '800', color: '#0891B2', borderTop: '1px solid #E2EFF3', paddingTop: '8px' }}>
                <span>Total Due</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button 
              disabled={cart.length === 0 || orderSubmitting}
              onClick={handlePlaceOrder}
              className="btn-teal" 
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
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '18px', color: '#0F172A' }}>Live Kitchen Order Tickets (KOT)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '22px' }}>
            {orders.map(ord => (
              <div key={ord.id} className="white-card" style={{ padding: '22px', borderLeft: ord.status === 'in_kitchen' ? '4px solid #F97316' : ord.status === 'served' ? '4px solid #10B981' : '4px solid #0891B2' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontWeight: '800', color: '#0891B2', fontSize: '1.1rem' }}>{ord.order_number}</span>
                  <span className={ord.status === 'served' ? 'badge-teal' : 'badge-amber'}>
                    {ord.status.replace('_', ' ')}
                  </span>
                </div>

                <div style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '14px' }}>
                  {ord.order_type.replace('_', ' ').toUpperCase()} • Waiter: {ord.waiter_name}
                  {ord.is_charged_to_room && <div style={{ color: '#0891B2', fontWeight: '700', marginTop: '2px' }}>✓ Charged to Room Folio</div>}
                </div>

                {/* Items */}
                <div style={{ marginBottom: '18px' }}>
                  {ord.items?.map(it => (
                    <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', padding: '6px 0', borderBottom: '1px dashed #E2EFF3' }}>
                      <span style={{ color: '#0F172A', fontWeight: '600' }}>{it.quantity}x {it.menu_item?.name}</span>
                      <span style={{ color: '#0891B2', fontWeight: '700' }}>${(it.unit_price * it.quantity).toFixed(2)}</span>
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
                    <button onClick={() => handleUpdateOrderStatus(ord.id, 'served')} style={{ flex: 1, fontSize: '0.8rem', background: '#10B981', color: '#FFFFFF', border: 'none', borderRadius: '999px', padding: '7px 12px', fontWeight: '700', cursor: 'pointer' }}>
                      Mark Served
                    </button>
                  )}
                  {ord.status === 'served' && (
                    <button onClick={() => handleUpdateOrderStatus(ord.id, 'paid')} className="btn-teal" style={{ flex: 1, fontSize: '0.8rem' }}>
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
