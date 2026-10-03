import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Check, 
  ShieldCheck,
  BedDouble
} from 'lucide-react';
import { housekeepingAPI, roomsAPI } from '../services/api';

export const Housekeeping = () => {
  const [tasks, setTasks] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [activeTab, setActiveTab] = useState('tasks'); // tasks or maintenance
  
  // New Maintenance ticket state
  const [showMaintModal, setShowMaintModal] = useState(false);
  const [maintRoomId, setMaintRoomId] = useState('');
  const [maintTitle, setMaintTitle] = useState('');
  const [maintCategory, setMaintCategory] = useState('hvac');
  const [maintPriority, setMaintPriority] = useState('medium');
  const [maintNotes, setMaintNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tRes, mRes, rRes] = await Promise.all([
        housekeepingAPI.getTasks(),
        housekeepingAPI.getMaintenance(),
        roomsAPI.getRooms()
      ]);
      setTasks(tRes.data);
      setMaintenance(mRes.data);
      setRooms(rRes.data);
      if (rRes.data.length > 0) setMaintRoomId(rRes.data[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId, status) => {
    try {
      await housekeepingAPI.updateTask(taskId, { status });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateMaintenance = async (e) => {
    e.preventDefault();
    try {
      await housekeepingAPI.createMaintenance({
        room_id: parseInt(maintRoomId),
        title: maintTitle,
        category: maintCategory,
        priority: maintPriority,
        notes: maintNotes,
        reported_by: 'Housekeeping Lead'
      });
      setShowMaintModal(false);
      setMaintTitle('');
      setMaintNotes('');
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create ticket');
    }
  };

  const handleResolveTicket = async (maintId) => {
    try {
      await housekeepingAPI.updateMaintenance(maintId, { status: 'resolved' });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '28px' }}>
      {/* Title & Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Housekeeping & Facilities Maintenance</h2>
          <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: '4px 0 0' }}>Cleanliness queue dispatch, room inspection, and repair tickets</p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setActiveTab('tasks')} 
            className={activeTab === 'tasks' ? 'btn-gold' : 'btn-ghost'}
          >
            <Sparkles size={16} />
            <span>Cleaning Tasks ({tasks.filter(t => t.status !== 'inspected').length})</span>
          </button>
          <button 
            onClick={() => setActiveTab('maintenance')} 
            className={activeTab === 'maintenance' ? 'btn-gold' : 'btn-ghost'}
          >
            <Wrench size={16} />
            <span>Maintenance Tickets ({maintenance.filter(m => m.status !== 'resolved').length})</span>
          </button>
          <button 
            onClick={() => setShowMaintModal(true)} 
            className="btn-danger"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <Plus size={16} />
            <span>Log Repair Issue</span>
          </button>
        </div>
      </div>

      {activeTab === 'tasks' ? (
        /* Cleaning Tasks Board */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {tasks.map(task => (
            <div key={task.id} className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#F8FAFC' }}>
                    Room #{task.room?.room_number}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>({task.room?.zone})</span>
                </div>
                <span className={`badge badge-${task.status === 'completed' || task.status === 'inspected' ? 'available' : task.status === 'in_progress' ? 'occupied' : 'dirty'}`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>

              <div style={{ fontSize: '0.82rem', color: '#D4AF37', fontWeight: '600', marginBottom: '6px' }}>
                Type: {task.task_type.replace('_', ' ').toUpperCase()} • Priority: {task.priority.toUpperCase()}
              </div>

              <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: '16px' }}>
                {task.notes || 'Routine cleaning and towel replenishment.'}
              </p>

              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px' }}>
                {task.status === 'pending' && (
                  <button 
                    onClick={() => handleUpdateTaskStatus(task.id, 'in_progress')}
                    className="btn-ghost" 
                    style={{ flex: 1, fontSize: '0.78rem' }}
                  >
                    Start Cleaning
                  </button>
                )}
                {task.status === 'in_progress' && (
                  <button 
                    onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                    className="btn-emerald" 
                    style={{ flex: 1, fontSize: '0.78rem' }}
                  >
                    Mark Clean
                  </button>
                )}
                {task.status === 'completed' && (
                  <button 
                    onClick={() => handleUpdateTaskStatus(task.id, 'inspected')}
                    className="btn-gold" 
                    style={{ flex: 1, fontSize: '0.78rem' }}
                  >
                    Supervisor Inspect
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Maintenance Tickets */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {maintenance.map(item => (
            <div key={item.id} className="glass-card" style={{ padding: '20px', borderLeft: item.status === 'resolved' ? '4px solid #10B981' : '4px solid #F43F5E' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: '800', fontSize: '1.1rem', color: '#F8FAFC' }}>
                  Room #{item.room?.room_number}
                </span>
                <span className={`badge badge-${item.status === 'resolved' ? 'available' : 'maintenance'}`}>
                  {item.status}
                </span>
              </div>

              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#D4AF37', margin: '0 0 6px 0' }}>
                {item.title}
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: '14px' }}>
                {item.notes || 'Engineering inspection required.'}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  Category: {item.category.toUpperCase()}
                </span>
                {item.status !== 'resolved' && (
                  <button onClick={() => handleResolveTicket(item.id)} className="btn-emerald" style={{ padding: '5px 12px', fontSize: '0.78rem' }}>
                    <CheckCircle2 size={14} />
                    <span>Resolve Issue</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Log Repair Issue Modal */}
      {showMaintModal && (
        <div className="modal-overlay" onClick={() => setShowMaintModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }} className="gold-gradient-text">Log Maintenance Issue</h3>
            </div>
            <form onSubmit={handleCreateMaintenance} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '6px' }}>Target Room *</label>
                <select className="input-dark" value={maintRoomId} onChange={(e) => setMaintRoomId(e.target.value)}>
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>Room #{r.room_number} — {r.category?.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '6px' }}>Issue Title *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. AC Thermostat error or Leaking faucet" 
                  className="input-dark"
                  value={maintTitle}
                  onChange={(e) => setMaintTitle(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '6px' }}>Category</label>
                  <select className="input-dark" value={maintCategory} onChange={(e) => setMaintCategory(e.target.value)}>
                    <option value="hvac">HVAC / AC</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="carpentry">Carpentry</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '6px' }}>Priority Level</label>
                  <select className="input-dark" value={maintPriority} onChange={(e) => setMaintPriority(e.target.value)}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="emergency">Emergency (Out of Order)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '6px' }}>Notes / Description</label>
                <textarea 
                  rows="3" 
                  className="input-dark" 
                  placeholder="Provide details for engineers..."
                  value={maintNotes}
                  onChange={(e) => setMaintNotes(e.target.value)}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowMaintModal(false)} className="btn-ghost">Cancel</button>
                <button type="submit" className="btn-gold">Dispatch Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
