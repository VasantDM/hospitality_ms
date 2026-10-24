import React, { useState, useEffect } from 'react';
import { 
  BedDouble, 
  Plus, 
  Sparkles, 
  Check, 
  DollarSign, 
  Users, 
  Home, 
  X, 
  Image as ImageIcon, 
  Trash2, 
  Upload, 
  ExternalLink,
  Edit3
} from 'lucide-react';
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

  // Edit Category & Multi-Image Gallery State
  const [editingCategory, setEditingCategory] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    base_price: 0,
    bed_type: '',
    capacity_adults: 2,
    capacity_children: 1,
    description: '',
    amenities: '',
    image_url: '',
    gallery_images: []
  });
  const [newImageUrl, setNewImageUrl] = useState('');
  const [savingCategory, setSavingCategory] = useState(false);

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
      if (cats.data.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(cats.data[0].id);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load room inventory data');
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

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    const existingImages = Array.isArray(cat.gallery_images) && cat.gallery_images.length > 0 
      ? [...cat.gallery_images] 
      : cat.image_url ? [cat.image_url] : [];
    
    setEditForm({
      name: cat.name || '',
      base_price: cat.base_price || 0,
      bed_type: cat.bed_type || 'King Bed',
      capacity_adults: cat.capacity_adults || 2,
      capacity_children: cat.capacity_children || 1,
      description: cat.description || '',
      amenities: cat.amenities || '',
      image_url: cat.image_url || '',
      gallery_images: existingImages
    });
    setNewImageUrl('');
  };

  const handleAddImageToGallery = () => {
    const url = newImageUrl.trim();
    if (!url) {
      toast.error('Please enter a valid image URL');
      return;
    }
    if (editForm.gallery_images.includes(url)) {
      toast.error('This image is already in the gallery');
      return;
    }
    const updated = [...editForm.gallery_images, url];
    setEditForm({
      ...editForm,
      gallery_images: updated,
      // If primary cover is empty, set it
      image_url: editForm.image_url || url
    });
    setNewImageUrl('');
    toast.success('Image added to gallery list');
  };

  const handleRemoveImageFromGallery = (indexToRemove) => {
    const updated = editForm.gallery_images.filter((_, idx) => idx !== indexToRemove);
    let newCover = editForm.image_url;
    if (editForm.image_url === editForm.gallery_images[indexToRemove]) {
      newCover = updated.length > 0 ? updated[0] : '';
    }
    setEditForm({
      ...editForm,
      gallery_images: updated,
      image_url: newCover
    });
  };

  const handleSetPrimaryCover = (url) => {
    setEditForm({
      ...editForm,
      image_url: url
    });
    toast.success('Set as primary cover photo');
  };

  const handleSaveCategoryChanges = async (e) => {
    e.preventDefault();
    if (!editingCategory) return;
    setSavingCategory(true);

    try {
      const payload = {
        name: editForm.name,
        base_price: parseFloat(editForm.base_price),
        bed_type: editForm.bed_type,
        capacity_adults: parseInt(editForm.capacity_adults),
        capacity_children: parseInt(editForm.capacity_children),
        description: editForm.description,
        amenities: editForm.amenities,
        image_url: editForm.image_url || (editForm.gallery_images[0] || ''),
        gallery_images: editForm.gallery_images
      };

      await roomsAPI.updateCategory(editingCategory.id, payload);
      toast.success(`${editForm.name} updated with ${editForm.gallery_images.length} photos!`);
      setEditingCategory(null);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to update category');
    } finally {
      setSavingCategory(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Title & Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0, color: '#0F172A' }}>
            Room Categories & Inventory
          </h2>
          <p style={{ fontSize: '0.86rem', color: '#64748B', margin: '4px 0 0' }}>
            Configure resort suites, multi-photo galleries, nightly pricing, and physical room allocations
          </p>
        </div>

        <button onClick={() => setShowAddModal(true)} className="btn-teal">
          <Plus size={16} />
          <span>Add Physical Room Unit</span>
        </button>
      </div>

      {/* Categories Showcase */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
        {categories.map((cat) => {
          const categoryRooms = rooms.filter(r => r.category_id === cat.id);
          const availableCount = categoryRooms.filter(r => r.status === 'available').length;
          const images = Array.isArray(cat.gallery_images) && cat.gallery_images.length > 0 
            ? cat.gallery_images 
            : [cat.image_url || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'];

          return (
            <div key={cat.id} className="white-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              
              {/* Main Photo with Availability Badge */}
              <div style={{ position: 'relative', height: '200px' }}>
                <img 
                  src={cat.image_url || images[0]} 
                  alt={cat.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                
                {/* Available Count Pill */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(15, 23, 42, 0.78)',
                  backdropFilter: 'blur(8px)',
                  color: '#FFFFFF',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  fontSize: '0.74rem',
                  fontWeight: '700'
                }}>
                  {availableCount} / {categoryRooms.length} Available
                </div>

                {/* Photo Count Badge */}
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  background: 'rgba(8, 145, 178, 0.9)',
                  backdropFilter: 'blur(6px)',
                  color: '#FFFFFF',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <ImageIcon size={13} />
                  <span>{images.length} Photos</span>
                </div>
              </div>

              {/* Multi-Photo Thumbnail Bar Preview */}
              {images.length > 1 && (
                <div style={{ display: 'flex', gap: '6px', padding: '10px 14px', background: '#F8FDFF', borderBottom: '1px solid #E2EFF3', overflowX: 'auto' }}>
                  {images.map((img, i) => (
                    <img 
                      key={i} 
                      src={img} 
                      alt={`Thumb ${i+1}`}
                      style={{
                        width: '48px',
                        height: '36px',
                        borderRadius: '6px',
                        objectFit: 'cover',
                        border: img === cat.image_url ? '2px solid #0891B2' : '1px solid #CBD5E1',
                        flexShrink: 0
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Card Body */}
              <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                    {cat.name}
                  </h3>
                  <span style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0891B2' }}>
                    ${cat.base_price}
                    <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '500' }}> / nt</span>
                  </span>
                </div>

                <p style={{ fontSize: '0.84rem', color: '#64748B', lineHeight: '1.5', margin: '0 0 14px', minHeight: '40px' }}>
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

                {/* Edit Category & Multiple Photos Button */}
                <button 
                  onClick={() => handleOpenEditModal(cat)}
                  className="btn-ghost"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '0.84rem',
                    padding: '8px 12px',
                    marginBottom: '16px',
                    border: '1px solid #E2EFF3',
                    background: '#F8FDFF'
                  }}
                >
                  <Edit3 size={15} color="#0891B2" />
                  <span>Manage Details & Photos ({images.length})</span>
                </button>

                {/* Allocated Room Chips */}
                <div style={{ marginTop: 'auto', borderTop: '1px solid #E2EFF3', paddingTop: '14px' }}>
                  <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                    Allocated Physical Units:
                  </span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {categoryRooms.length > 0 ? categoryRooms.map(r => (
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
                    )) : (
                      <span style={{ fontSize: '0.76rem', color: '#94A3B8', fontStyle: 'italic' }}>
                        No units allocated yet.
                      </span>
                    )}
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: EDIT CATEGORY & MULTI-IMAGE GALLERY */}
      {editingCategory && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="white-card" style={{ width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', position: 'relative' }}>
            
            {/* Close Button */}
            <button 
              onClick={() => setEditingCategory(null)}
              style={{ position: 'absolute', top: '22px', right: '22px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
            >
              <X size={20} />
            </button>

            <div style={{ marginBottom: '20px' }}>
              <span className="badge-teal" style={{ marginBottom: '6px', display: 'inline-block' }}>
                Suite Configuration & Gallery
              </span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '4px 0 0', color: '#0F172A' }}>
                Edit {editingCategory.name}
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#64748B', margin: '4px 0 0' }}>
                Manage photos shown on the guest website and adjust nightly rates
              </p>
            </div>

            <form onSubmit={handleSaveCategoryChanges} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Category Name & Nightly Rate */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#0F172A', marginBottom: '6px', fontWeight: '700' }}>
                    Category Name *
                  </label>
                  <input 
                    type="text" 
                    required 
                    className="input-clean"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#0F172A', marginBottom: '6px', fontWeight: '700' }}>
                    Nightly Rate ($) *
                  </label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    step="0.01"
                    className="input-clean"
                    value={editForm.base_price}
                    onChange={(e) => setEditForm({ ...editForm, base_price: e.target.value })}
                  />
                </div>
              </div>

              {/* Bed Type & Capacity */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#0F172A', marginBottom: '6px', fontWeight: '700' }}>
                    Bed Type
                  </label>
                  <input 
                    type="text" 
                    className="input-clean"
                    value={editForm.bed_type}
                    onChange={(e) => setEditForm({ ...editForm, bed_type: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#0F172A', marginBottom: '6px', fontWeight: '700' }}>
                    Max Adults
                  </label>
                  <input 
                    type="number" 
                    min="1"
                    className="input-clean"
                    value={editForm.capacity_adults}
                    onChange={(e) => setEditForm({ ...editForm, capacity_adults: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#0F172A', marginBottom: '6px', fontWeight: '700' }}>
                    Max Children
                  </label>
                  <input 
                    type="number" 
                    min="0"
                    className="input-clean"
                    value={editForm.capacity_children}
                    onChange={(e) => setEditForm({ ...editForm, capacity_children: e.target.value })}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#0F172A', marginBottom: '6px', fontWeight: '700' }}>
                  Suite Narrative / Description
                </label>
                <textarea 
                  rows="3"
                  className="input-clean"
                  style={{ resize: 'vertical' }}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>

              {/* Amenities */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#0F172A', marginBottom: '6px', fontWeight: '700' }}>
                  Amenities (comma-separated)
                </label>
                <input 
                  type="text" 
                  className="input-clean"
                  value={editForm.amenities}
                  onChange={(e) => setEditForm({ ...editForm, amenities: e.target.value })}
                />
              </div>

              {/* MULTI-PHOTO GALLERY SECTION */}
              <div style={{ background: '#F8FDFF', border: '1px solid #E2EFF3', borderRadius: '16px', padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ImageIcon size={16} color="#0891B2" />
                    Multi-Photo Gallery ({editForm.gallery_images.length} Photos)
                  </label>
                  <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
                    Click a photo to make it the Primary Cover
                  </span>
                </div>

                {/* Add Photo Input Row */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <input 
                    type="url" 
                    placeholder="Paste image URL (https://...)" 
                    className="input-clean"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button 
                    type="button" 
                    onClick={handleAddImageToGallery}
                    className="btn-teal"
                    style={{ padding: '8px 16px', fontSize: '0.84rem', flexShrink: 0 }}
                  >
                    <Plus size={15} /> Add Photo
                  </button>
                </div>

                {/* Gallery Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
                  {editForm.gallery_images.map((img, idx) => {
                    const isCover = img === editForm.image_url;

                    return (
                      <div 
                        key={idx} 
                        style={{
                          position: 'relative',
                          height: '95px',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          border: isCover ? '3px solid #0891B2' : '1px solid #CBD5E1',
                          boxShadow: isCover ? '0 4px 12px rgba(8, 145, 178, 0.25)' : 'none',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleSetPrimaryCover(img)}
                        title="Click to set as primary cover photo"
                      >
                        <img 
                          src={img} 
                          alt={`Gallery ${idx+1}`} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />

                        {/* Primary Badge */}
                        {isCover && (
                          <div style={{
                            position: 'absolute',
                            top: '4px',
                            left: '4px',
                            background: '#0891B2',
                            color: '#FFFFFF',
                            fontSize: '0.62rem',
                            fontWeight: '800',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            Cover
                          </div>
                        )}

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImageFromGallery(idx);
                          }}
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            background: 'rgba(239, 68, 68, 0.9)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFFFFF',
                            cursor: 'pointer'
                          }}
                          title="Remove photo"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {editForm.gallery_images.length === 0 && (
                  <p style={{ fontSize: '0.8rem', color: '#94A3B8', textAlign: 'center', margin: '14px 0' }}>
                    No photos added yet. Paste a URL above to add multiple high-resolution photos.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setEditingCategory(null)} 
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-teal"
                  disabled={savingCategory}
                >
                  {savingCategory ? 'Saving Changes...' : 'Save Category & Gallery'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL 2: ADD PHYSICAL ROOM UNIT */}
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
