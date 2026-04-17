import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, LogOut, Wallet, Sparkles, Moon, Sun, ShieldCheck, HelpCircle } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { logout, user } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    logout();
    if (closeSidebar) closeSidebar();
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <span>PAI$A</span> WA$OOL
      </div>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }} className="hide-scrollbar">
        {isAdmin ? (
          /* ── ADMIN NAVIGATION ── */
          <>
            <NavLink to="/admin" end onClick={closeSidebar} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <ShieldCheck size={20} /> Admin Panel
            </NavLink>
          </>
        ) : (
          /* ── USER NAVIGATION ── */
          <>
            <NavLink to="/" end onClick={closeSidebar} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} /> Dashboard
            </NavLink>
            <NavLink to="/transactions" onClick={closeSidebar} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Receipt size={20} /> Transactions
            </NavLink>
            <NavLink to="/budget" onClick={closeSidebar} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Wallet size={20} /> Budget Limit
            </NavLink>
            <NavLink to="/advisor" onClick={closeSidebar} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Sparkles size={20} /> AI Advisor
            </NavLink>
            <NavLink to="/help" onClick={closeSidebar} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <HelpCircle size={20} /> Help & Feedback
            </NavLink>
          </>
        )}
      </div>
      <div style={{ padding: '0 12px' }}>
        <button onClick={toggleTheme} className="theme-toggle">
          <span className="toggle-icon">{theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}</span>
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button onClick={handleLogout} className="nav-link" style={{ width: '100%', textAlign: 'left', background: 'transparent' }}>
          <LogOut size={20} /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
