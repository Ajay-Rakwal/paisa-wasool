import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import LoginModal from '../components/LoginModal';
import { Bot, PieChart, Wallet, Brain, ArrowRight, TrendingUp, Shield, Moon, Sun, Menu, X, Play } from 'lucide-react';
import heroImg from '../assets/landing_hero_minimalist.png';

const LandingPage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { token, login, enterDemoMode } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setIsMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCTA = () => {
    if (token) {
      navigate('/');
    } else {
      setShowLogin(true);
    }
  };

  const handleDemo = () => {
    if (token) {
      navigate('/');
      return;
    }
    setDemoLoading(true);
    try {
      enterDemoMode();
      // Automatic redirect via App.jsx when token changes
    } catch (err) {
      console.error("Demo Mode error:", err);
      setDemoLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
    navigate('/');
  };

  return (
    <div className="landing-page">
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <nav style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 40px',
          maxWidth: '1400px',
          margin: '0 auto'
        }} aria-label="Main Navigation">
          <div className="logo-text" style={{ 
            fontSize: 'var(--logo-size, 1.5rem)', 
            fontWeight: '800',
            background: 'var(--brand-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-1px',
            transition: 'font-size 0.3s ease'
          }}>
            PAI$A WA$OOL
          </div>

          {/* Desktop Nav Actions (Theme, Demo, Login, Started) */}
          <div className="desktop-nav" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button 
              onClick={toggleTheme} 
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              style={{
                background: 'transparent',
                color: 'var(--text-muted-secondary)',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <button 
              onClick={handleDemo} 
              className="btn-secondary" 
              disabled={demoLoading}
              style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {demoLoading ? '...' : <><Play size={16} /> Live Demo</>}
            </button>

            <button onClick={() => setShowLogin(true)} className="btn-secondary" style={{ padding: '10px 24px' }}>
              Login
            </button>
            <button onClick={handleCTA} className="btn-primary" style={{ padding: '10px 24px' }}>
              Get Started
            </button>
          </div>

          {/* Mobile Nav Actions (Demo, Started, Toggle) */}
          <div className="mobile-actions" style={{ display: 'none', gap: '8px', alignItems: 'center' }}>
            <button 
              onClick={handleDemo} 
              className="btn-secondary" 
              aria-label="Live Demo"
              disabled={demoLoading}
              style={{ padding: '8px', borderRadius: '8px' }}
            >
              <Play size={20} />
            </button>
            <button onClick={handleCTA} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
              Start
            </button>
            <button 
              className="mobile-menu-btn" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle Menu"
              style={{ background: 'transparent', color: 'var(--text-main)', padding: '4px' }}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="mobile-nav-overlay" style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--bg-surface)',
            padding: '20px',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: 'var(--shadow-glass)'
          }}>
            <button onClick={() => { setShowLogin(true); setIsMenuOpen(false); }} className="btn-secondary" style={{ width: '100%' }}>
              Login
            </button>
            <button onClick={() => { handleCTA(); setIsMenuOpen(false); }} className="btn-primary" style={{ width: '100%' }}>
              Get Started
            </button>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
               <button 
                onClick={toggleTheme} 
                aria-label="Toggle Theme"
                style={{ background: 'transparent', color: 'var(--text-main)', padding: '10px' }}
              >
                {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
              </button>
            </div>
          </div>
        )}
      </header>

      <main>
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
              <button onClick={handleDemo} className="btn-secondary" disabled={demoLoading} style={{ 
                padding: '18px 40px', 
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {demoLoading ? '...' : <><Play size={20} /> Live Demo</>}
              </button>
            </div>
          </div>
          
          <div className="landing-hero-image-container">
            <img 
              src={heroImg} 
              alt="PAI$A WA$OOL Dashboard Visualization" 
              className="landing-hero-image"
              loading="eager"
            />
          </div>
        </section>

        {/* Features Section */}
        <section className="landing-features" id="features">
          <h2 className="landing-features-title">Why PAI$A WA$OOL?</h2>
          <p className="landing-features-subtitle">Everything you need to take control of your finances</p>
          
          <div className="landing-features-grid">
            <article className="card feature-card">
              <div className="feature-icon" aria-hidden="true">
                <Bot size={32} />
              </div>
              <h3>AI Auto-Categorization</h3>
              <p>Our ML model instantly categorizes your expenses — food, travel, shopping, utilities, and more. No manual tagging needed.</p>
            </article>
            
            <article className="card feature-card">
              <div className="feature-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--brand-accent)' }} aria-hidden="true">
                <PieChart size={32} />
              </div>
              <h3>Smart Dashboard</h3>
              <p>Beautiful visualizations of your spending patterns. See where every rupee goes with interactive charts and breakdowns.</p>
            </article>
            
            <article className="card feature-card">
              <div className="feature-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)' }} aria-hidden="true">
                <Wallet size={32} />
              </div>
              <h3>Budget Tracking</h3>
              <p>Set monthly limits and get real-time progress tracking. Never overshoot your budget again with smart alerts.</p>
            </article>
            
            <article className="card feature-card">
              <div className="feature-icon" style={{ background: 'rgba(13, 148, 136, 0.1)', color: 'var(--brand-secondary)' }} aria-hidden="true">
                <Brain size={32} />
              </div>
              <h3>Financial AI Advisor</h3>
              <p>Get personalized financial advice powered by AI. Ask anything about your spending habits and get instant insights.</p>
            </article>
          </div>
        </section>

        {/* How It Works */}
        <section className="landing-steps">
          <h2 className="landing-steps-title">How It Works</h2>
          <div className="steps-grid">
            <div className="step-item">
              <div className="step-number" aria-hidden="true">1</div>
              <div>
                <h3>Add Your Transactions</h3>
                <p>Simply enter your expenses or income. Describe what you spent on and let AI handle the rest.</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number" aria-hidden="true">2</div>
              <div>
                <h3>AI Categorizes Instantly</h3>
                <p>Our machine learning model categorizes each transaction in milliseconds. Review and correct if needed.</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number" aria-hidden="true">3</div>
              <div>
                <h3>Get Smart Insights</h3>
                <p>See spending patterns, track budgets, and ask the AI advisor for personalized financial strategies.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Key Stats */}
        <section className="landing-features" style={{ paddingTop: '40px' }}>
          <div className="responsive-stats-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '24px',
            textAlign: 'center'
          }}>
            <div className="card" style={{ padding: '40px 20px' }}>
              <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--brand-primary)', marginBottom: '8px' }} aria-hidden="true">
                <TrendingUp size={48} style={{ marginBottom: '12px' }} />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--brand-accent)' }}>10+</div>
              <div style={{ color: 'var(--text-muted-secondary)', marginTop: '8px' }}>Expense Categories</div>
            </div>
            <div className="card" style={{ padding: '40px 20px' }}>
              <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--brand-primary)', marginBottom: '8px' }} aria-hidden="true">
                <Shield size={48} style={{ marginBottom: '12px' }} />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--brand-accent)' }}>100%</div>
              <div style={{ color: 'var(--text-muted-secondary)', marginTop: '8px' }}>Secure & Private</div>
            </div>
            <div className="card" style={{ padding: '40px 20px' }}>
              <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--brand-primary)', marginBottom: '8px' }} aria-hidden="true">
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
      </main>

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

      {/* Basic Mobile Nav CSS shim */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-actions { display: flex !important; }
          nav { padding: 8px 16px !important; }
        }
        @media (max-width: 400px) {
          .logo-text { font-size: 1.2rem !important; }
          nav { padding: 8px 12px !important; }
          .mobile-actions { gap: 4px !important; }
        }
        @media (max-width: 340px) {
           .logo-text { font-size: 1.1rem !important; }
        }
        @media (min-width: 769px) {
          .mobile-nav-overlay { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
