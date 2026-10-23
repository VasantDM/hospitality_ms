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
  BedDouble,
  X
} from 'lucide-react';
import { housekeepingAPI, roomsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

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

  const toast = useToast();

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
      toast.success(`Task status updated to ${status}`);
      loadData();
    } catch (err) {
      toast.error('Failed to update task');
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
      toast.success(maintPriority === 'emergency' ? 'Emergency repair logged! Room quarantined to Out of Order.' : 'Maintenance ticket dispatched.');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create ticket');
    }
  };

  const handleResolveTicket = async (maintId) => {
    try {
      await housekeepingAPI.updateMaintenance(maintId, { status: 'resolved' });
      toast.success('Maintenance ticket resolved! Room returned to service.');
      loadData();
    } catch (err) {
      toast.error('Failed to resolve ticket');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* Title & Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0, color: '#0F172A' }}>
            Housekeeping & Facilities Maintenance
          </h2>
          <p style={{ fontSize: '0.86rem', color: '#64748B', margin: '4px 0 0' }}>
            Cleanliness queue dispatch, room inspection, and engineering repair tickets
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setActiveTab('tasks')} 
            className={activeTab === 'tasks' ? 'btn-teal' : 'btn-ghost'}
            style={{ padding: '8px 18px', fontSize: '0.86rem' }}
          >
            <Sparkles size={16} />
            <span>Cleaning Tasks ({tasks.filter(t => t.status !== 'inspected').length})</span>
          </button>
          <button 
            onClick={() => setActiveTab('maintenance')} 
            className={activeTab === 'maintenance' ? 'btn-teal' : 'btn-ghost'}
            style={{ padding: '8px 18px', fontSize: '0.86rem' }}
          >
            <Wrench size={16} />
            <span>Maintenance Tickets ({maintenance.filter(m => m.status !== 'resolved').length})</span>
          </button>
          <button 
            onClick={() => setShowMaintModal(true)} 
            className="btn-amber-outline"
            style={{ padding: '8px 18px', fontSize: '0.86rem' }}
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
            <div key={task.id} className="white-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A' }}>
                    Room #{task.room?.room_number}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#64748B' }}>({task.room?.zone})</span>
                </div>
                <span className={task.status === 'completed' || task.status === 'inspected' ? 'badge-teal' : 'badge-amber'}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>

              <div style={{ fontSize: '0.82rem', color: '#0891B2', fontWeight: '700', marginBottom: '8px' }}>
                Type: {task.task_type.replace('_', ' ').toUpperCase()} • Priority: {task.priority.toUpperCase()}
              </div>

              <p style={{ fontSize: '0.84rem', color: '#64748B', marginBottom: '18px', lineHeight: '1.4' }}>
                {task.notes || 'Routine cleaning and luxury amenity replenishment.'}
              </p>

              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #E2EFF3', paddingTop: '14px', marginTop: 'auto' }}>
                {task.status === 'pending' && (
                  <button 
                    onClick={() => handleUpdateTaskStatus(task.id, 'in_progress')}
                    className="btn-ghost" 
                    style={{ flex: 1, fontSize: '0.82rem' }}
                  >
                    Start Cleaning
                  </button>
                )}
                {task.status === 'in_progress' && (
                  <button 
                    onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                    style={{ flex: 1, fontSize: '0.82rem', background: '#10B981', color: '#FFFFFF', border: 'none', borderRadius: '999px', padding: '8px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Mark Clean
                  </button>
                )}
                {task.status === 'completed' && (
                  <button 
                    onClick={() => handleUpdateTaskStatus(task.id, 'inspected')}
                    className="btn-teal" 
                    style={{ flex: 1, fontSize: '0.82rem' }}
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
            <div key={item.id} className="white-card" style={{ padding: '22px', borderLeft: item.status === 'resolved' ? '4px solid #10B981' : '4px solid #EF4444', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontWeight: '800', fontSize: '1.15rem', color: '#0F172A' }}>
                  Room #{item.room?.room_number}
                </span>
                <span className={item.status === 'resolved' ? 'badge-teal' : 'badge-amber'}>
                  {item.status}
                </span>
              </div>

              <h4 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#0891B2', margin: '0 0 6px 0' }}>
                {item.title}
              </h4>
              <p style={{ fontSize: '0.84rem', color: '#64748B', marginBottom: '16px', lineHeight: '1.4' }}>
                {item.notes || 'Engineering inspection dispatched.'}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2EFF3', paddingTop: '12px', marginTop: 'auto' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '600' }}>
                  Category: {item.category.toUpperCase()}
                </span>
                {item.status !== 'resolved' && (
                  <button onClick={() => handleResolveTicket(item.id)} className="btn-teal" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
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
          <div className="white-card" style={{ width: '100%', maxWidth: '480px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0F172A', fontWeight: '800' }}>Log Maintenance Issue</h3>
              <button onClick={() => setShowMaintModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateMaintenance} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#0F172A', marginBottom: '6px', fontWeight: '700' }}>Target Room *</label>
                <select className="input-clean" value={maintRoomId} onChange={(e) => setMaintRoomId(e.target.value)}>
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>Room #{r.room_number} — {r.category?.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#0F172A', marginBottom: '6px', fontWeight: '700' }}>Issue Title *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. AC Thermostat error or Leaking faucet" 
                  className="input-clean"
                  value={maintTitle}
                  onChange={(e) => setMaintTitle(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#0F172A', marginBottom: '6px', fontWeight: '700' }}>Category</label>
                  <select className="input-clean" value={maintCategory} onChange={(e) => setMaintCategory(e.target.value)}>
                    <option value="hvac">HVAC / AC</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="carpentry">Carpentry</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#0F172A', marginBottom: '6px', fontWeight: '700' }}>Priority Level</label>
                  <select className="input-clean" value={maintPriority} onChange={(e) => setMaintPriority(e.target.value)}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="emergency">Emergency (Out of Order)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#0F172A', marginBottom: '6px', fontWeight: '700' }}>Notes / Description</label>
                <textarea 
                  rows="3" 
                  className="input-clean" 
                  placeholder="Provide details for engineers..."
                  value={maintNotes}
                  onChange={(e) => setMaintNotes(e.target.value)}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowMaintModal(false)} className="btn-ghost">Cancel</button>
                <button type="submit" className="btn-teal">Dispatch Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
