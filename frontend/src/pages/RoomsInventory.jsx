import React, { useState, useEffect } from 'react';
import { BedDouble, Plus, Sparkles, Check, DollarSign, Users, Home } from 'lucide-react';
import { roomsAPI } from '../services/api';

export const RoomsInventory = () => {
  const [categories, setCategories] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newFloor, setNewFloor] = useState(1);
  const [newZone, setNewZone] = useState('Beachfront Wing');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cats, rms] = await Promise.all([
        roomsAPI.getCategories(),
        roomsAPI.getRooms()
      ]);
      setCategories(cats.data);
      setRooms(rms.data);
      if (cats.data.length > 0) setSelectedCategoryId(cats.data[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      await roomsAPI.createRoom({
        room_number: newRoomNumber,
        floor: parseInt(newFloor),
        zone: newZone,
        category_id: parseInt(selectedCategoryId),
        status: 'available',
        clean_status: 'clean'
      });
      setShowAddModal(false);
      setNewRoomNumber('');
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to add room');
    }
  };

  return (
    <div style={{ padding: '28px' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0, color: '#1F2937' }}>Room Categories & Inventory</h2>
          <p style={{ fontSize: '0.86rem', color: '#6B7280', margin: '4px 0 0' }}>Manage luxury resort tiers, dynamic tariffs, and room units</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-amber">
          <Plus size={16} />
          <span>Add New Room Unit</span>
        </button>
      </div>

      {/* Category Cards - Pure Warm White Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {categories.map((cat) => {
          const categoryRooms = rooms.filter(r => r.category_id === cat.id);
          const availableCount = categoryRooms.filter(r => r.status === 'available').length;

          return (
            <div key={cat.id} className="glass-card glass-card-interactive" style={{ overflow: 'hidden' }}>
              {/* Category Cover Image */}
              <div style={{ height: '170px', position: 'relative', overflow: 'hidden' }}>
                <img 
                  src={cat.image_url || "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"} 
                  alt={cat.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: '#FFFFFF',
                  padding: '5px 12px',
                  borderRadius: '999px',
                  color: '#2D3A82',
                  fontWeight: '800',
                  fontSize: '0.88rem',
                  border: '1px solid #E29578',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.12)'
                }}>
                  ${cat.base_price} <span style={{ fontSize: '0.74rem', color: '#6B7280', fontWeight: '500' }}>/ night</span>
                </div>
              </div>

              {/* Details */}
              <div style={{ padding: '22px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 8px 0', color: '#1F2937' }}>
                  {cat.name}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#4B5563', lineHeight: '1.5', marginBottom: '16px' }}>
                  {cat.description}
                </p>

                {/* Capacity & Bed info */}
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.82rem', color: '#2D3A82', marginBottom: '16px', fontWeight: '600' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={15} color="#2D3A82" />
                    Max: {cat.capacity_adults} Adults, {cat.capacity_children} Children
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BedDouble size={15} color="#2D3A82" />
                    {cat.bed_type}
                  </span>
                </div>

                {/* Amenities pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
                  {cat.amenities?.split(',').map((am, idx) => (
                    <span 
                      key={idx}
                      style={{
                        background: '#F4F6FB',
                        border: '1px solid #E5E9F2',
                        borderRadius: '6px',
                        padding: '4px 9px',
                        fontSize: '0.74rem',
                        color: '#4B5563',
                        fontWeight: '500'
                      }}
                    >
                      {am.trim()}
                    </span>
                  ))}
                </div>

                {/* Total Units assigned */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  borderTop: '1px solid #E5E9F2', 
                  paddingTop: '14px',
                  fontSize: '0.86rem'
                }}>
                  <span style={{ color: '#6B7280', fontWeight: '500' }}>Property Inventory:</span>
                  <span style={{ fontWeight: '800', color: '#2D3A82' }}>
                    {availableCount} Available / {categoryRooms.length} Total
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Room Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ 
              padding: '20px 24px', 
              background: 'linear-gradient(90deg, #2D3A82 0%, #1E275E 100%)',
              color: '#FFFFFF',
              borderTopLeftRadius: '18px',
              borderTopRightRadius: '18px'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#FFFFFF', fontWeight: '800' }}>Add New Physical Unit</h3>
            </div>
            <form onSubmit={handleAddRoom} style={{ padding: '24px', background: '#FFFFFF' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#4B5563', marginBottom: '6px', fontWeight: '600' }}>Room / Villa Number *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. 501 or V-04" 
                  className="input-dark"
                  value={newRoomNumber}
                  onChange={(e) => setNewRoomNumber(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#4B5563', marginBottom: '6px', fontWeight: '600' }}>Floor Level</label>
                  <input 
                    type="number" 
                    min="1" 
                    className="input-dark"
                    value={newFloor}
                    onChange={(e) => setNewFloor(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#4B5563', marginBottom: '6px', fontWeight: '600' }}>Resort Wing / Zone</label>
                  <select className="input-dark" value={newZone} onChange={(e) => setNewZone(e.target.value)}>
                    <option value="Beachfront Wing">Beachfront Wing</option>
                    <option value="Hilltop Villas">Hilltop Villas</option>
                    <option value="Main Resort Wing">Main Resort Wing</option>
                    <option value="Skyline Tower">Skyline Tower</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#4B5563', marginBottom: '6px', fontWeight: '600' }}>Room Category *</label>
                <select className="input-dark" value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)}>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name} (${c.base_price}/night)</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-ghost">Cancel</button>
                <button type="submit" className="btn-amber">Create Unit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
