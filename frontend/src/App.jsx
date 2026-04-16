import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Transactions from './pages/Transactions';
import Budget from './pages/Budget';
import AIAdvisor from './pages/AIAdvisor';
import LandingPage from './pages/LandingPage';
import AdminPanel from './pages/AdminPanel';
import HelpFeedback from './pages/HelpFeedback';

/** Route wrapper for regular users (not admin) */
const UserRoute = ({ children }) => {
  const { token, user } = useContext(AuthContext);
  if (!token) return <Navigate to="/welcome" />;
  // Admin should not access user pages
  if (user?.role === 'admin') return <Navigate to="/admin" />;
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

/** Route wrapper for admin only */
const AdminRoute = ({ children }) => {
  const { token, user } = useContext(AuthContext);
  if (!token) return <Navigate to="/welcome" />;
  if (user?.role !== 'admin') return <Navigate to="/" />;
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

function AppRoutes() {
  const { token, user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  return (
    <Routes>
      <Route path="/welcome" element={token ? <Navigate to={isAdmin ? "/admin" : "/"} /> : <LandingPage />} />
      <Route path="/login" element={token ? <Navigate to={isAdmin ? "/admin" : "/"} /> : <Login />} />

      {/* User-only routes */}
      <Route path="/" element={<UserRoute><Dashboard /></UserRoute>} />
      <Route path="/transactions" element={<UserRoute><Transactions /></UserRoute>} />
      <Route path="/budget" element={<UserRoute><Budget /></UserRoute>} />
      <Route path="/advisor" element={<UserRoute><AIAdvisor /></UserRoute>} />
      <Route path="/help" element={<UserRoute><HelpFeedback /></UserRoute>} />

      {/* Admin-only route */}
      <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to={token ? (isAdmin ? "/admin" : "/") : "/welcome"} />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
