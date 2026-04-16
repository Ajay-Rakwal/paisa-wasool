import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { X } from 'lucide-react';

const LoginModal = ({ onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address (e.g., mail@example.com)');
      setLoading(false);
      return;
    }

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin ? { email, password } : { username, email, password };
    
    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      login(data.token, data.user);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>
        <div className="card" style={{ width: '100%', maxWidth: '420px', minWidth: '380px' }}>
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <h2 style={{ 
              fontSize: '1.8rem', 
              fontWeight: '800',
              background: 'var(--brand-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '4px'
            }}>
              PAI$A WA$OOL
            </h2>
            <p style={{ color: 'var(--text-muted-secondary)', fontSize: '0.9rem' }}>
              {isLogin ? 'Welcome back! Sign in to continue.' : 'Create your free account'}
            </p>
          </div>
          
          <h3 style={{ textAlign: 'center', marginBottom: '20px', marginTop: '16px' }}>
            {isLogin ? 'Login' : 'Sign Up'}
          </h3>
          {error && <div className="text-danger" style={{ marginBottom: '16px', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="label">Username</label>
                <input className="input-field" type="text" value={username} onChange={e => setUsername(e.target.value)} required />
              </div>
            )}
            <div>
              <label className="label">Email Address</label>
              <input className="input-field" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input-field" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
              {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '16px', color: 'var(--text-muted-secondary)', fontSize: '0.9rem' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => { setIsLogin(!isLogin); setError(''); }} style={{ color: 'var(--brand-primary)', cursor: 'pointer', fontWeight: '600' }}>
              {isLogin ? 'Sign up' : 'Login'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
