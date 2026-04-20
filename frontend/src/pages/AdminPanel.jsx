import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, Users, Receipt, RefreshCw, Brain, CheckCircle2, XCircle, ArrowRightLeft, MessageCircle, Send } from 'lucide-react';

const AdminPanel = () => {
  const { token } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [corrections, setCorrections] = useState([]);
  const [users, setUsers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [retraining, setRetraining] = useState(false);
  const [retrainResult, setRetrainResult] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchCorrections();
    fetchUsers();
    fetchFeedbacks();
  }, [token]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setStats(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchCorrections = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/corrections`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setCorrections(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setUsers(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/feedback/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setFeedbacks(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleRetrain = async () => {
    setRetraining(true);
    setRetrainResult(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/retrain`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({})
      });
      const data = await res.json();
      setRetrainResult(data);
      if (res.ok) fetchStats();
    } catch (err) {
      setRetrainResult({ message: 'Failed to connect to ML server. Make sure the prediction server is running (python ml/predict_server.py)' });
    }
    setRetraining(false);
  };

  const handleReply = async (feedbackId) => {
    if (!replyText.trim()) return;
    setReplyLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/feedback/${feedbackId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: replyText })
      });
      if (res.ok) {
        setReplyingTo(null);
        setReplyText('');
        fetchFeedbacks();
      } else {
          const data = await res.json();
          alert(`Failed to send reply: ${data.message || 'Server error'}`);
      }
    } catch (err) { 
        alert('Could not connect to backend server.');
        console.error(err); 
    }
    setReplyLoading(false);
  };

  const markResolved = async (feedbackId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/feedback/${feedbackId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'resolved' })
      });
      if (res.ok) {
          fetchFeedbacks();
      } else {
          const data = await res.json();
          alert(`Error resolving: ${data.message}`);
      }
    } catch (err) { console.error(err); }
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: <ShieldCheck size={18} /> },
    { key: 'corrections', label: 'Corrections', icon: <ArrowRightLeft size={18} /> },
    { key: 'retrain', label: 'Retrain Model', icon: <Brain size={18} /> },
    { key: 'feedback', label: `Feedback (${feedbacks.filter(f => f.status === 'pending').length})`, icon: <MessageCircle size={18} /> },
    { key: 'users', label: 'Users', icon: <Users size={18} /> }
  ];

  return (
    <div>
      <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <ShieldCheck size={28} color="var(--brand-primary)" /> Admin Panel
      </h1>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius-sm)',
              background: activeTab === tab.key ? 'var(--brand-primary)' : 'var(--bg-glass)',
              color: activeTab === tab.key ? 'white' : 'var(--text-muted-secondary)',
              border: `1px solid ${activeTab === tab.key ? 'var(--brand-primary)' : 'var(--border-light)'}`,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.95rem'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          <div className="admin-stats-grid responsive-grid">
            <div className="card admin-stat-card">
              <Users size={28} style={{ color: 'var(--brand-primary)', marginBottom: '12px' }} />
              <div className="stat-value">{stats?.totalUsers || 0}</div>
              <div className="stat-label">Total Users</div>
            </div>
            <div className="card admin-stat-card">
              <Receipt size={28} style={{ color: 'var(--brand-accent)', marginBottom: '12px' }} />
              <div className="stat-value">{stats?.totalTransactions || 0}</div>
              <div className="stat-label">Total Transactions</div>
            </div>
            <div className="card admin-stat-card">
              <ArrowRightLeft size={28} style={{ color: 'var(--warning)', marginBottom: '12px' }} />
              <div className="stat-value">{stats?.totalCorrections || 0}</div>
              <div className="stat-label">User Corrections</div>
            </div>
            <div className="card admin-stat-card">
              <MessageCircle size={28} style={{ color: 'var(--danger)', marginBottom: '12px' }} />
              <div className="stat-value">{feedbacks.filter(f => f.status === 'pending').length}</div>
              <div className="stat-label">Pending Feedback</div>
            </div>
          </div>

          <div className="card" style={{ marginTop: '16px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Quick Actions</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={() => setActiveTab('corrections')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowRightLeft size={18} /> Review Corrections ({stats?.totalCorrections || 0})
              </button>
              <button onClick={() => setActiveTab('retrain')} className="btn-primary retrain-button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Brain size={18} /> Retrain Model
              </button>
              <button onClick={() => setActiveTab('feedback')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageCircle size={18} /> View Feedback
              </button>
              <button onClick={() => { fetchStats(); fetchCorrections(); fetchUsers(); fetchFeedbacks(); }} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCw size={18} /> Refresh Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Corrections Tab — simplified, no select */}
      {activeTab === 'corrections' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>User Corrections ({corrections.length})</h3>
            <p style={{ color: 'var(--text-muted-secondary)', fontSize: '0.85rem', margin: 0 }}>
              These corrections are used when you retrain the model
            </p>
          </div>
          
          {corrections.length === 0 ? (
            <p style={{ color: 'var(--text-muted-secondary)', textAlign: 'center', padding: '32px 0' }}>
              No user corrections yet. When users manually change categories, they will appear here.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Original → Corrected</th>
                    <th>User</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {corrections.map(c => (
                    <tr key={c._id}>
                      <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.description}
                      </td>
                      <td>
                        <span className="correction-badge original">{c.originalCategory || '—'}</span>
                        {' → '}
                        <span className="correction-badge corrected">{c.category}</span>
                      </td>
                      <td style={{ color: 'var(--text-muted-secondary)' }}>{c.userId?.username || c.userId?.email || '—'}</td>
                      <td style={{ color: 'var(--text-muted-secondary)', fontSize: '0.85rem' }}>
                        {new Date(c.updatedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Retrain Tab */}
      {activeTab === 'retrain' && (
        <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <div className="card">
            <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Brain size={24} color="var(--brand-primary)" /> Model Retraining
            </h3>
            <p style={{ color: 'var(--text-muted-secondary)', lineHeight: '1.7', marginBottom: '24px' }}>
              Retrain the ML categorization model using all user-corrected data. This merges the corrections 
              with the original training dataset and produces an improved model.
            </p>
            <div style={{ 
              background: 'var(--bg-input)', 
              padding: '16px', 
              borderRadius: 'var(--radius-sm)',
              marginBottom: '24px',
              border: '1px solid var(--border-light)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted-secondary)' }}>Available corrections:</span>
                <span style={{ fontWeight: '600' }}>{corrections.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted-secondary)' }}>Status:</span>
                <span style={{ fontWeight: '600', color: corrections.length > 0 ? 'var(--success)' : 'var(--text-muted-secondary)' }}>
                  {corrections.length > 0 ? 'Ready to train' : 'No corrections yet'}
                </span>
              </div>
            </div>
            <button 
              onClick={handleRetrain}
              className="btn-primary retrain-button"
              disabled={retraining || corrections.length === 0}
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
            >
              {retraining ? (
                <>⏳ Retraining...</>
              ) : (
                <><Brain size={18} /> Start Retraining (All {corrections.length} Corrections)</>
              )}
            </button>
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              {retrainResult?.accuracy ? <CheckCircle2 size={24} color="var(--success)" /> : <XCircle size={24} color="var(--text-muted-secondary)" />}
              Training Results
            </h3>
            {retrainResult ? (
              <div>
                <div style={{
                  padding: '20px',
                  background: retrainResult.accuracy ? 'rgba(34, 197, 94, 0.08)' : 'rgba(244, 63, 94, 0.08)',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${retrainResult.accuracy ? 'rgba(34, 197, 94, 0.2)' : 'rgba(244, 63, 94, 0.2)'}`,
                  marginBottom: '16px'
                }}>
                  <p style={{ 
                    color: retrainResult.accuracy ? 'var(--success)' : 'var(--danger)',
                    fontWeight: '600',
                    fontSize: '1.1rem',
                    margin: 0
                  }}>
                    {retrainResult.accuracy ? '✅ ' : '❌ '}{retrainResult.message}
                  </p>
                </div>
                {retrainResult.accuracy && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
                      <span style={{ color: 'var(--text-muted-secondary)' }}>Accuracy</span>
                      <span style={{ fontWeight: '700', color: 'var(--brand-primary)', fontSize: '1.2rem' }}>{retrainResult.accuracy}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
                      <span style={{ color: 'var(--text-muted-secondary)' }}>Total Training Samples</span>
                      <span style={{ fontWeight: '600' }}>{retrainResult.totalSamples}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                      <span style={{ color: 'var(--text-muted-secondary)' }}>Corrections Used</span>
                      <span style={{ fontWeight: '600' }}>{retrainResult.correctionsUsed}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted-secondary)' }}>
                <Brain size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                <p>No training results yet. Click "Start Retraining" to begin.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feedback Tab */}
      {activeTab === 'feedback' && (
        <div className="card">
          <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageCircle size={22} color="var(--brand-accent)" /> User Feedback ({feedbacks.length})
          </h3>
          
          {feedbacks.length === 0 ? (
            <p style={{ color: 'var(--text-muted-secondary)', textAlign: 'center', padding: '32px 0' }}>
              No feedback received yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {feedbacks.map(fb => (
                <div key={fb._id} style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '20px',
                  borderLeft: `4px solid ${fb.status === 'resolved' ? 'var(--success)' : fb.status === 'reviewed' ? 'var(--brand-accent)' : 'var(--text-muted-secondary)'}`
                }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div>
                      <strong style={{ fontSize: '1.1rem' }}>{fb.subject}</strong>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted-secondary)', marginTop: '4px' }}>
                        by {fb.userId?.username || fb.userId?.email || '—'} ({fb.userId?.email}) • Updated {new Date(fb.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      textTransform: 'uppercase',
                      background: fb.status === 'resolved' ? 'rgba(34,197,94,0.1)' : fb.status === 'reviewed' ? 'rgba(245,158,11,0.1)' : 'rgba(100,100,100,0.1)',
                      color: fb.status === 'resolved' ? 'var(--success)' : fb.status === 'reviewed' ? 'var(--brand-accent)' : 'var(--text-muted-secondary)'
                    }}>
                      {fb.status}
                    </span>
                  </div>

                  {/* Conversation Thread */}
                  <div style={{ 
                    maxHeight: '300px', 
                    overflowY: 'auto', 
                    padding: '12px', 
                    background: 'rgba(0,0,0,0.1)', 
                    borderRadius: '8px', 
                    marginBottom: '15px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }} className="hide-scrollbar">
                    {fb.conversations?.map((msg, i) => (
                      <div key={i} style={{
                        alignSelf: msg.sender === 'admin' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        background: msg.sender === 'admin' ? 'var(--brand-primary)' : 'rgba(255,255,255,0.05)',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        color: msg.sender === 'admin' ? 'white' : 'inherit',
                        border: msg.sender === 'admin' ? 'none' : '1px solid var(--border-light)'
                      }}>
                        <div style={{ fontSize: '0.7rem', opacity: 0.8, marginBottom: '4px', fontWeight: 'bold' }}>
                          {msg.sender.toUpperCase()} • {new Date(msg.timestamp).toLocaleString()}
                        </div>
                        {msg.message}
                      </div>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {replyingTo === fb._id ? (
                      <div style={{ width: '100%' }}>
                        <textarea
                          className="input-field"
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          placeholder="Type your reply to the user..."
                          rows={3}
                          style={{ resize: 'vertical', marginBottom: '8px' }}
                        />
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleReply(fb._id)}
                            className="btn-primary"
                            disabled={replyLoading}
                            style={{ padding: '8px 20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <Send size={16} /> {replyLoading ? 'Sending...' : 'Send Reply'}
                          </button>
                          <button
                            onClick={() => { setReplyingTo(null); setReplyText(''); }}
                            className="btn-secondary"
                            style={{ padding: '8px 20px', fontSize: '0.9rem' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => { setReplyingTo(fb._id); setReplyText(''); }}
                          className="btn-secondary"
                          style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <MessageCircle size={14} /> Reply
                        </button>
                        {fb.status !== 'resolved' && (
                          <button
                            onClick={() => markResolved(fb._id)}
                            className="btn-secondary"
                            style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <CheckCircle2 size={14} /> Mark Resolved
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card">
          <h3 style={{ margin: '0 0 20px 0' }}>Registered Users ({users.length})</h3>
          {users.length === 0 ? (
            <p style={{ color: 'var(--text-muted-secondary)', textAlign: 'center', padding: '32px 0' }}>No users found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Transactions</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td style={{ fontWeight: '600' }}>{u.username}</td>
                      <td style={{ color: 'var(--text-muted-secondary)' }}>{u.email}</td>
                      <td>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          background: u.role === 'admin' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                          color: u.role === 'admin' ? 'var(--brand-accent)' : 'var(--brand-primary)'
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td>{u.transactionCount}</td>
                      <td style={{ color: 'var(--text-muted-secondary)', fontSize: '0.85rem' }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
