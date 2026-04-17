import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import LoginModal from '../components/LoginModal';
import { Bot, PieChart, Wallet, Brain, ArrowRight, TrendingUp, Shield, Moon, Sun } from 'lucide-react';
import heroImg from '../assets/landing_hero_minimalist.png';

const LandingPage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const { token, login } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleCTA = () => {
    if (token) {
      navigate('/');
    } else {
      setShowLogin(true);
    }
  };

  const handleDemo = async () => {
    if (token) {
      navigate('/');
      return;
    }
    setDemoLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'demo@paisawasool.com', password: 'Demo@123' })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        navigate('/');
      } else {
        alert('Demo mode is currently unavailable. Please try again later.');
      }
    } catch (err) {
      console.error('Demo login failed:', err);
      alert('Network error while launching demo.');
    }
    setDemoLoading(false);
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
    navigate('/');
  };

  return (
    <div className="landing-page">
      {/* Top nav bar... (keeping identical nav bar section) */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 40px',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div style={{ 
          fontSize: '1.5rem', 
          fontWeight: '800',
          background: 'var(--brand-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          PAI$A WA$OOL
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={toggleTheme} style={{
            background: 'transparent',
            color: 'var(--text-muted-secondary)',
            padding: '8px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center'
          }}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => setShowLogin(true)} className="btn-secondary" style={{ padding: '10px 24px' }}>
            Login
          </button>
          <button onClick={handleCTA} className="btn-primary" style={{ padding: '10px 24px' }}>
            Get Started
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <p className="landing-hero-subtitle">Smart Finance AI</p>
          <h1 className="landing-hero-title">PAI$A<br/>WA$OOL</h1>
          <p className="landing-hero-tagline">
            Experience the next generation of expense tracking. Our AI learns your habits to provide 
            automated categorization and professional financial strategies.
          </p>
          <div className="landing-cta-group">
            <button onClick={handleCTA} className="btn-gold" style={{ 
              padding: '18px 44px', 
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              Start Tracking <ArrowRight size={22} />
            </button>
            <button onClick={handleDemo} className="btn-secondary" disabled={demoLoading} style={{ padding: '18px 40px', fontSize: '1.1rem' }}>
              {demoLoading ? '...' : 'Live Demo'}
            </button>
          </div>
        </div>
        
        <div className="landing-hero-image-container">
          <img 
            src={heroImg} 
            alt="PAI$A WA$OOL Dashboard" 
            className="landing-hero-image"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features">
        <h2 className="landing-features-title">Why PAI$A WA$OOL?</h2>
        <p className="landing-features-subtitle">Everything you need to take control of your finances</p>
        
        <div className="landing-features-grid">
          <div className="card feature-card">
            <div className="feature-icon">
              <Bot size={32} />
            </div>
            <h3>AI Auto-Categorization</h3>
            <p>Our ML model instantly categorizes your expenses — food, travel, shopping, utilities, and more. No manual tagging needed.</p>
          </div>
          
          <div className="card feature-card">
            <div className="feature-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--brand-accent)' }}>
              <PieChart size={32} />
            </div>
            <h3>Smart Dashboard</h3>
            <p>Beautiful visualizations of your spending patterns. See where every rupee goes with interactive charts and breakdowns.</p>
          </div>
          
          <div className="card feature-card">
            <div className="feature-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)' }}>
              <Wallet size={32} />
            </div>
            <h3>Budget Tracking</h3>
            <p>Set monthly limits and get real-time progress tracking. Never overshoot your budget again with smart alerts.</p>
          </div>
          
          <div className="card feature-card">
            <div className="feature-icon" style={{ background: 'rgba(13, 148, 136, 0.1)', color: 'var(--brand-secondary)' }}>
              <Brain size={32} />
            </div>
            <h3>Financial AI Advisor</h3>
            <p>Get personalized financial advice powered by AI. Ask anything about your spending habits and get instant insights.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="landing-steps">
        <h2 className="landing-steps-title">How It Works</h2>
        <div className="steps-grid">
          <div className="step-item">
            <div className="step-number">1</div>
            <h3>Add Your Transactions</h3>
            <p>Simply enter your expenses or income. Describe what you spent on and let AI handle the rest.</p>
          </div>
          <div className="step-item">
            <div className="step-number">2</div>
            <h3>AI Categorizes Instantly</h3>
            <p>Our machine learning model categorizes each transaction in milliseconds. Review and correct if needed.</p>
          </div>
          <div className="step-item">
            <div className="step-number">3</div>
            <h3>Get Smart Insights</h3>
            <p>See spending patterns, track budgets, and ask the AI advisor for personalized financial strategies.</p>
          </div>
        </div>
      </section>

      {/* Key Stats */}
      <section className="landing-features" style={{ paddingTop: '40px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '24px',
          textAlign: 'center'
        }}>
          <div className="card" style={{ padding: '40px 20px' }}>
            <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--brand-primary)', marginBottom: '8px' }}>
              <TrendingUp size={48} style={{ marginBottom: '12px' }} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--brand-accent)' }}>10+</div>
            <div style={{ color: 'var(--text-muted-secondary)', marginTop: '8px' }}>Expense Categories</div>
          </div>
          <div className="card" style={{ padding: '40px 20px' }}>
            <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--brand-primary)', marginBottom: '8px' }}>
              <Shield size={48} style={{ marginBottom: '12px' }} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--brand-accent)' }}>100%</div>
            <div style={{ color: 'var(--text-muted-secondary)', marginTop: '8px' }}>Secure & Private</div>
          </div>
          <div className="card" style={{ padding: '40px 20px' }}>
            <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--brand-primary)', marginBottom: '8px' }}>
              <Brain size={48} style={{ marginBottom: '12px' }} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--brand-accent)' }}>AI</div>
            <div style={{ color: 'var(--text-muted-secondary)', marginTop: '8px' }}>Powered Insights</div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="landing-cta-section">
        <h2>Your Money Deserves Better Management</h2>
        <p>Join smart savers who are already tracking and optimizing their finances with AI.</p>
        <button onClick={handleCTA} className="btn-gold" style={{ 
          padding: '18px 48px', 
          fontSize: '1.15rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          Start For Free <ArrowRight size={20} />
        </button>
      </section>

      {/* Footer */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '32px', 
        borderTop: '1px solid var(--border-light)',
        color: 'var(--text-muted-secondary)',
        fontSize: '0.9rem'
      }}>
        <span style={{
          background: 'var(--brand-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: '700'
        }}>PAI$A WA$OOL</span> — AI-Powered Financial Freedom © {new Date().getFullYear()}
      </footer>

      {/* Login Modal */}
      {showLogin && (
        <LoginModal 
          onClose={() => setShowLogin(false)} 
          onSuccess={handleLoginSuccess} 
        />
      )}
    </div>
  );
};

export default LandingPage;
