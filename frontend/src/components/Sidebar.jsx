import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, LogOut, Wallet, Sparkles, Moon, Sun, ShieldCheck, HelpCircle } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const Sidebar = () => {
  const { logout, user } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isAdmin = user?.role === 'admin';

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <span>PAI$A</span> WA$OOL
      </div>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }} className="hide-scrollbar">
        {isAdmin ? (
          /* ── ADMIN NAVIGATION ── */
          <>
            <NavLink to="/admin" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <ShieldCheck size={20} /> Admin Panel
            </NavLink>
          </>
        ) : (
          /* ── USER NAVIGATION ── */
          <>
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} /> Dashboard
            </NavLink>
            <NavLink to="/transactions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Receipt size={20} /> Transactions
            </NavLink>
            <NavLink to="/budget" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Wallet size={20} /> Budget Limit
            </NavLink>
            <NavLink to="/advisor" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Sparkles size={20} /> AI Advisor
            </NavLink>
            <NavLink to="/help" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
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
        <button onClick={logout} className="nav-link" style={{ width: '100%', textAlign: 'left', background: 'transparent' }}>
          <LogOut size={20} /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
