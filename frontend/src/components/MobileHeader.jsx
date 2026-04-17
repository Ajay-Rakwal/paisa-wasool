import React from 'react';
import { Menu } from 'lucide-react';

const MobileHeader = ({ onMenuClick }) => {
  return (
    <div className="mobile-header">
      <div className="mobile-logo">
        <span>PAI$A</span> WA$OOL
      </div>
      <button onClick={onMenuClick} className="hamburger-btn">
        <Menu size={28} />
      </button>
    </div>
  );
};

export default MobileHeader;
