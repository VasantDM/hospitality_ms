import React, { useState, useEffect } from 'react';
import { BedDouble, Plus, Sparkles, Check, DollarSign, Users, Home, X } from 'lucide-react';
import { roomsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

export const RoomsInventory = () => {
  const [categories, setCategories] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newFloor, setNewFloor] = useState(1);
  const [newZone, setNewZone] = useState('Beachfront Wing');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [loading, setLoading] = useState(true);

  const toast = useToast();

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
      toast.success(`Unit #${newRoomNumber} added to inventory!`);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add room');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0, color: '#0F172A' }}>
            Room Categories & Inventory
          </h2>
          <p style={{ fontSize: '0.86rem', color: '#64748B', margin: '4px 0 0' }}>
            Configure resort suites, villa tiers, base rates, and physical room numbers
          </p>
        </div>

        <button onClick={() => setShowAddModal(true)} className="btn-teal">
          <Plus size={16} />
          <span>Add Physical Room Unit</span>
        </button>
      </div>

      {/* Categories Showcase */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '22px' }}>
        {categories.map((cat) => {
          const categoryRooms = rooms.filter(r => r.category_id === cat.id);
          const availableCount = categoryRooms.filter(r => r.status === 'available').length;

          return (
            <div key={cat.id} className="white-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', height: '190px' }}>
                <img 
                  src={cat.image_url || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'} 
                  alt={cat.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  top: '14px',
                  right: '14px',
                  background: 'rgba(15, 23, 42, 0.75)',
                  backdropFilter: 'blur(8px)',
                  color: '#FFFFFF',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  fontSize: '0.74rem',
                  fontWeight: '700'
                }}>
                  {availableCount} / {categoryRooms.length} Available
                </div>
              </div>

              <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                    {cat.name}
                  </h3>
                  <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0891B2' }}>
                    ${cat.base_price}
                    <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '500' }}> / nt</span>
                  </span>
                </div>

                <p style={{ fontSize: '0.84rem', color: '#64748B', lineHeight: '1.4', marginBottom: '14px' }}>
                  {cat.description}
                </p>

                <div style={{ display: 'flex', gap: '14px', fontSize: '0.82rem', color: '#475569', marginBottom: '16px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <BedDouble size={14} color="#0891B2" /> {cat.bed_type}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Users size={14} color="#0891B2" /> Max {cat.capacity_adults} Adults
                  </span>
                </div>

                {/* Allocated Room Chips */}
                <div style={{ marginTop: 'auto', borderTop: '1px solid #E2EFF3', paddingTop: '14px' }}>
                  <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                    Allocated Physical Units:
                  </span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {categoryRooms.map(r => (
                      <span 
                        key={r.id}
                        style={{
                          background: r.status === 'available' ? '#ECFDF5' : r.status === 'occupied' ? '#E0F2FE' : '#FFF7ED',
                          color: r.status === 'available' ? '#059669' : r.status === 'occupied' ? '#0369A1' : '#C2410C',
                          border: '1px solid currentColor',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.74rem',
                          fontWeight: '700'
                        }}
                      >
                        #{r.room_number}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Room Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="white-card" style={{ width: '100%', maxWidth: '460px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0F172A', fontWeight: '800' }}>Add Physical Room Unit</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddRoom} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#0F172A', marginBottom: '6px', fontWeight: '700' }}>Room / Villa Number *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. 501 or V-12" 
                  className="input-clean"
                  value={newRoomNumber}
                  onChange={(e) => setNewRoomNumber(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#0F172A', marginBottom: '6px', fontWeight: '700' }}>Floor Level</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="50" 
                    className="input-clean"
                    value={newFloor}
                    onChange={(e) => setNewFloor(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#0F172A', marginBottom: '6px', fontWeight: '700' }}>Resort Wing / Zone</label>
                  <select className="input-clean" value={newZone} onChange={(e) => setNewZone(e.target.value)}>
                    <option value="Beachfront Wing">Beachfront Wing</option>
                    <option value="Hilltop Villas">Hilltop Villas</option>
                    <option value="Main Resort Wing">Main Resort Wing</option>
                    <option value="Skyline Tower">Skyline Tower</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#0F172A', marginBottom: '6px', fontWeight: '700' }}>Room Category *</label>
                <select className="input-clean" value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)}>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name} (${c.base_price}/night)</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-ghost">Cancel</button>
                <button type="submit" className="btn-teal">Create Unit</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
