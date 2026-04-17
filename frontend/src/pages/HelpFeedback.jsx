import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { HelpCircle, Send, MessageCircle, CheckCircle2, Clock, AlertCircle, Trash2, ArrowLeft } from 'lucide-react';

const MAX_SUBJECT_CHARS = 100;
const MAX_MESSAGE_WORDS = 500;
const MAX_DAILY_FEEDBACKS = 10;

const countWords = (text) => text.trim() ? text.trim().split(/\s+/).length : 0;

const getTodayKey = () => new Date().toISOString().split('T')[0];

const getDailyCount = (userId) => {
  const key = `fb-daily-${userId || 'anon'}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    const { date, count } = JSON.parse(stored);
    if (date === getTodayKey()) return count;
  }
  return 0;
};

const incrementDailyCount = (userId) => {
  const key = `fb-daily-${userId || 'anon'}`;
  const current = getDailyCount(userId);
  localStorage.setItem(key, JSON.stringify({ date: getTodayKey(), count: current + 1 }));
};

const HelpFeedback = () => {
  const { token, user } = useContext(AuthContext);
  const userId = user?.id || user?._id;
  
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [loading, setLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [dailyLimitHit, setDailyLimitHit] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
    if (getDailyCount(userId) >= MAX_DAILY_FEEDBACKS) setDailyLimitHit(true);
  }, [token, userId]);

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/feedback`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data);
        // Sync active thread if it's open
        if (activeThread) {
            const updated = data.find(f => f._id === activeThread._id);
            if (updated) setActiveThread(updated);
        }
      }
    } catch (err) { console.error('Fetch error:', err); }
  };

  const handleCreateThread = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    if (getDailyCount(userId) >= MAX_DAILY_FEEDBACKS) {
      alert('You have reached the daily limit of 10 submissions.');
      setDailyLimitHit(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subject, message })
      });
      
      const data = await res.json();
      
      if (res.status === 429) {
          alert('Rate limit exceeded. Try again in 24 hours.');
          setDailyLimitHit(true);
      } else if (res.ok) {
        incrementDailyCount(userId);
        setSubject('');
        setMessage('');
        setSubmitted(true);
        // Important: Manual state update so UI feels instant
        setFeedbacks(prev => [data, ...prev]);
        setActiveThread(data);
        setTimeout(() => setSubmitted(false), 5000);
      } else {
          alert(`Error: ${data.message || 'Failed to start discussion'}`);
      }
    } catch (err) { 
        alert('Could not connect to server. Is the backend running?');
        console.error(err); 
    }
    setLoading(false);
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeThread) return;
    setReplyLoading(true);
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/feedback/${activeThread._id}/reply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message: replyText })
        });
        
        const data = await res.json();
        if (res.ok) {
            setReplyText('');
            // Optimistic update for the thread view
            setActiveThread(data);
            // Refresh list in background
            fetchFeedbacks();
        } else {
            alert(`Failed to send: ${data.message || 'Unknown error'}`);
        }
    } catch (err) { 
        alert('Connectivity error. Check your internet or server status.');
        console.error(err); 
    }
    setReplyLoading(false);
  };

  const handleResolve = async (threadId) => {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/feedback/${threadId}/status`, {
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

  const handleDeleteThread = async (threadId) => {
    if (!window.confirm("Delete this discussion? This cannot be undone.")) return;
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/feedback/${threadId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            if (activeThread?._id === threadId) setActiveThread(null);
            setFeedbacks(prev => prev.filter(f => f._id !== threadId));
        }
    } catch (err) { console.error(err); }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved': return <CheckCircle2 size={16} color="var(--success)" />;
      case 'reviewed': return <AlertCircle size={16} color="var(--brand-accent)" />;
      default: return <Clock size={16} color="var(--text-muted-secondary)" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'var(--success)';
      case 'reviewed': return 'var(--brand-accent)';
      default: return 'var(--text-muted-secondary)';
    }
  };

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <HelpCircle size={28} color="var(--brand-primary)" /> Help & Feedback
        </h1>
        <p style={{ color: 'var(--text-muted-secondary)', fontSize: '0.95rem' }}>
            {activeThread ? `Discussion: ${activeThread.subject}` : "Share your thoughts, report bugs, or ask for help."}
        </p>
      </div>

      <div style={{ 
          display: 'grid', 
          gridTemplateColumns: activeThread ? '350px 1fr' : '1fr 1fr', 
          gap: '24px', 
          flex: 1, 
          minHeight: 0,
          transition: 'all 0.4s ease'
      }}>
        
        {/* List of discussions */}
        {!activeThread ? (
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Send size={20} color="var(--brand-primary)" /> New Message
            </h3>

            {submitted && (
                <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                    <div style={{ fontWeight: '600', color: 'var(--success)', fontSize: '0.9rem' }}>Created! Loading discussion...</div>
                </div>
            )}

            <form onSubmit={handleCreateThread}>
                <label className="label">Subject</label>
                <input
                    type="text"
                    className="input-field"
                    value={subject}
                    onChange={(e) => e.target.value.length <= MAX_SUBJECT_CHARS && setSubject(e.target.value)}
                    placeholder="e.g. Bug in Dashboard"
                    required
                    disabled={dailyLimitHit}
                />
                <label className="label">Main Message</label>
                <textarea
                    className="input-field"
                    value={message}
                    onChange={(e) => countWords(e.target.value) <= MAX_MESSAGE_WORDS && setMessage(e.target.value)}
                    placeholder="Describe your issue..."
                    required
                    rows={8}
                    style={{ resize: 'none' }}
                    disabled={dailyLimitHit}
                />
                <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading || dailyLimitHit}>
                    {loading ? 'Starting...' : 'Start Conversation'}
                </button>
            </form>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', paddingRight: '8px' }} className="hide-scrollbar">
              <button 
                onClick={() => setActiveThread(null)}
                style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-light)', color: 'var(--text-main)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', marginBottom: '12px' }}
              >
                  <ArrowLeft size={18} /> New Submission
              </button>

              <h4 style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', color: 'var(--text-muted-secondary)', padding: '0 8px 8px' }}>Your Discussions</h4>
              
              {feedbacks.map(fb => (
                  <div 
                    key={fb._id} 
                    onClick={() => setActiveThread(fb)}
                    style={{ 
                        padding: '16px', 
                        background: activeThread?._id === fb._id ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-glass)', 
                        border: `1px solid ${activeThread?._id === fb._id ? 'var(--brand-primary)' : 'var(--border-light)'}`, 
                        borderRadius: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                  >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <strong style={{ fontSize: '1rem', color: activeThread?._id === fb._id ? 'var(--brand-primary)' : 'inherit' }}>{fb.subject}</strong>
                        {getStatusIcon(fb.status.toLowerCase())}
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {fb.conversations?.[fb.conversations.length-1]?.message || "Opening..."}
                      </p>
                  </div>
              ))}
          </div>
        )}

        {/* Conversation Window */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            {!activeThread ? (
                <>
                <div style={{ padding: '24px', borderBottom: '1px solid var(--border-light)' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MessageCircle size={20} color="var(--brand-accent)" /> Discussion History
                    </h3>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                    {feedbacks.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted-secondary)' }}>
                            <HelpCircle size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                            <p>No past discussions found.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {feedbacks.map(fb => (
                                <div key={fb._id} className="transaction-item" style={{ 
                                    padding: '20px', background: 'rgba(0,0,0,0.15)', borderRadius: '16px', border: '1px solid var(--border-light)', cursor: 'pointer' 
                                }} onClick={() => setActiveThread(fb)}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '4px' }}>{fb.subject}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted-secondary)' }}>
                                                {fb.conversations?.length || 0} messages • Last update {new Date(fb.updatedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <span style={{ fontSize: '0.8rem', padding: '6px 12px', borderRadius: '20px', background: `${getStatusColor(fb.status)}20`, color: getStatusColor(fb.status), fontWeight: 'bold' }}>
                                                {fb.status.toUpperCase()}
                                            </span>
                                            <Trash2 size={20} color="var(--text-muted-secondary)" className="hover-action" onClick={(e) => { e.stopPropagation(); handleDeleteThread(fb._id); }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                </>
            ) : (
                <>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16, 185, 129, 0.08)' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{activeThread.subject}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', marginTop: '6px', color: getStatusColor(activeThread.status) }}>
                                {getStatusIcon(activeThread.status.toLowerCase())} <span style={{ fontWeight: '700' }}>{activeThread.status.toUpperCase()}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {activeThread.status.toLowerCase() !== 'resolved' && (
                                <button 
                                    onClick={() => handleResolve(activeThread._id)}
                                    className="btn-secondary" 
                                    style={{ padding: '10px 20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    <CheckCircle2 size={18} /> Resolve
                                </button>
                            )}
                            <button 
                                onClick={() => handleDeleteThread(activeThread._id)}
                                style={{ background: 'rgba(244, 63, 94, 0.15)', color: 'var(--danger)', border: '1px solid rgba(244, 63, 94, 0.2)', padding: '10px', borderRadius: '12px' }}
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {activeThread.conversations?.length > 0 ? (
                            activeThread.conversations.map((msg, i) => (
                                <div key={i} style={{ maxWidth: '85%', alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                                    <div style={{ 
                                        padding: '14px 20px', borderRadius: '20px', background: msg.sender === 'user' ? 'var(--brand-primary)' : 'var(--bg-input)', color: msg.sender === 'user' ? 'white' : 'var(--text-main)', border: msg.sender === 'user' ? 'none' : '1px solid var(--border-light)', borderBottomRightRadius: msg.sender === 'user' ? '4px' : '20px', borderBottomLeftRadius: msg.sender === 'user' ? '20px' : '4px', fontSize: '1rem', lineHeight: '1.6'
                                    }}>
                                        {msg.message}
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted-secondary)', marginTop: '6px' }}>
                                        {msg.sender === 'admin' ? 'Support Assistant' : 'You'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted-secondary)' }}>
                                <Clock size={40} style={{ opacity: 0.2, marginBottom: '12px' }} />
                                <p>Loading conversation...</p>
                            </div>
                        )}
                    </div>

                    <div style={{ padding: '24px', borderTop: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.15)' }}>
                        <form onSubmit={handleReply} style={{ display: 'flex', gap: '12px' }}>
                            <input 
                                type="text" 
                                className="input-field" 
                                placeholder="Write a reply..." 
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                style={{ margin: 0, flex: 1, borderRadius: '12px' }}
                                required
                            />
                            <button type="submit" className="btn-primary" style={{ padding: '0 32px', borderRadius: '12px' }} disabled={replyLoading}>
                                {replyLoading ? '...' : <Send size={22} />}
                            </button>
                        </form>
                    </div>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default HelpFeedback;
