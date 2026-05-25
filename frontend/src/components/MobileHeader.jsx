import React from 'react';
import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

const MobileHeader = ({ onMenuClick }) => {
  return (
    <div className="mobile-header">
      <Link to="/" className="mobile-logo" style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
        <span>PAI$A</span> WA$OOL
      </Link>
      <button 
        onClick={onMenuClick} 
        className="hamburger-btn"
        aria-label="Toggle navigation menu"
      >
        <Menu size={28} />
      </button>
    </div>
  );
};

export default MobileHeader;
