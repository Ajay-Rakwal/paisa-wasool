import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address (e.g., mail@example.com)');
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
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: '20px' }}>
      <div style={{ textAlign: 'center' }}>
          <h1 style={{ 
              fontSize: '3rem', 
              fontWeight: '900', 
              letterSpacing: '-2px', 
              margin: '0',
              background: 'var(--brand-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: 'none'
          }}>
            PAI$A WA$OOL
          </h1>
          <p className="text-muted" style={{ fontSize: '1.1rem', marginTop: '4px', letterSpacing: '1px' }}>AI-POWERED FINANCIAL FREEDOM</p>
      </div>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        {error && <div className="text-danger" style={{ marginBottom: '16px', textAlign: 'center' }}>{error}</div>}
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
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '16px', color: 'var(--text-muted-secondary)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setIsLogin(!isLogin)} style={{ color: 'var(--brand-primary)', cursor: 'pointer', fontWeight: '600' }}>
            {isLogin ? 'Sign up' : 'Login'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
